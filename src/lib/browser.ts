import type { Browser, BrowserContext, Page } from 'playwright-core';
import axios from 'axios';
import { chromium } from 'playwright-core';
import { checkLoginHealth } from './linkedin/session';

/**
 * FIXED_USER_AGENT is used to provide a consistent browser identity.
 */
export const FIXED_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Executes a scrape via ScrapingBee's REST API.
 */
export async function scrapeWithScrapingBee(
    url: string, 
    params: { 
        render_js?: boolean; 
        premium_proxy?: boolean; 
        country_code?: string;
        custom_js?: string; 
    } = {}
) {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) throw new Error('SCRAPINGBEE_API_KEY is not defined.');

    try {
        console.log(`🚀 ScrapingBee: ${url}`);
        const response = await axios.get('https://app.scrapingbee.com/api/v1', {
            params: {
                api_key: apiKey,
                url: url,
                render_js: params.render_js ?? true,
                premium_proxy: params.premium_proxy ?? true,
                country_code: params.country_code ?? 'us',
                ...params
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('❌ ScrapingBee failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Connects to Browserless.io using Vanilla Playwright (No Plugins)
 * This is the most stable method for Vercel/Serverless environments.
 */
export async function connectToBrowserless(maxRetries: number = 5): Promise<Browser> {
    const wssUrl = process.env.BROWSERLESS_WSS;
    
    if (!wssUrl) {
        throw new Error('BROWSERLESS_WSS is not defined.');
    }

    // If a token is provided in the URL, use it, otherwise add it as a query param
    const authUrl = wssUrl.includes('token=') ? wssUrl : `${wssUrl}?token=${process.env.BROWSERLESS_TOKEN || 'your-secret-token'}`;

    let retries = 0;
    while (retries < maxRetries) {
        try {
            console.log(`Connecting to Browserless (Attempt ${retries + 1})...`);
            return await chromium.connectOverCDP(authUrl);
        } catch (e: any) {
            retries++;
            console.warn(`Connection attempt ${retries} failed: ${e.message}`);
            if (retries >= maxRetries) throw e;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    throw new Error('Failed to connect to Browserless.');
}

/**
 * Verifies login state. 
 * Re-exported for compatibility with older API routes.
 */
export async function checkSessionHealth(page: Page): Promise<boolean> {
    const status = await checkLoginHealth(page);
    return status === 'LOGGED_IN';
}

/**
 * Injects LinkedIn authentication state
 */
export async function injectLinkedInAuth(context: BrowserContext) {
    const liSession = process.env.LI_SESSION;
    if (!liSession) {
        console.warn('⚠️ No LI_SESSION found.');
        return;
    }

    try {
        const state = JSON.parse(liSession);
        const rawCookies = Array.isArray(state) ? state : (state.cookies || []);

        const cleanCookies = rawCookies.map((c: any) => ({
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
    } catch (e: any) {
        console.error('❌ Cookie injection failed:', e.message);
    }
}
