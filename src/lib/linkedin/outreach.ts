import path from 'path';
import fs from 'fs';
import os from 'os';
import { connectToBrowserless, injectLinkedInCookies } from '@/lib/browser';

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
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

export async function runLinkedInOutreach(
    profileUrl: string,
    message: string,
    dailyLimit: number = 25
): Promise<OutreachResult> {
    // Use /tmp for Vercel compatibility
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
            if (savedData.date === today) {
                dailyData = savedData;
            }
        } catch (e) {
            console.warn('Could not read daily count file, resetting.');
        }
    }

    if (dailyData.count >= dailyLimit) {
        return { 
            success: false, 
            error: `DAILY_LIMIT_REACHED: Already sent ${dailyData.count} today.` 
        };
    }

    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    console.log('LinkedIn Outreach: Attempting connection...');
    let browser;
    try {
        browser = await connectToBrowserless();
    } catch (e: any) {
        return { success: false, error: `CONNECTION_FAILED: ${e.message}` };
    }
    
    const context = await browser.newContext({
        userAgent,
        viewport: { width: 1280 + Math.floor(Math.random() * 100), height: 720 + Math.floor(Math.random() * 100) },
    });

    // Inject cookies for authentication
    await injectLinkedInCookies(context);

    const page = await context.newPage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(logsDir, `linkedin-error-${timestamp}.png`);

    try {
        console.log(`Navigating to ${profileUrl}...`);
        await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000 + Math.random() * 4000);

        if (await page.$('.authwall-container')) {
            throw new Error('AUTHWALL: Session invalid or blocked.');
        }

        if (message === 'SCROLL_AND_SCRAPE') {
            await page.evaluate(() => window.scrollBy(0, 400 + Math.random() * 600));
            await page.waitForTimeout(1500 + Math.random() * 1000);
            await page.evaluate(() => window.scrollBy(0, 400 + Math.random() * 600));
            const profileContent = await page.innerText('main').catch(() => 'Main not found');
            return { success: true, status: 'Scraped', error: profileContent.substring(0, 5000) };
        }

        const nameElement = await page.waitForSelector('.text-heading-xlarge, .pv-top-card-section__name', { timeout: 20000 }).catch(() => null);
        if (!nameElement) {
            throw new Error('PROFILE_NOT_LOADED');
        }

        const pending = await page.$('button:has-text("Pending"), button:has-text("Requested")');
        if (pending) {
            return { success: true, status: 'Already pending', countToday: dailyData.count };
        }

        const messaging = await page.$('button:has-text("Message")');
        if (messaging) {
            return { success: true, status: 'Already connected', countToday: dailyData.count };
        }

        let connectBtn = await page.$('button.pvs-profile-actions__action:has-text("Connect")');
        if (!connectBtn) {
            const moreBtn = await page.$('button[aria-label="More actions"]');
            if (moreBtn) {
                await moreBtn.click();
                await page.waitForTimeout(1000 + Math.random() * 1000);
                connectBtn = await page.$('div[role="button"]:has-text("Connect"), button:has-text("Connect")');
            }
        }

        if (!connectBtn) {
            throw new Error('CONNECT_BUTTON_NOT_FOUND');
        }

        await page.waitForTimeout(1000 + Math.random() * 2000);
        await connectBtn.click();
        await page.waitForTimeout(1500 + Math.random() * 1500);

        const addNoteBtn = await page.waitForSelector('button[aria-label="Add a note"]', { timeout: 7000 }).catch(() => null);
        if (addNoteBtn) {
            await addNoteBtn.click();
            const textArea = await page.waitForSelector('textarea[name="message"]', { timeout: 7000 });
            for (const char of message) {
                await page.keyboard.type(char, { delay: 50 + Math.random() * 150 });
            }
            await page.waitForTimeout(1000 + Math.random() * 2000);
            const sendBtn = await page.waitForSelector('button[aria-label="Send now"]');
            await sendBtn.click();
        } else {
            const sendNow = await page.$('button[aria-label="Send now"]');
            if (sendNow) {
                await sendNow.click();
            } else {
                throw new Error('COULD_NOT_SEND');
            }
        }

        await page.waitForTimeout(4000 + Math.random() * 2000);
        const limitReached = await page.$('text=weekly invitation limit');
        if (limitReached) {
            throw new Error('WEEKLY_LIMIT_REACHED');
        }

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
