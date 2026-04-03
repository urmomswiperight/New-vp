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
    const liAt = process.env.LI_AT;
    
    if (liSession) {
        try {
            console.log('Injecting full LinkedIn session from LI_SESSION JSON...');
            const state = JSON.parse(liSession);
            // Storage state contains { cookies, origins }
            if (state.cookies) {
                await context.addCookies(state.cookies);
            }
            // For origins (localStorage), we can't easily inject them into a fresh context 
            // without a page, but cookies are usually sufficient for LinkedIn.
            console.log(`Successfully injected ${state.cookies?.length || 0} cookies.`);
            return;
        } catch (e: any) {
            console.error('Failed to parse LI_SESSION JSON:', e.message);
        }
    }

    if (liAt) {
        console.log('Injecting LI_AT cookie (Legacy Mode)...');
        await context.addCookies([
            {
                name: 'li_at',
                value: liAt,
                domain: '.www.linkedin.com',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            }
        ]);
    } else {
        console.warn('WARNING: Neither LI_SESSION nor LI_AT environment variables are set. LinkedIn will likely show an authwall/login screen.');
    }
}

/**
 * Verifies if the current page is logged into LinkedIn.
 * Visits the feed and checks for common UI elements.
 */
export async function checkSessionHealth(page: Page): Promise<boolean> {
    try {
        console.log('Checking session health (Navigating to LinkedIn feed)...');
        // Faster load by waiting only for DOM
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait for elements that only appear when logged in
        const loggedIn = await page.waitForSelector([
            '.feed-identity-module',
            '.global-nav__me-photo',
            'button[aria-label="Account Menu"]',
            '.search-global-typeahead'
        ].join(','), { timeout: 10000 }).catch(() => null);

        if (loggedIn) {
            console.log('✅ Session is healthy (Logged in).');
            return true;
        }

        // Check for common indicators of not being logged in
        const loginForm = await page.$('form.login__form, input[name="session_key"], a[href*="login"]');
        if (loginForm) {
            console.warn('❌ Session EXPIRED: LinkedIn is showing the login form.');
        } else if (await page.$('.authwall-container')) {
            console.warn('❌ Session BLOCKED: LinkedIn is showing an authwall.');
        } else {
            console.warn('❓ Session Status UNKNOWN: Taking screenshot for debugging.');
        }

        return false;
    } catch (e: any) {
        console.error('Error during session health check:', e.message);
        return false;
    }
}
