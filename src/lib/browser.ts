import type { Browser } from 'playwright-core';

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

            // Exponential backoff: 5s, 10s, 20s, 40s...
            // Add jitter to avoid thundering herd (multiple instances retrying at the same time)
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
