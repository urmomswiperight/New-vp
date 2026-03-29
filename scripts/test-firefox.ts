import { firefox } from 'playwright';

async function main() {
    console.log('Testing browser with Firefox...');
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        await page.goto('https://www.linkedin.com/login', { timeout: 20000 });
        console.log('✅ Reached LinkedIn Login page with Firefox');
    } catch (e: any) {
        console.error('❌ Failed to reach LinkedIn Login with Firefox:', e.message);
    } finally {
        await browser.close();
    }
}
main();
