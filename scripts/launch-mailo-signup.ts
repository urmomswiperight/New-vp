import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function launchBrowser() {
    const sessionIndex = process.argv[2] || '1';
    const userDataDir = path.resolve(process.cwd(), `.playwright-sessions/mailo-signup-${sessionIndex}`);
    
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    console.log(`🚀 Launching Mailo (NetCourrier) sign-up - Session ${sessionIndex}...`);
    console.log('📂 Session data saved in:', userDataDir);
    console.log('ℹ️  Sign up, then provide the Email/Password to the agent.');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1000, height: 800 },
        args: ['--start-maximized']
    });

    const page = await context.newPage();
    await page.goto('https://www.mailo.com/mailo/en/register.php');

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
