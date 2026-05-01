import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function verify() {
    const sessionPath = path.join(process.cwd(), 'LI_SESSION.json');
    const storageState = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    try {
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);
        
        const html = await page.content();
        const isLoggedIn = html.includes('feed-identity-module') || html.includes('global-nav');
        
        if (isLoggedIn) {
            console.log('✅ SESSION IS VALID: LinkedIn Feed detected.');
        } else {
            console.log('❌ SESSION INVALID: Redirected to login.');
        }
    } catch (e: unknown) {
        console.log('❌ ERROR:', (e as Error).message);
    } finally {
        await browser.close();
    }
}
verify();
