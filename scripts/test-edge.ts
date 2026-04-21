import { chromium } from 'playwright';

async function main() {
    console.log('Testing browser with Edge channel...');
    try {
        const browser = await chromium.launch({ 
            headless: true,
            channel: 'msedge'
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await page.goto('https://www.linkedin.com/login', { timeout: 20000 });
            console.log('✅ Reached LinkedIn Login page with Edge');
        } catch (e: any) {
            console.error('❌ Failed to reach LinkedIn Login with Edge:', e.message);
        } finally {
            await browser.close();
        }
    } catch (e: any) {
        console.error('❌ Edge not found or failed to launch:', e.message);
    }
}
main();
