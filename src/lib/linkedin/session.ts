import type { BrowserContext, Page } from 'playwright-core';

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
        // Use domcontentloaded for speed, as recommended in research
        await page.goto('https://www.linkedin.com/feed/', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });

        // 1. Check for logged in state (Home link in global nav)
        // Using getByRole as per Pattern 2 in 08-RESEARCH.md
        const homeLink = page.getByRole('link', { name: 'Home', exact: true });
        if (await homeLink.isVisible()) {
            return 'LOGGED_IN';
        }

        // 2. Check for login redirect or authwall
        const url = page.url();
        if (url.includes('/login') || url.includes('/authwall')) {
            return 'LOGGED_OUT';
        }

        // 3. Check for security challenges / CAPTCHA
        const securityCheck = page.getByText(/Security Check/i);
        const captcha = page.locator('#captcha-internal');
        if (await securityCheck.isVisible() || await captcha.isVisible()) {
            return 'CHALLENGED';
        }

        // Fallback: Check for 'Me' menu which is another strong indicator of being logged in
        // Use .first() to avoid strict mode violations if multiple elements exist
        const meMenu = page.getByRole('button', { name: /Me/i }).first();
        if (await meMenu.isVisible()) {
            return 'LOGGED_IN';
        }

        // Additional indicator: Check for 'Account' or profile photo
        const profilePhoto = page.getByAltText(/Photo of/i).first();
        if (await profilePhoto.isVisible()) {
            return 'LOGGED_IN';
        }

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
        console.log('🚀 Attempting automated login...');
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        await page.fill('#username', username);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');
        
        // Wait for potential challenge or navigation
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        
        return true;
    } catch (e: any) {
        console.error('❌ Automated login failed:', e.message);
        return false;
    }
}
