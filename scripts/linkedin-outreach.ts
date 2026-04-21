import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function run() {
    const profileUrl = process.argv[2];
    const message = process.argv[3];

    if (!profileUrl || !message) {
        console.error(JSON.stringify({ success: false, error: 'Missing profileUrl or message' }));
        process.exit(1);
    }

    // Use a persistent context to maintain LinkedIn session
    const userDataDir = path.join(process.cwd(), '.playwright-sessions');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: true, // Set to true for silent background operation
        viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(process.cwd(), 'logs', `linkedin-error-${timestamp}.png`);

    try {
        console.log(`Navigating to ${profileUrl}...`);
        await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Check for common LinkedIn blocks
        const authWall = await page.$('.authwall-container');
        if (authWall) {
            throw new Error('AUTHWALL: LinkedIn is forcing login. Session might be invalid.');
        }

        // --- NEW RESEARCH MODE ---
        if (message === 'SCROLL_AND_SCRAPE') {
            console.log('Research mode enabled: Scrolling and scraping profile...');
            await page.evaluate(() => window.scrollBy(0, 800));
            await page.waitForTimeout(2000);
            await page.evaluate(() => window.scrollBy(0, 800));
            await page.waitForTimeout(2000);
            
            const profileContent = await page.innerText('main').catch(() => 'Main content not found');
            console.log('--- SCRAPE START ---');
            console.log(profileContent.substring(0, 5000)); // Limit output for n8n
            console.log('--- SCRAPE END ---');
            return;
        }
        // -------------------------

        // Check if we are on the profile page
        const nameElement = await page.waitForSelector('.text-heading-xlarge', { timeout: 15000 }).catch(() => null);
        if (!nameElement) {
            const loginCheck = await page.$('form.login__form');
            if (loginCheck) {
                throw new Error('SESSION_EXPIRED: Playwright session is logged out.');
            }
            
            // Capture screenshot for debugging
            if (!fs.existsSync(path.join(process.cwd(), 'logs'))) fs.mkdirSync(path.join(process.cwd(), 'logs'));
            await page.screenshot({ path: screenshotPath });
            throw new Error(`PROFILE_NOT_FOUND: Could not find profile name. Screenshot saved to ${screenshotPath}`);
        }

        // Check if already connected or pending
        const pendingButton = await page.$('button:has-text("Pending")');
        if (pendingButton) {
            console.log(JSON.stringify({ success: true, status: 'Already pending' }));
            return;
        }

        const messageButton = await page.$('button:has-text("Message")');
        if (messageButton) {
            console.log(JSON.stringify({ success: true, status: 'Already connected' }));
            return;
        }

        // Look for "Connect" button
        let connectButton = await page.$('button:has-text("Connect")');
        
        if (!connectButton) {
            // Try "More" menu if Connect is not visible
            const moreButton = await page.$('button[aria-label="More actions"]');
            if (moreButton) {
                await moreButton.click();
                await page.waitForTimeout(1000);
                connectButton = await page.$('div[role="button"]:has-text("Connect")');
                if (!connectButton) {
                  // Sometimes it's just a regular button inside the menu
                  connectButton = await page.$('button:has-text("Connect")');
                }
            }
        }

        if (connectButton) {
            await connectButton.click();
            console.log('Clicked Connect');

            // Click "Add a note"
            const addNoteButton = await page.waitForSelector('button[aria-label="Add a note"]', { timeout: 5000 }).catch(() => null);
            
            if (!addNoteButton) {
              // Sometimes LinkedIn shows "You can customize this invitation" directly or has a different flow
              const directSend = await page.$('button[aria-label="Send now"]');
              if (directSend) {
                 await directSend.click();
                 console.log(JSON.stringify({ success: true, status: 'Connection request sent directly (no note possible)' }));
                 return;
              }
              throw new Error('ADD_NOTE_NOT_FOUND: Could not find "Add a note" button.');
            }

            await addNoteButton.click();

            // Fill the message
            const messageArea = await page.waitForSelector('textarea[name="message"]', { timeout: 5000 });
            await messageArea.fill(message);

            // Click "Send"
            const sendButton = await page.waitForSelector('button[aria-label="Send now"]', { timeout: 5000 });
            await sendButton.click(); 
            
            // Verify if sent or if limit reached
            await page.waitForTimeout(2000);
            const limitReached = await page.$('text=You’ve reached the weekly invitation limit');
            if (limitReached) {
                throw new Error('LIMIT_REACHED: LinkedIn weekly invitation limit reached.');
            }

            console.log(JSON.stringify({ success: true, status: 'Connection request sent' }));
        } else {
            throw new Error('CONNECT_BUTTON_NOT_FOUND: Connect button not found even in "More" menu.');
        }

    } catch (error: any) {
        if (!fs.existsSync(path.join(process.cwd(), 'logs'))) fs.mkdirSync(path.join(process.cwd(), 'logs'));
        await page.screenshot({ path: screenshotPath }).catch(() => {});
        console.error(JSON.stringify({ success: false, error: error.message, screenshot: screenshotPath }));
    } finally {
        await context.close();
    }
}

run();
