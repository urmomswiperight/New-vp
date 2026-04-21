import { connectToBrowserless } from '../src/lib/browser';
import { checkLoginHealth, injectFullStorageState } from '../src/lib/linkedin/session';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function testHealth() {
    console.log('🚀 Starting Cloud Health Check...');
    let browser;
    try {
        browser = await connectToBrowserless();
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });
        
        const sessionJson = process.env.LI_SESSION;
        if (!sessionJson) {
            console.error('❌ LI_SESSION not found in environment.');
            return;
        }

        console.log('💉 Injecting session...');
        await injectFullStorageState(context, sessionJson);
        
        const page = await context.newPage();
        console.log('🔍 Checking LinkedIn health in the cloud...');
        const health = await checkLoginHealth(page);
        
        const screenshotPath = 'logs/cloud-health-check.png';
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Screenshot saved to: ${screenshotPath}`);
        
        console.log(`\n--- RESULT ---`);
        if (health === 'LOGGED_IN') {
            console.log('✅ SUCCESS: You are logged in and ready for outreach!');
        } else {
            console.log(`⚠️ STATUS: ${health}`);
            console.log('If it says CHALLENGED, LinkedIn is asking for a captcha.');
        }
        console.log('---------------\n');

    } catch (e: any) {
        console.error('❌ FATAL ERROR:', e.message);
    } finally {
        if (browser) await browser.close();
    }
}

testHealth();
