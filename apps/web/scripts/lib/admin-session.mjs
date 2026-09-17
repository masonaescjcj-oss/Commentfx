/**
 * Signing a smoke run in, the way a person would.
 *
 * Every smoke script that writes needs an account now, because every write
 * action asks who is signed in and the shared token is nobody. Rather than
 * having each script reinvent that, they all come through here: bootstrap the
 * first admin from the break-glass token if there is not one yet, then sign in.
 *
 * It uses the real screens rather than reaching into the database, which makes
 * this the one thing in the suite that exercises the sign-in path on every run.
 */
export const ADMIN = {
  email: 'smoke@commentfx.com',
  name: 'Smoke Editor',
  password: 'a-password-long-enough',
};

export async function signInAdmin(browser, base, token) {
  // The break-glass context exists only to create the first account.
  const bootstrap = await browser.newContext({
    extraHTTPHeaders: { authorization: `Bearer ${token}` },
  });
  const boot = await bootstrap.newPage();
  await boot.goto(`${base}/admin/setup`, { waitUntil: 'domcontentloaded' });
  if (await boot.locator('input[name="password"]').count() > 0) {
    await boot.locator('input[name="name"]').fill(ADMIN.name);
    await boot.locator('input[name="email"]').fill(ADMIN.email);
    await boot.locator('input[name="password"]').fill(ADMIN.password);
    await boot.getByRole('button', { name: /Create the first account/ }).click();
    await boot.waitForTimeout(2500);
  }
  await bootstrap.close();

  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="email"]').fill(ADMIN.email);
  await page.locator('input[name="password"]').fill(ADMIN.password);
  await page.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForURL(/\/admin(\?|$|\/)/, { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(500);
  return { ctx, page };
}
