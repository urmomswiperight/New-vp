import type { BrowserContext, Page } from 'playwright-core';
import prisma from '@/lib/prisma';

/**
 * Loads the LinkedIn session from the database (Config table).
 * Falls back to environment variable if not found.
 */
export async function loadSessionFromDb(): Promise<string | null> {
    try {
        const config = await (prisma as any).config.findUnique({
            where: { key: 'LI_SESSION' }
        });
        
        if (config && config.value && config.value !== '{}') {
            console.log('✅ Loaded session from database.');
            return config.value;
        }
    } catch (e) {
        console.warn('⚠️ Could not load session from DB (Config table may not exist yet).');
    }
    
    return process.env.LI_SESSION || null;
}

/**
 * Saves the current browser context state to the database.
 */
export async function saveSessionToDb(context: BrowserContext): Promise<void> {
    try {
        const state = await context.storageState();
        const sessionJson = JSON.stringify(state);
        
        await (prisma as any).config.upsert({
            where: { key: 'LI_SESSION' },
            update: { value: sessionJson, updatedAt: new Date() },
            create: { key: 'LI_SESSION', value: sessionJson }
        });
        
        console.log('💾 Fresh session saved to database.');
    } catch (e: any) {
        console.error('❌ Failed to save session to DB:', e.message);
    }
}

/**
 * Injects full Playwright storageState JSON into the browser context.
 * Prioritizes cookies. localStorage injection is now optional to reduce noise.
 */
