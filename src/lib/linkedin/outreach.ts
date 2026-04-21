import path from 'path';
import fs from 'fs';
import os from 'os';
import { connectToBrowserless } from '@/lib/browser';
import { injectFullStorageState, checkLoginHealth } from './session';
import { SELECTORS } from './selectors';
import { sendConnectionRequest, sendMessage } from './actions';

export interface OutreachResult {
    success: boolean;
    status?: string;
    error?: string;
    screenshot?: string;
    countToday?: number;
}

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

export async function runLinkedInOutreach(
    profileUrl: string,
    message: string,
    dailyLimit: number = 25
): Promise<OutreachResult> {
    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    const logsDir = path.join(baseDir, 'logs');
    
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    // 1. Check Daily Safety Limit
    const today = new Date().toISOString().split('T')[0];
    const limitFile = path.join(userDataDir, 'daily_count.json');
    let dailyData = { date: today, count: 0 };
    
    if (fs.existsSync(limitFile)) {
        try {
            const savedData = JSON.parse(fs.readFileSync(limitFile, 'utf8'));
            if (savedData.date === today) dailyData = savedData;
        } catch (e) {
            console.warn('Could not read daily count file.');
        }
    }

    if (dailyData.count >= dailyLimit) {
        return { success: false, error: `DAILY_LIMIT_REACHED: Sent ${dailyData.count} today.` };
    }

    // 2. Browser Connection
    console.log('LinkedIn Outreach: Connecting...');
    let browser;
    try {
        browser = await connectToBrowserless();
    } catch (e: any) {
        return { success: false, error: `CONNECTION_FAILED: ${e.message}` };
    }
    
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const context = await browser.newContext({
        userAgent,
        viewport: { width: 1280 + Math.floor(Math.random() * 50), height: 720 + Math.floor(Math.random() * 50) },
    });

    // 3. Auth Injection (Full Storage State)
    const sessionJson = process.env.LI_SESSION;
    if (sessionJson) {
        await injectFullStorageState(context, sessionJson);
    } else {
        console.warn('No LI_SESSION found in environment variables.');
    }

    const page = await context.newPage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(logsDir, `linkedin-error-${timestamp}.png`);

    try {
        // 4. Mandatory Health Check
        const health = await checkLoginHealth(page);
        if (health !== 'LOGGED_IN') {
            await page.screenshot({ path: screenshotPath });
            return { 
                success: false, 
                error: `SESSION_UNHEALTHY: ${health}`, 
                screenshot: screenshotPath 
            };
        }

        // 5. Navigation & Profile Load
        let cleanUrl = profileUrl.split('?')[0].replace(/\/$/, '');
        if (!cleanUrl.startsWith('https://')) {
            cleanUrl = cleanUrl.replace('http://', 'https://');
            if (!cleanUrl.startsWith('https://')) cleanUrl = 'https://' + cleanUrl;
        }
        console.log(`LinkedIn Outreach: Navigating to ${cleanUrl}...`);
        
        await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(4000 + Math.random() * 2000);

        // Resilient check for profile loading using centralized selectors
        const nameHeader = page.getByRole(SELECTORS.profile.name.role, { level: SELECTORS.profile.name.level });
        const profileLoaded = await nameHeader.isVisible().catch(() => false);
        
        if (!profileLoaded) {
            const currentUrl = page.url();
            const pageTitle = await page.title();
            console.error(`PROFILE_NOT_LOADED: Failed on ${currentUrl}. Title: ${pageTitle}`);
            
            await page.screenshot({ path: screenshotPath });
            throw new Error(`PROFILE_NOT_LOADED: Profile name element not found. Check ${screenshotPath} in logs.`);
        }

        // 6. Interaction Logic
        
        // Check if already connected or pending
        const connectBtn = page.getByRole(SELECTORS.profile.connect.role, { 
            name: SELECTORS.profile.connect.name, 
            exact: SELECTORS.profile.connect.exact 
        });
        
        const messagingBtn = page.getByRole(SELECTORS.profile.message.role, { 
            name: SELECTORS.profile.message.name, 
            exact: SELECTORS.profile.message.exact 
        });

        if (await messagingBtn.isVisible()) {
            // Already connected, send a message if that's what's requested
            // Note: In current implementation, we only send messages if we are connecting
            // but we can extend this.
            return { success: true, status: 'ALREADY_CONNECTED' };
        }

        // Check for pending
        const pendingIndicator = page.getByText(/Pending/i).or(page.getByText(/Requested/i));
        if (await pendingIndicator.isVisible()) {
            return { success: true, status: 'ALREADY_PENDING' };
        }

        // Send connection request
        const actionResult = await sendConnectionRequest(page, message);
        
        if (!actionResult.success) {
            throw new Error(actionResult.error || 'CONNECTION_FAILED');
        }

        // 7. Success & Accounting
        dailyData.count++;
        fs.writeFileSync(limitFile, JSON.stringify(dailyData));
        return { success: true, status: 'Sent', countToday: dailyData.count };

    } catch (error: any) {
        await page.screenshot({ path: screenshotPath }).catch(() => {});
        return { success: false, error: error.message, screenshot: screenshotPath };
    } finally {
        await context.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
    }
}
