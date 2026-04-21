import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function launchBrowser() {
    const userDataDir = path.resolve(process.cwd(), '.playwright-sessions/mail-signup');
    
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    console.log('🚀 Launching browser for Mail.com sign-ups...');
    console.log('📂 Session data will be saved in:', userDataDir);
    console.log('ℹ️  Please sign up for your Mail.com accounts. Once done, close the browser.');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 800 },
        args: ['--start-maximized']
    });

    const page = await context.newPage();
    await page.goto('https://www.mail.com/registration/');

    context.on('close', () => {
        console.log('✅ Browser closed.');
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        await context.close();
        process.exit(0);
    });
}

launchBrowser().catch(err => {
    console.error('❌ Failed to launch browser:', err);
});