export async function injectFullStorageState(context: BrowserContext, sessionJson: string, includeLocalStorage: boolean = false) {
    try {
        const storageState = JSON.parse(sessionJson);
        const cookies = storageState.cookies || [];
        
        if (cookies.length > 0) {
            const cleanCookies = cookies.map((c: any) => ({
                name: String(c.name),
                value: String(c.value),
                domain: c.domain?.startsWith('.') ? c.domain : `.${c.domain || 'www.linkedin.com'}`,
                path: c.path || '/',
                httpOnly: !!(c.httpOnly ?? true),
                secure: true,
                sameSite: (c.sameSite?.toLowerCase() === 'strict' ? 'Strict' : (c.sameSite?.toLowerCase() === 'lax' ? 'Lax' : 'None')) as any
            }));
            await context.addCookies(cleanCookies);
            console.log(`✅ Injected ${cleanCookies.length} cookies.`);
        }

        // Inject LocalStorage (origins) - ONLY if explicitly requested
        if (includeLocalStorage) {
            const origins = storageState.origins || [];
            if (origins.length > 0) {
                const page = await context.newPage();
                for (const origin of origins) {
                    try {
                        console.log(`Injecting localStorage for ${origin.origin}...`);
                        await page.goto(origin.origin, { waitUntil: 'commit', timeout: 15000 });
                        await page.evaluate((data) => {
                            for (const item of data) {
                                localStorage.setItem(item.name, item.value);
                            }
                        }, origin.localStorage);
                    } catch (e) {
                        console.warn(`Failed to inject localStorage for ${origin.origin}:`, e);
                    }
                }
                await page.close();
            }
        }
        
        return { success: true, cookieCount: cookies.length };
    } catch (e: any) {
        console.error('Failed to inject storage state:', e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Checks the login health of the LinkedIn session.
 * Returns 'LOGGED_IN' | 'LOGGED_OUT' | 'CHALLENGED'.
 * Uses ARIA roles for resilience.
 */
export async function checkLoginHealth(page: Page): Promise<'LOGGED_IN' | 'LOGGED_OUT' | 'CHALLENGED'> {
    try {
        // Block heavy resources for faster, low-memory health check
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'font', 'media'].includes(type)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        // Use domcontentloaded for speed, as recommended in research
        console.log('🔍 Checking login health...');
        await page.goto('https://www.linkedin.com/feed/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });

        // 1. Check for logged in state (Home link in global nav)
        const homeLink = page.getByRole('link', { name: 'Home', exact: true });
        if (await homeLink.isVisible()) {
            console.log('✅ Health Check: LOGGED_IN (Home visible)');
            return 'LOGGED_IN';
        }

        // 2. Check for login redirect or authwall
        const url = page.url();
        if (url.includes('/login') || url.includes('/authwall')) {
            console.log(`ℹ️ Health Check: LOGGED_OUT (URL: ${url})`);
            return 'LOGGED_OUT';
        }

        // 3. Check for security challenges / CAPTCHA
        const securityCheck = page.getByText(/Security Check/i);
        const captcha = page.locator('#captcha-internal');
        if (await securityCheck.isVisible() || await captcha.isVisible() || url.includes('/checkpoint/')) {
            console.warn(`⚠️ Health Check: CHALLENGED (URL: ${url})`);
            return 'CHALLENGED';
        }

        // Fallback: Check for 'Me' menu
        const meMenu = page.getByRole('button', { name: /Me/i }).first();
        if (await meMenu.isVisible()) {
            console.log('✅ Health Check: LOGGED_IN (Me visible)');
            return 'LOGGED_IN';
        }

        console.log('ℹ️ Health Check: LOGGED_OUT (No indicators)');
        return 'LOGGED_OUT';
    } catch (e) {
        console.error('Health check failed:', e);
        return 'LOGGED_OUT';
    }
}

/**
 * Performs automated login using provided credentials.
 */
export async function performLogin(page: Page): Promise<boolean> {
    const username = process.env.LI_USERNAME;
    const password = process.env.LI_PASSWORD;

    if (!username || !password) {
        console.error('❌ Missing LI_USERNAME or LI_PASSWORD for automated login.');
        return false;
    }

    try {
        console.log(`🚀 Attempting automated login for: ${username.substring(0, 3)}...`);
        
        // Block only images and media (Stylesheets are often needed for JS to show the form)
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'font', 'media'].includes(type)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for the form to actually appear in the DOM
        console.log('Waiting for login fields...');
        const selectors = ['#username', 'input[name="session_key"]', '#session_key', 'input[type="email"]'];
        let usernameField = null;

        for (const selector of selectors) {
            try {
                const el = await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
                if (el) {
                    usernameField = page.locator(selector).first();
                    break;
                }
            } catch (e) {}
        }

        if (!usernameField) {
            const pageTitle = await page.title();
            console.error(`❌ Login fields not found. URL: ${page.url()}, Title: ${pageTitle}`);
            // Check if we are on a challenge page already
            if (page.url().includes('checkpoint')) {
                console.warn('⚠️ Stuck at a security checkpoint before login even started.');
            }
            return false;
        }

        const passwordField = page.locator('#password, input[name="session_password"], #session_password').first();
        const submitButton = page.locator('button[type="submit"], .login__form_action_container button').first();

        await usernameField.fill(username);
        await passwordField.fill(password);
        
        console.log('Submitting login form...');
        await submitButton.click();
        
        // Wait for page state to change
        await page.waitForTimeout(10000);
        
        const currentUrl = page.url();
        console.log(`Current URL after submit: ${currentUrl}`);
        
        // Check for specific security roadblocks
        if (currentUrl.includes('/checkpoint/') || currentUrl.includes('challenge') || currentUrl.includes('/captcha')) {
            console.error('❌ SECURITY CHALLENGE detected (2FA/CAPTCHA). Manual login REQUIRED to refresh database cookies.');
            return false;
        }

        // Final verification
        const status = await checkLoginHealth(page);
        if (status === 'LOGGED_IN') {
            console.log('✅ Automated login successful!');
            await saveSessionToDb(page.context());
            return true;
        }

        console.error(`❌ Automated login failed. Status: ${status}. URL: ${currentUrl}`);
        return false;
    } catch (e: any) {
        console.error('❌ Automated login Exception:', e.message);
        return false;
    }
}
