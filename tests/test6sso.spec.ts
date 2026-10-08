import { randomUUID } from 'node:crypto';

import { test, expect } from '@playwright/test';

// US3-2 #125 (F2): the diary card links to /sso#token=<jwt>. The token is in the
// URL *fragment* so it never reaches a server log or Referer; the page reads it
// client-side, strips it, and POSTs it to /sso/exchange. These drive that in a
// real browser against the mock backend (which, like web-backend's SEC-125
// change, accepts a token once and refuses any replay).
//
// Not covered here: the Sentry breadcrumb scrub (tests/src/libs/sentryScrub.test.ts),
// which needs a DSN the E2E server doesn't have.

const SESSION_COOKIE = 'token'; // E2E_TOKEN_NAME in playwright.config.ts

test.describe('SSO deep link', () => {
  test('exchanges the token once, keeps it out of every URL, and lands on /history', async ({
    page,
  }) => {
    const token = `sso-${randomUUID()}`;
    const exchangeBodies: string[] = [];
    const requestedUrls: string[] = [];
    page.on('request', (request) => {
      requestedUrls.push(request.url());
      if (new URL(request.url()).pathname === '/sso/exchange') {
        exchangeBodies.push(request.postData() ?? '');
      }
    });

    // What the address bar shows at the instant the token leaves the page.
    // Checking only the final URL proves nothing: router.replace('/history')
    // overwrites it regardless. The page's job is to clear the fragment
    // *before* sending, so the token is never sitting in the visible URL,
    // history, or anything that reads the href while the exchange is in flight.
    let urlWhenTokenWasSent: string | null = null;
    await page.route('**/sso/exchange', async (route) => {
      urlWhenTokenWasSent = await page.evaluate(() => window.location.href);
      await route.continue();
    });

    await page.goto(`/sso#token=${token}`);
    await page.waitForURL(/\/history$/);

    // Exactly one exchange, with the token in the body.
    expect(exchangeBodies).toHaveLength(1);
    expect(JSON.parse(exchangeBodies[0])).toEqual({ token });

    // By the time it was sent, the fragment was already gone from the URL.
    expect(urlWhenTokenWasSent).not.toBeNull();
    expect(urlWhenTokenWasSent).not.toContain(token);

    // And the address bar still does not show it afterwards.
    expect(page.url()).not.toContain(token);

    // And no request carried it in a path or query string -- the places a
    // server access log or a Referer would pick it up. (The fragment of the
    // first navigation is the browser's own view and is never sent.)
    for (const url of requestedUrls) {
      const { pathname, search } = new URL(url);
      expect(pathname + search, url).not.toContain(token);
    }
  });

  test('a token that was already redeemed does not log anyone in', async ({
    page,
    context,
  }) => {
    const token = `sso-${randomUUID()}`;

    // The farmer opens their card: first redemption succeeds.
    await page.goto(`/sso#token=${token}`);
    await page.waitForURL(/\/history$/);

    // Someone else gets the forwarded link: no cookies, same token.
    await context.clearCookies();
    await page.goto(`/sso#token=${token}`);
    await page.waitForURL(/\/auth/);

    await expect(page.getByText('Researcher Login')).toBeVisible();
    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name === SESSION_COOKIE)).toBe(false);
  });

  test('a link with no token falls back to the login page', async ({ page }) => {
    await page.goto('/sso');
    await page.waitForURL(/\/auth/);

    await expect(page.getByText('Researcher Login')).toBeVisible();
  });
});
