/**
 * Updated connection logic to connect to your private, self-hosted Playwright runner.
 * This now includes built-in proxy support for residential IP masking.
 */
import { chromium, Browser, BrowserContext } from 'playwright-core';

export async function connectToMyRunner(proxySettings?: {
    server: string;
    username?: string;
    password?: string;
}): Promise<Browser> {
    const RUNNER_URL = process.env.MY_RUNNER_WSS; // e.g., ws://your-vps-ip:3000
    
    if (!RUNNER_URL) {
        throw new Error('MY_RUNNER_WSS environment variable is not defined.');
    }

    console.log(`Connecting to your private runner at ${RUNNER_URL}...`);
    
    // Connect to the remote Playwright server
    const browser = await chromium.connect(RUNNER_URL);
    return browser;
}

/**
 * Enhanced context creation with proxy support
 */
export async function createProtectedContext(browser: Browser, proxySettings?: {
    server: string;
    username?: string;
    password?: string;
}): Promise<BrowserContext> {
    const contextOptions: any = {
        viewport: { width: 1280, height: 720 },
    };

    if (proxySettings) {
        contextOptions.proxy = {
            server: proxySettings.server,
            username: proxySettings.username,
            password: proxySettings.password,
        };
    }

    return await browser.newContext(contextOptions);
}
