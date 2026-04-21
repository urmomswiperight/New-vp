import { test, expect } from '@playwright/test';
import { injectFullStorageState } from '../src/lib/linkedin/session';

test.describe('LinkedIn Auth Injection', () => {
  test('should correctly parse and inject JSESSIONID and other cookies', async ({ context }) => {
    const mockSession = JSON.stringify({
      cookies: [
        {
          name: 'li_at',
          value: 'mock_li_at_value',
          domain: '.www.linkedin.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        },
        {
          name: 'JSESSIONID',
          value: '"ajax:1234567890"',
          domain: '.www.linkedin.com',
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'None'
        }
      ]
    });

    const result = await injectFullStorageState(context, mockSession);
    expect(result.success).toBe(true);
    expect(result.cookieCount).toBe(2);

    const cookies = await context.cookies();
    const li_at = cookies.find(c => c.name === 'li_at');
    const jsessionid = cookies.find(c => c.name === 'JSESSIONID');

    expect(li_at).toBeDefined();
    expect(li_at?.value).toBe('mock_li_at_value');
    
    expect(jsessionid).toBeDefined();
    expect(jsessionid?.value).toBe('"ajax:1234567890"');
  });

  test('should handle missing cookies gracefully', async ({ context }) => {
    const mockSession = JSON.stringify({
      cookies: []
    });

    const result = await injectFullStorageState(context, mockSession);
    expect(result.success).toBe(true);
    expect(result.cookieCount).toBe(0);
  });

  test('should return failure on invalid JSON', async ({ context }) => {
    const invalidJson = 'not a json';
    const result = await injectFullStorageState(context, invalidJson);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
