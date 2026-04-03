import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Helper to export Playwright session to a JSON string.
 */
async function exportSession() {
    const userDataDir = path.join(process.cwd(), '.playwright-sessions');
    if (!fs.existsSync(userDataDir)) {
        console.error('❌ .playwright-sessions not found. Run scripts/linkedin-login.ts first.');
        return;
    }

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: true,
        channel: 'msedge',
    });

    const storage = await context.storageState();
    const json = JSON.stringify(storage);
    
    console.log('\n--- YOUR LI_SESSION JSON ---');
    console.log(json);
    console.log('--- END ---');
    
    fs.writeFileSync('LI_SESSION.json', json);
    console.log('\n✅ Saved to LI_SESSION.json. Copy its contents into your Vercel LI_SESSION variable.');
    
    await context.close();
}

exportSession();
