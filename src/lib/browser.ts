import type { Browser, BrowserContext, Page } from 'playwright-core';
import axios from 'axios';

import { chromium as baseChromium } from 'playwright-core';
import { addExtra } from 'playwright-extra';

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');

const plugin = addExtra(baseChromium);

// Manually initialize and register plugins to avoid dynamic resolution issues
try {
    const stealth = StealthPlugin();
    const userPrefs = UserPreferencesPlugin();
    
    // CRITICAL: Clear dependencies property so playwright-extra doesn't try to "find" them via require()
    // since we are adding them manually in the correct order.
    if (stealth.dependencies) {
        stealth.dependencies = new Set();
    }
    
    // Adding them in order so dependencies are already satisfied
    plugin.use(userPrefs);
    plugin.use(stealth);
    
    console.log('✅ Browser plugins initialized manually (dependencies cleared).');
} catch (e: any) {
    console.error('❌ Failed to initialize browser plugins:', e.message);
}

export const FIXED_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Gets Browserless token and host from environment variables.
 */
function getBrowserlessConfig() {
    const wssUrl = process.env.BROWSERLESS_WSS;
    if (!wssUrl) throw new Error('BROWSERLESS_WSS is not defined.');

    const tokenMatch = wssUrl.match(/token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!token) throw new Error('Could not find Browserless token in BROWSERLESS_WSS');

    const hostMatch = wssUrl.match(/wss:\/\/([^/?]+)/);
    const host = hostMatch ? `https://${hostMatch[1]}` : 'https://production-sfo.browserless.io';

    return { token, host };
}

/**
 * Modern Browserless Smart Scrape API
 * Automatically escalates through HTTP fetch, residential proxies, and full headless browsers with CAPTCHA solving.
 */
export async function browserlessSmartScrape(params: {
    url: string;
    formats?: ('html' | 'markdown' | 'links' | 'screenshot' | 'pdf')[];
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { url, formats = ['markdown'], timeout = 30000 } = params;

    try {
        console.log(`🚀 SmartScraping: ${url} (${formats.join(', ')})`);
        const response = await axios.post(
            `${host}/smart-scrape?token=${token}`,
            { url, formats },
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );

        return response.data;
    } catch (error: any) {
        console.error('❌ SmartScrape failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Executes custom Puppeteer JavaScript code.
 */
export async function browserlessFunction(params: {
    code: string;
    context?: any;
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { code, context, timeout = 30000 } = params;

    try {
        const response = await axios.post(
            `${host}/function?token=${token}`,
            { code, context },
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Function failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Runs Puppeteer code and returns the downloaded file.
 */
export async function browserlessDownload(params: {
    code: string;
    context?: any;
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { code, context, timeout = 30000 } = params;

    try {
        const response = await axios.post(
            `${host}/download?token=${token}`,
            { code, context },
            { headers: { 'Content-Type': 'application/json' }, timeout, responseType: 'arraybuffer' }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Download failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Exports a webpage in various formats.
 */
export async function browserlessExport(params: {
    url: string;
    gotoOptions?: any;
    bestAttempt?: boolean;
    includeResources?: boolean;
    waitForTimeout?: number;
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { url, timeout = 30000, ...rest } = params;

    try {
        const response = await axios.post(
            `${host}/export?token=${token}`,
            { url, ...rest },
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Export failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Web search via SearXNG with optional scraping.
 */
export async function browserlessSearch(params: {
    query: string;
    limit?: number;
    lang?: string;
    country?: string;
    location?: string;
    tbs?: 'day' | 'week' | 'month' | 'year';
    sources?: ('web' | 'news' | 'images')[];
    categories?: ('github' | 'research' | 'pdf')[];
    scrapeOptions?: {
        formats?: string[];
        onlyMainContent?: boolean;
        includeTags?: string[];
        excludeTags?: string[];
    };
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { timeout = 30000, ...rest } = params;

    try {
        const response = await axios.post(
            `${host}/search?token=${token}`,
            rest,
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Search failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Discovers and maps all URLs on a website.
 */
export async function browserlessMap(params: {
    url: string;
    search?: string;
    limit?: number;
    sitemap?: 'include' | 'skip' | 'only';
    includeSubdomains?: boolean;
    ignoreQueryParameters?: boolean;
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { timeout = 30000, ...rest } = params;

    try {
        const response = await axios.post(
            `${host}/map?token=${token}`,
            rest,
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Map failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Runs a Lighthouse performance audit.
 */
export async function browserlessPerformance(params: {
    url: string;
    categories?: ('accessibility' | 'best-practices' | 'performance' | 'pwa' | 'seo')[];
    budgets?: any[];
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { url, timeout = 60000, ...rest } = params; // Performance can take longer

    try {
        const response = await axios.post(
            `${host}/performance?token=${token}`,
            { url, ...rest },
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Performance failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Crawls and scrapes a website starting from a seed URL.
 */
export async function browserlessCrawl(params: {
    url: string;
    limit?: number;
    maxDepth?: number;
    maxRetries?: number;
    allowExternalLinks?: boolean;
    allowSubdomains?: boolean;
    sitemap?: 'auto' | 'force' | 'skip';
    includePaths?: string[];
    excludePaths?: string[];
    delay?: number;
    scrapeOptions?: {
        formats?: string[];
        onlyMainContent?: boolean;
        includeTags?: string[];
        excludeTags?: string[];
        waitFor?: number;
        headers?: Record<string, string>;
        timeout?: number;
    };
    waitForCompletion?: boolean;
    pollInterval?: number;
    maxWaitTime?: number;
    timeout?: number;
}) {
    const { token, host } = getBrowserlessConfig();
    const { timeout = 30000, ...rest } = params;

    try {
        const response = await axios.post(
            `${host}/crawl?token=${token}`,
            rest,
            { headers: { 'Content-Type': 'application/json' }, timeout }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Browserless Crawl failed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Connects to Browserless.io using Playwright
 */
export async function connectToBrowserless(maxRetries: number = 5): Promise<Browser> {
    const wssUrl = process.env.BROWSERLESS_WSS;
    
    if (!wssUrl) {
        throw new Error('BROWSERLESS_WSS is not defined. Ensure it is set to your Render URL (e.g., wss://playwright-runner.onrender.com)');
    }

    // If a token is provided in the URL, use it, otherwise add it as a query param
    const authUrl = wssUrl.includes('token=') ? wssUrl : `${wssUrl}?token=${process.env.BROWSERLESS_TOKEN || 'your-secret-token'}`;

    const chromium = plugin;

    let retries = 0;
    while (retries < maxRetries) {
        try {
            console.log(`Connecting to Browserless (Attempt ${retries + 1})...`);
            return await chromium.connectOverCDP(authUrl);
        } catch (e: any) {
            retries++;
            if (retries >= maxRetries) throw e;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    throw new Error('Failed to connect to Browserless.');
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

/**
 * Verifies login state
 */
export async function checkSessionHealth(page: Page): Promise<boolean> {
    if (process.env.BYPASS_SESSION_HEALTH === 'true') return true;

    try {
        console.log('LinkedIn Health: Checking...');
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000); // Wait for hydration
        
        const html = await page.content();
        const loggedIn = html.includes('feed-identity-module') || 
                         html.includes('global-nav__me-photo') || 
                         html.includes('Account Menu');

        if (loggedIn) {
            console.log('✅ Logged in.');
            return true;
        }

        console.error('❌ Logged out or Authwall detected.');
        return false;
    } catch (e: any) {
        return false;
    }
}

// Re-export old name for compatibility if needed, but we found no callers.
export const smartScrape = browserlessSmartScrape;
