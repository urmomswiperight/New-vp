import type { Browser, BrowserContext, Page } from 'playwright-core';

/**
 * Connects to Browserless.io with improved retry logic and exponential backoff.
 * Helps mitigate 429 Too Many Requests errors.
 */
export async function connectToBrowserless(maxRetries: number = 5): Promise<Browser> {
    const auth = process.env.BROWSERLESS_WSS;
    
    if (!auth) {
        throw new Error('BROWSERLESS_WSS is not defined. Please check your environment variables.');
    }

    if (!auth.includes('token=')) {
        console.warn('WARNING: BROWSERLESS_WSS does not contain a ?token=... parameter. This will likely cause 429 errors.');
    }

    // Dynamic imports for Vercel compatibility
    const { chromium: baseChromium } = await import('playwright-core');
    const { addExtra } = await import('playwright-extra');
    const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth');
    
    // Create the "extra" version of chromium
    const chromium = addExtra(baseChromium);
    
    // Add stealth plugin
    try {
        chromium.use(StealthPlugin());
    } catch (e) {
        // Ignore if already added
    }

    let retries = 0;
    while (retries < maxRetries) {
        try {
            console.log(`Connecting to Browserless.io (Attempt ${retries + 1}/${maxRetries})...`);
            const browser = await chromium.connectOverCDP(auth);
            return browser;
        } catch (e: any) {
            retries++;
            if (retries >= maxRetries) {
                console.error(`Failed to connect to Browserless after ${maxRetries} attempts: ${e.message}`);
                throw e;
            }

            // Exponential backoff
            const waitTime = Math.pow(2, retries - 1) * 5000 + Math.random() * 2000;
            
            let extraHelp = '';
            if (e.message.includes('429')) {
                extraHelp = ' (Hint: Check if your BROWSERLESS_WSS includes a valid token=... and that you haven\'t hit your plan\'s concurrency limit)';
            }
            
            console.warn(`Connection failed (429 or other): ${e.message}${extraHelp}. Retrying in ${Math.round(waitTime/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error('Unreachable: Failed to connect to Browserless.');
}

/**
 * Injects LinkedIn authentication state (cookies + storage) if available.
 * Supports LI_SESSION (JSON string) or LI_AT (legacy single cookie).
 */
export async function injectLinkedInAuth(context: BrowserContext) {
    const liSession = process.env.LI_SESSION;
    
    if (liSession) {
        try {
            console.log('LinkedIn Auth: Parsing LI_SESSION...');
            const state = JSON.parse(liSession);
            let rawCookies = Array.isArray(state) ? state : (state.cookies || []);

            if (rawCookies.length > 0) {
                // Clean cookies: Playwright is very strict about the schema
                const cleanCookies = rawCookies.map((c: any) => {
                    // Extract only the fields Playwright supports
                    const cookie: any = {
                        name: String(c.name),
                        value: String(c.value),
                        domain: c.domain?.startsWith('.') ? c.domain : `.${c.domain || 'www.linkedin.com'}`,
                        path: c.path || '/',
                        httpOnly: c.httpOnly ?? true,
                        secure: c.secure ?? true,
                        sameSite: c.sameSite || 'None'
                    };
                    
                    // Convert expiration if present
                    if (c.expirationDate) cookie.expires = c.expirationDate;
                    else if (c.expires) cookie.expires = c.expires;

                    return cookie;
                });

                await context.addCookies(cleanCookies);
                console.log(`✅ LI_SESSION: Injected ${cleanCookies.length} cookies.`);
                return;
            }
        } catch (e: any) {
            console.error('❌ LI_SESSION: Failed to parse JSON:', e.message);
        }
    }

    const liAt = process.env.LI_AT;
    if (liAt) {
        console.log('LinkedIn Auth: Using LI_AT (Legacy)...');
        await context.addCookies([{
            name: 'li_at',
            value: liAt,
            domain: '.www.linkedin.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }]);
    } else {
        console.warn('⚠️ No LinkedIn session found in environment variables.');
    }
}

/**
 * Verifies if the current page is logged into LinkedIn.
 */
export async function checkSessionHealth(page: Page): Promise<boolean> {
    try {
        console.log('LinkedIn Health: Checking login state...');
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Check for specific logged-in markers
        const markers = [
            '.feed-identity-module',
            '.global-nav__me-photo',
            '.search-global-typeahead',
            'button[aria-label="Account Menu"]'
        ];

        for (const selector of markers) {
            const el = await page.$(selector);
            if (el) {
                console.log(`✅ LinkedIn Health: Found marker (${selector}). Logged in.`);
                return true;
            }
        }

        // If markers fail, check for negative indicators
        const html = await page.content();
        if (html.includes('authwall') || html.includes('login__form')) {
            console.error('❌ LinkedIn Health: Logged out (Authwall/Login form detected).');
        } else {
            console.error('❌ LinkedIn Health: Unknown state (Markers not found).');
        }

        return false;
    } catch (e: any) {
        console.error('❌ LinkedIn Health: Error during check:', e.message);
        return false;
    }
}
