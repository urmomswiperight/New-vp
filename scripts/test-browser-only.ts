import { chromium } from 'playwright';

async function main() {
    console.log('Testing browser only (no profile)...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    try {
        await page.goto('https://www.linkedin.com/login', { timeout: 20000 });
        console.log('✅ Reached LinkedIn Login page');
    } catch (e: any) {
        console.error('❌ Failed to reach LinkedIn Login:', e.message);
    } finally {
        await browser.close();
    }
}
main();
