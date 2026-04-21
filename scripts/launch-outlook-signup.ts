import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function launchBrowser() {
    const userDataDir = path.resolve(process.cwd(), '.playwright-sessions/outlook-signup');
    
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    console.log('🚀 Launching browser for Outlook/Hotmail sign-ups...');
    console.log('📂 Session data will be saved in:', userDataDir);
    console.log('ℹ️  Tip: After creating an account, go to Settings > Mail > Sync email and enable "POP and IMAP".');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 800 },
        args: ['--start-maximized']
    });

    const page = await context.newPage();
    await page.goto('https://signup.live.com/signup');

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
