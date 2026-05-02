import { NextResponse } from 'next/server';
import { connectToBrowserless, FIXED_USER_AGENT } from '@/lib/browser';
import { injectFullStorageState, checkLoginHealth, performLogin } from '@/lib/linkedin/session';
import { sendConnectionRequest } from '@/lib/linkedin/actions';
import { SELECTORS } from '@/lib/linkedin/selectors';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] LinkedIn Outreach API: Received request`);

  try {
    // 1. Authentication: Verify X-Outreach-Secret header
    const secretHeader = req.headers.get('X-Outreach-Secret');
    if (!secretHeader || secretHeader !== process.env.OUTREACH_SECRET) {
      console.warn(`[${requestId}] LinkedIn Outreach API: Unauthorized access attempt`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Request Body Parsing & Validation
    const body = await req.json().catch(() => ({}));
    const { profileUrl, message, dailyLimit = 25 } = body;

    if (!profileUrl || !message) {
      console.warn(`[${requestId}] LinkedIn Outreach API: Missing required parameters`);
      return NextResponse.json({ error: 'Missing parameters: profileUrl and message are required' }, { status: 400 });
    }

    // 3. Setup Directories & Limits
    const isVercel = process.env.VERCEL === '1';
    const baseDir = isVercel ? os.tmpdir() : process.cwd();
    const userDataDir = path.join(baseDir, '.playwright-sessions');
    const logsDir = path.join(baseDir, 'logs');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const today = new Date().toISOString().split('T')[0];
    const limitFile = path.join(userDataDir, 'daily_count.json');
    let dailyData = { date: today, count: 0 };
    if (fs.existsSync(limitFile)) {
        try {
            const savedData = JSON.parse(fs.readFileSync(limitFile, 'utf8'));
            if (savedData.date === today) dailyData = savedData;
        } catch (e) {}
    }

    if (dailyData.count >= Number(dailyLimit)) {
        return NextResponse.json({ success: false, error: 'DAILY_LIMIT_REACHED' }, { status: 429 });
    }

    // 4. Browser Setup
    const browser = await connectToBrowserless();
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: FIXED_USER_AGENT,
        locale: 'en-US'
    });

    // 5. Session Injection (Storage State)
    const sessionJson = process.env.LI_SESSION;
    if (sessionJson) {
        await injectFullStorageState(context, sessionJson);
    }

    const page = await context.newPage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(logsDir, `linkedin-api-error-${timestamp}.png`);

    try {
        // 6. Navigation + Implicit Health Check
        let cleanUrl = profileUrl.split('?')[0].replace(/\/$/, '');
        console.log(`[${requestId}] LinkedIn Outreach API: Navigating to ${cleanUrl}`);
        
        // Go directly to profile. 
        console.log(`[${requestId}] Navigating to profile...`);
        await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
        
        // Wait for page hydration
        await page.waitForTimeout(5000); 

        // 7. Verify login (Resiliently)
        console.log(`[${requestId}] Verifying login status...`);
        const isLoggedIn = await checkLoginHealth(page);
        if (isLoggedIn === 'LOGGED_OUT') {
            console.warn(`[${requestId}] Session invalid. Attempting automated login...`);
            const loggedIn = await performLogin(page);
            if (!loggedIn) {
                 return NextResponse.json({ success: false, error: 'LOGIN_FAILED' }, { status: 403 });
            }
        } else if (isLoggedIn === 'CHALLENGED') {
            return NextResponse.json({ success: false, error: 'SESSION_CHALLENGED' }, { status: 403 });
        }

        // 8. Resilient Profile Verification
        const nameHeader = page.getByRole(SELECTORS.profile.name.role, { level: SELECTORS.profile.name.level });
        if (!(await nameHeader.isVisible())) {
            console.error(`[${requestId}] LinkedIn Outreach API: Profile name header not found`);
            // Capture screenshot with protection against closed contexts
            try {
                if (!page.isClosed()) {
                    await page.screenshot({ path: screenshotPath, timeout: 60000 });
                }
            } catch (e) {
                console.error('Screenshot failed (browser likely closed):', e);
            }
            return NextResponse.json({ success: false, error: 'PROFILE_NOT_LOADED', screenshot: screenshotPath }, { status: 404 });
        }

        // 9. Execute Resilient Action
        const result = await sendConnectionRequest(page, message);

        if (result.success) {
            dailyData.count++;
            fs.writeFileSync(limitFile, JSON.stringify(dailyData));
            return NextResponse.json({ success: true, status: 'Sent', countToday: dailyData.count });
        } else {
            // Capture screenshot with protection against closed contexts
            try {
                if (!page.isClosed()) {
                    await page.screenshot({ path: screenshotPath, timeout: 60000 });
                }
            } catch (e) {
                console.error('Screenshot failed (browser likely closed):', e);
            }
            return NextResponse.json({ success: false, error: result.error, screenshot: screenshotPath }, { status: 500 });
        }

    } catch (err: any) {
        await page.screenshot({ path: screenshotPath, timeout: 90000 }).catch(() => {});
        return NextResponse.json({ success: false, error: err.message, screenshot: screenshotPath }, { status: 500 });
    } finally {
        await context.close();
        await browser.close();
    }

  } catch (error: any) {
    console.error(`[${requestId}] LinkedIn Outreach API: Fatal Error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
