import path from 'path';
import fs from 'fs';
import os from 'os';
import { connectToBrowserless, injectLinkedInAuth, checkSessionHealth } from '@/lib/browser';

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

    // 3. Auth Injection & Health Check
    await injectLinkedInAuth(context);
    const page = await context.newPage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(logsDir, `linkedin-error-${timestamp}.png`);

    try {
        const isHealthy = await checkSessionHealth(page);
        if (!isHealthy) {
            throw new Error('SESSION_INVALID: Could not verify logged-in state. Please update your LI_SESSION.');
        }

        // 4. Navigation & Profile Load
        const cleanUrl = profileUrl.split('?')[0].replace(/\/$/, '');
        console.log(`LinkedIn Outreach: Navigating to ${cleanUrl}...`);
        
        await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(4000 + Math.random() * 2000);

        // Robust check for profile loading
        const nameHeader = await page.getByRole('heading', { level: 1 }).filter({ hasText: /[a-zA-Z]/ }).first();
        const profileLoaded = await nameHeader.isVisible().catch(() => false) || 
                              await page.$('.text-heading-xlarge') ||
                              await page.$('button:has-text("Connect")') ||
                              await page.$('button:has-text("Message")');
        
        if (!profileLoaded) {
            const currentUrl = page.url();
            const pageTitle = await page.title();
            console.error(`PROFILE_NOT_LOADED: Failed on ${currentUrl}. Title: ${pageTitle}`);
            
            // Capture screenshot for debugging
            await page.screenshot({ path: screenshotPath });
            
            if (currentUrl.includes('authwall') || pageTitle.includes('Login')) {
                throw new Error('PROFILE_NOT_LOADED: LinkedIn redirected to an AuthWall. Your session (LI_SESSION) might be expired.');
            }
            if (currentUrl.includes('unavailable') || pageTitle.includes('Page not found')) {
                throw new Error('PROFILE_NOT_LOADED: The profile is unavailable or the URL is incorrect.');
            }
            throw new Error(`PROFILE_NOT_LOADED: Profile elements not found. Check ${screenshotPath} in logs.`);
        }

        // 5. Connection Logic
        if (message === 'SCROLL_AND_SCRAPE') {
            await page.evaluate(() => window.scrollBy(0, 500));
            const content = await page.innerText('main').catch(() => 'Main not found');
            return { success: true, status: 'Scraped', error: content.substring(0, 500) };
        }

        const pending = await page.$('button:has-text("Pending"), button:has-text("Requested")');
        if (pending) return { success: true, status: 'Already pending' };

        const messaging = await page.$('button:has-text("Message")');
        if (messaging) return { success: true, status: 'Already connected' };

        let connectBtn = await page.getByRole('button', { name: 'Connect', exact: true }).first();
        if (!await connectBtn.isVisible()) {
            const moreBtn = await page.getByRole('button', { name: 'More actions' });
            if (await moreBtn.isVisible()) {
                await moreBtn.click();
                await page.waitForTimeout(1000);
                connectBtn = await page.getByRole('button', { name: 'Connect' }).first();
            }
        }

        if (!await connectBtn.isVisible()) {
            throw new Error('CONNECT_BUTTON_NOT_FOUND');
        }

        await connectBtn.click();
        await page.waitForTimeout(1500);

        const addNoteBtn = await page.getByLabel('Add a note').first();
        if (await addNoteBtn.isVisible()) {
            await addNoteBtn.click();
            const textArea = await page.getByRole('textbox', { name: 'message' });
            for (const char of message) {
                await page.keyboard.type(char, { delay: 40 + Math.random() * 60 });
            }
            await page.waitForTimeout(1000);
            await page.getByLabel('Send now').click();
        } else {
            const sendNow = await page.getByLabel('Send now').first();
            if (await sendNow.isVisible()) await sendNow.click();
            else throw new Error('COULD_NOT_SEND');
        }

        await page.waitForTimeout(3000);
        if (await page.$('text=weekly invitation limit')) throw new Error('WEEKLY_LIMIT_REACHED');

        // 6. Success & Accounting
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
