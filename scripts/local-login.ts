import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function localLogin() {
    console.log('🚀 Opening LOCAL Chrome window for LinkedIn Login...');
    
    // Launch a real headful browser on your machine
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--window-size=1280,720', '--disable-blink-features=AutomationControlled']
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();
        console.log('🌐 Navigating to LinkedIn Login...');
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

        console.log('\n--- ACTION REQUIRED ---');
        console.log('1. A Chrome window should have opened on your screen.');
        console.log('2. Log in to LinkedIn manually (enter email, password, solve CAPTCHA).');
        console.log('3. Stay logged in until you see the LinkedIn Feed.');
        console.log('------------------------\n');

        let loggedIn = false;
        // Wait up to 5 minutes for the user to log in
        const timeout = 5 * 60 * 1000;
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                if (page.isClosed()) {
                    throw new Error('Browser window was closed before login.');
                }

                const currentUrl = page.url();
                if (currentUrl.includes('/feed')) {
                    loggedIn = true;
                    break;
                }
                
                process.stdout.write('.'); // Just show progress in terminal
            } catch (e: any) {
                if (e.message.includes('closed')) throw e;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!loggedIn) {
            throw new Error('Login timeout reached or window closed.');
        }

        console.log('\n✅ Login detected! Capturing session...');
        await new Promise(r => setTimeout(r, 5000)); // Wait for all cookies to settle
        
        const storage = await context.storageState();
        const sessionPath = path.join(process.cwd(), 'LI_SESSION.json');
        fs.writeFileSync(sessionPath, JSON.stringify(storage, null, 2));
        
        console.log(`\n✅ Saved session to: ${sessionPath}`);
        console.log('You can now close the browser window.');

    } catch (e: any) {
        console.error('\n❌ ERROR:', e.message);
    } finally {
        // Keep browser open for a few seconds to confirm save, then close.
        await new Promise(r => setTimeout(r, 3000));
        if (browser) await browser.close();
    }
}

localLogin();
