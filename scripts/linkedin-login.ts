import { chromium } from 'playwright';
import path from 'path';

async function login() {
    const userDataDir = path.join(process.cwd(), '.playwright-sessions');
    console.log(`Opening browser with profile in: ${userDataDir}`);
    console.log('PLEASE LOG IN TO LINKEDIN MANUALLY IN THE OPENED WINDOW.');
    console.log('Once logged in, you can close the browser or press Ctrl+C here.');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: 'msedge', // Use system Edge
        viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();
    await page.goto('https://www.linkedin.com/login');

    // Keep the browser open until the user closes it
    page.on('close', () => process.exit());
}

login();
