import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function launchBrowser() {
    const userDataDir = path.resolve(process.cwd(), '.playwright-sessions/gmx-signup');
    
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    console.log('🚀 Launching browser for GMX sign-ups...');
    console.log('📂 Session data will be saved in:', userDataDir);
    console.log('ℹ️  Please sign up for your GMX accounts. Once done, close the browser or press Ctrl+C here.');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 800 },
        args: ['--start-maximized']
    });

    const page = await context.newPage();
    await page.goto('https://www.gmx.com/registration/');

    // Keep the browser open until closed manually or process is killed
    context.on('close', () => {
        console.log('✅ Browser closed. Ready for next steps.');
        process.exit(0);
    });

    // Handle Ctrl+C
    process.on('SIGINT', async () => {
        console.log('\n🛑 Closing browser...');
        await context.close();
        process.exit(0);
    });
}

launchBrowser().catch(err => {
    console.error('❌ Failed to launch browser:', err);
});
