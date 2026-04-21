import { test, expect } from '@playwright/test';
import { checkLoginHealth } from '../src/lib/linkedin/session';

test.describe('LinkedIn Health Check', () => {
  test('should return LOGGED_IN when Home link is visible', async ({ page }) => {
    // Mock LinkedIn feed page with Home link
    await page.route('https://www.linkedin.com/feed/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><nav><a href="/feed/">Home</a></nav></body></html>'
      });
    });

    const status = await checkLoginHealth(page);
    expect(status).toBe('LOGGED_IN');
  });

  test('should return LOGGED_OUT when redirected to login', async ({ page }) => {
    // Mock redirect to login
    await page.route('https://www.linkedin.com/feed/', async route => {
      await route.fulfill({
        status: 302,
        headers: { location: 'https://www.linkedin.com/login' }
      });
    });
    
    await page.route('https://www.linkedin.com/login', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: '<html><body><h1>Sign in</h1></body></html>'
        });
    });

    const status = await checkLoginHealth(page);
    expect(status).toBe('LOGGED_OUT');
  });

  test('should return LOGGED_OUT when redirected to authwall', async ({ page }) => {
    await page.route('https://www.linkedin.com/feed/', async route => {
      await route.fulfill({
        status: 302,
        headers: { location: 'https://www.linkedin.com/authwall' }
      });
    });

    await page.route('https://www.linkedin.com/authwall', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: '<html><body><h1>Authwall</h1></body></html>'
        });
    });

    const status = await checkLoginHealth(page);
    expect(status).toBe('LOGGED_OUT');
  });

  test('should return CHALLENGED when Security Check appears', async ({ page }) => {
    await page.route('https://www.linkedin.com/feed/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Security Check</h1><div id="captcha-internal"></div></body></html>'
      });
    });

    const status = await checkLoginHealth(page);
    expect(status).toBe('CHALLENGED');
  });
});
