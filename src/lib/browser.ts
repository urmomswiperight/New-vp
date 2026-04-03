import type { Browser, BrowserContext } from 'playwright-core';

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
 * Injects LinkedIn authentication cookies if available in environment variables.
 * This is crucial for Vercel where the filesystem is ephemeral.
 */
export async function injectLinkedInCookies(context: BrowserContext) {
    const liAt = process.env.LI_AT;
    
    if (liAt) {
        console.log('Injecting LI_AT cookie for authentication...');
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
        console.warn('WARNING: LI_AT environment variable is not set. LinkedIn will likely show an authwall/login screen.');
    }
}
