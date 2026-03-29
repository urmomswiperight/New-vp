import { chromium } from 'playwright-extra';
// @ts-ignore
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

async function main() {
    console.log('Testing browser with playwright-extra Stealth...');
    const stealth = StealthPlugin();
    chromium.use(stealth);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        await page.goto('https://www.linkedin.com/login', { timeout: 30000 });
        console.log('✅ Reached LinkedIn Login page with playwright-extra Stealth');
    } catch (e: any) {
        console.error('❌ Failed to reach LinkedIn Login with Stealth:', e.message);
        await page.screenshot({ path: 'stealth-error.png' });
    } finally {
        await browser.close();
    }
}
main();
