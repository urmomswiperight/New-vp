import { chromium } from 'playwright';
import path from 'path';

async function main() {
    const userDataDir = path.join(process.cwd(), '.playwright-sessions');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: 'msedge',
    });
    const page = await context.newPage();
    try {
        console.log('Navigating to LinkedIn (120s timeout)...');
        await page.goto('https://www.linkedin.com/feed/', { 
            waitUntil: 'load', 
            timeout: 120000 
        });

        // Add an extra delay for SPA navigation or dynamic content
        await page.waitForTimeout(5000);
        
        // Robust check for logged in state
        const loggedIn = await page.waitForSelector([
          '.feed-identity-module__actor-meta', 
          '.global-nav__me-photo',
          'button[aria-label="Account Menu"]',
          '.search-global-typeahead'
        ].join(','), { timeout: 15000 }).catch(() => null);
        
        if (loggedIn) {
            console.log('✅ Logged in to LinkedIn');
        } else {
            const login = await page.$('form.login__form, input[name="session_key"], a[href*="login"]');
            if (login) {
                console.log('❌ Session EXPIRED or NOT LOADED: Showing login form.');
            } else {
                console.log('❓ Could not determine login status. Taking screenshot...');
                await page.screenshot({ path: 'linkedin-check-error.png' });
            }
        }
    } catch (e: any) {
        console.error('Error:', e.message);
        await page.screenshot({ path: 'linkedin-timeout-error.png' });
        console.log('Screenshot saved to linkedin-timeout-error.png');
    } finally {
        await context.close();
    }
}
main();
