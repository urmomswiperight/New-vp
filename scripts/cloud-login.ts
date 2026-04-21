import { chromium } from 'playwright-core';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function cloudLogin() {
    console.log('🚀 Connecting to Browserless with Heartbeat (KEEP-ALIVE)...');
    
    // Add cloud-specific keep-alive and stealth parameters
    const wssUrl = `${process.env.BROWSERLESS_WSS}&stealth=true&--window-size=1280,720&keep-alive=true`;
    
    let browser;
    try {
        console.log('🔗 Connecting to Browserless Cloud (10min timeout)...');
        browser = await chromium.connectOverCDP(wssUrl);
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();
        console.log('🌐 Navigating to LinkedIn Login...');
        
        // Use a longer timeout for the initial load
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('\n--- ACTION REQUIRED ---');
        console.log('1. Go to: https://cloud.browserless.io/dashboard');
        console.log('2. Click on "Active Sessions".');
        console.log('3. Click "Live View" or "Interact" IMMEDIATELY.');
        console.log('4. Log in to LinkedIn manually.');
        console.log('------------------------\n');

        let loggedIn = false;
        const startTime = Date.now();
        const timeout = 10 * 60 * 1000; // 10 minutes

        while (Date.now() - startTime < timeout) {
            try {
                if (page.isClosed()) {
                    throw new Error('Browser window was closed.');
                }

                // HEARTBEAT: Perform a tiny action to keep the session alive
                await page.evaluate(() => {
                    window.scrollBy(0, 1);
                    window.scrollBy(0, -1);
                }).catch(() => {});

                const currentUrl = page.url();
                if (currentUrl.includes('/feed')) {
                    loggedIn = true;
                    break;
                }
                
                process.stdout.write('.'); // Show progress in terminal
            } catch (e: any) {
                if (e.message.includes('closed')) throw e;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!loggedIn) {
            throw new Error('Login timeout reached.');
        }

        console.log('\n✅ Login detected! Capturing session...');
        await new Promise(r => setTimeout(r, 5000));
        
        const storage = await context.storageState();
        fs.writeFileSync('LI_SESSION_CLOUD.json', JSON.stringify(storage));
        
        console.log('\n✅ Saved CLOUD session to LI_SESSION_CLOUD.json');

    } catch (e: any) {
        console.error('\n❌ ERROR:', e.message);
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

cloudLogin();
