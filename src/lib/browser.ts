const FIXED_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Connects to Browserless.io
 */
export async function connectToBrowserless(maxRetries: number = 5): Promise<Browser> {
    const auth = process.env.BROWSERLESS_WSS;
    
    if (!auth) {
        throw new Error('BROWSERLESS_WSS is not defined.');
    }

    const { chromium: baseChromium } = await import('playwright-core');
    const { addExtra } = await import('playwright-extra');
    const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth');
    
    const chromium = addExtra(baseChromium);
    try { chromium.use(StealthPlugin()); } catch (e) {}

    let retries = 0;
    while (retries < maxRetries) {
        try {
            console.log(`Connecting to Browserless (Attempt ${retries + 1})...`);
            return await chromium.connectOverCDP(auth);
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
