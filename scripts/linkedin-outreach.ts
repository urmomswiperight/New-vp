import { chromium } from 'playwright';
import { injectFullStorageState, checkLoginHealth, performLogin, loadSessionFromDb, saveSessionToDb } from '../src/lib/linkedin/session';
import { sendConnectionRequest } from '../src/lib/linkedin/actions';
import { SELECTORS } from '../src/lib/linkedin/selectors';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
    const profileUrl = process.env.PROFILE_URL;
    const message = process.env.MESSAGE;

    if (!profileUrl || !message) {
        console.error('❌ Missing PROFILE_URL or MESSAGE environment variables.');
        process.exit(1);
    }

    console.log(`🚀 Starting LinkedIn Outreach for: ${profileUrl}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        locale: 'en-US'
    });

    try {
        // 1. Load Session
        const sessionJson = await loadSessionFromDb();
        if (sessionJson) {
            await injectFullStorageState(context, sessionJson);
        }

        const page = await context.newPage();

        // 2. Health Check
        console.log('🔍 Checking login status...');
        let loginStatus = await checkLoginHealth(page);

        if (loginStatus === 'LOGGED_OUT') {
            console.warn('⚠️ Session invalid. Attempting automated login...');
            const loggedIn = await performLogin(page);
            if (!loggedIn) {
                console.error('❌ Login failed. Stopping.');
                process.exit(1);
            }
        } else if (loginStatus === 'CHALLENGED') {
            console.error('❌ Account challenged (CAPTCHA/2FA). Stopping.');
            process.exit(1);
        }

        // 3. Navigate to Profile
        let cleanUrl = profileUrl.split('?')[0].replace(/\/$/, '');
        console.log(`Navigating to profile: ${cleanUrl}`);
        await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        // 4. Verify we are still logged in
        if (page.url().includes('/login') || page.url().includes('/authwall')) {
            console.error('❌ Session expired during navigation.');
            process.exit(1);
        }

        // 5. Verify Profile Loaded
        const nameHeader = page.getByRole(SELECTORS.profile.name.role, { level: SELECTORS.profile.name.level });
        if (!(await nameHeader.isVisible())) {
            console.error('❌ Profile name header not found. Profile might be private or blocked.');
            process.exit(1);
        }

        // 6. Execute Outreach
        console.log('📤 Sending connection request...');
        const result = await sendConnectionRequest(page, message);

        if (result.success) {
            console.log('✅ Outreach successful!');
            // Save state if changed (cookies might have refreshed)
            await saveSessionToDb(context);
        } else {
            console.error(`❌ Outreach failed: ${result.error}`);
            process.exit(1);
        }

    } catch (error: any) {
        console.error('❌ Fatal Script Error:', error.message);
        process.exit(1);
    } finally {
        await context.close();
        await browser.close();
        console.log('👋 Session closed.');
    }
}

run();
