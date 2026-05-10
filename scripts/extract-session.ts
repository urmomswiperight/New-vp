import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function extract() {
    console.log('🚀 Opening Stealth Browser for Session Extraction...');
    console.log('💡 INSTRUCTIONS:');
    console.log('1. A browser window will open.');
    console.log('2. Log in to LinkedIn manually.');
    console.log('3. Once you are on the Feed page, wait 5 seconds.');
    console.log('4. Close the browser window.');

    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    await page.goto('https://www.linkedin.com/login');

    // Wait for the browser to close or for the user to finish
    await new Promise((resolve) => {
        browser.on('disconnected', resolve);
        // Also resolve if they navigate to feed and we detect it
        const checkInterval = setInterval(async () => {
            if (page.url().includes('/feed')) {
                console.log('✅ Detected Login! Capturing state in 5 seconds...');
                clearInterval(checkInterval);
                setTimeout(async () => {
                    const state = await context.storageState();
                    const sessionJson = JSON.stringify(state);
                    
                    // Save to local file
                    fs.writeFileSync('LI_SESSION_FRESH.json', sessionJson);
                    console.log('💾 SAVED: LI_SESSION_FRESH.json');
                    console.log('✅ Extraction complete! You can now close the browser.');
                    
                    // Also print a truncated version for confirmation
                    console.log(`📊 Session Size: ${sessionJson.length} characters.`);
                }, 5000);
            }
        }, 2000);
    });

    console.log('👋 Extraction script finished.');
}

extract();
