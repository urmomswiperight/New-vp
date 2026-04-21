import { chromium } from 'playwright';
import path from 'path';

async function main() {
    console.log('Testing connectivity with google.com...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.google.com', { timeout: 15000 });
        console.log('✅ Connectivity to google.com OK');
    } catch (e: any) {
        console.error('❌ Connectivity to google.com FAILED:', e.message);
    } finally {
        await browser.close();
    }
}
main();
