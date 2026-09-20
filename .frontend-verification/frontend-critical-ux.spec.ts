import { test, expect, type Page } from '@playwright/test';

const session = {
  user: { name: 'Frontend Test', email: 'frontend@example.invalid', role: 'user', permissions: [] },
  expires: '2099-01-01T00:00:00.000Z',
};
const profile = {
  ...session.user, image: '', nickname: '', studentId: '65000001', phone: '', year: '1',
  department: '', faculty: '', bio: '', customAvatar: '', rank: 'Member',
};
const news = [{ id: 'test-news', title: 'ทดสอบข่าวชมรม', date: '2026-09-20', summary: 'สรุปข่าวสำหรับทดสอบ', content: 'เนื้อหาข่าวสำหรับทดสอบ', category: 'ข่าว', author: 'ทีมทดสอบ', imageUrl: '', igLink: '' }];
const event = { id: 'test-event', title: 'กิจกรรมทดสอบ', date: '2026-09-21', location: 'ห้องทดสอบ', description: 'รายละเอียดกิจกรรม', imageUrl: '', maxParticipants: 20, status: 'active' };

async function fixtures(page: Page, authenticated = true) {
  await page.addInitScript(() => {
    sessionStorage.setItem('nu-robot-session-active', 'true');
    localStorage.setItem('cookie_consent', 'true');
  });
  // Mock external data boundaries only. No real OAuth, data mutations, or email.
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') throw new Error(`Unexpected mutation: ${path}`);
    let body: unknown = [];
    if (path === '/api/auth/session') body = authenticated ? session : {};
    else if (path === '/api/profile') body = profile;
    else if (path === '/api/news') body = news;
    else if (path === '/api/events') body = { events: [event], participants: [] };
    else if (path === '/api/events/test-event') body = { event, participants: [] };
    await route.fulfill({ json: body });
  });
  await page.route('https://images.unsplash.com/**', route => route.abort());
}

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

async function openAccount(page: Page) {
  const account = page.getByRole('button', { name: /Frontend Test/ });
  await account.click();
  return account;
}

test('account disclosure keeps focus inside when tabbing and closes on Escape', async ({ page }) => {
  await fixtures(page); await home(page);
  const account = await openAccount(page);
  await page.keyboard.press('Tab');
  const first = page.getByRole('button', { name: 'บัตรประจำตัว (ID Card)', exact: true });
  await expect(first).toBeFocused();
  await page.waitForTimeout(400);
  await expect(first).toBeVisible();
  await expect(account).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(first).not.toBeVisible();
  await expect(account).toBeFocused();
});

test('closed mobile navigation has no invisible tab stops', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await fixtures(page, false); await home(page);
  await expect(page.getByRole('link', { name: 'เข้าสู่ระบบ', exact: true })).toBeVisible();
  const toggle = page.locator('#navbar-hamburger');
  await toggle.focus(); await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'อ่านบทความล่าสุด', exact: true })).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile navigation exposes all six authenticated links and Escape restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await fixtures(page); await home(page);
  await expect(page.getByRole('button', { name: /Frontend Test/ })).toBeVisible();
  const toggle = page.locator('#navbar-hamburger'); await toggle.click();
  const last = page.getByRole('link', { name: 'หน้าส่วนตัว', exact: true });
  await expect(last).toBeInViewport({ ratio: 1 });
  await last.focus(); await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(last).not.toBeVisible();
});

test('news reader opens from a native button traps focus and returns focus on Escape', async ({ page }) => {
  await fixtures(page); await home(page);
  const opener = page.getByRole('button', { name: /อ่านบทความ.*ทดสอบข่าวชมรม/ });
  await opener.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'ทดสอบข่าวชมรม' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('member card has a keyboard QR control and restores focus to the surviving account trigger', async ({ page }) => {
  await fixtures(page); await home(page);
  const account = await openAccount(page);
  const openCard = page.getByRole('button', { name: 'บัตรประจำตัว (ID Card)', exact: true });
  await openCard.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'บัตรประจำตัวของคุณ' });
  await expect(dialog).toBeVisible();
  const flip = dialog.getByRole('button', { name: 'ดู QR Code', exact: true });
  await flip.focus(); await page.keyboard.press('Space');
  await expect(dialog.getByRole('button', { name: 'กลับด้านหน้าบัตร', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByText('65000001', { exact: true })).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(account).toBeFocused();
});

test('member-card controls remain reachable on a short phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await fixtures(page); await home(page); await openAccount(page);
  await page.getByRole('button', { name: 'บัตรประจำตัว (ID Card)', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'บัตรประจำตัวของคุณ' });
  const save = dialog.getByRole('button', { name: 'บันทึกรูปภาพ', exact: true });
  await expect(save).toBeEnabled();
  await save.focus(); await expect(save).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await dialog.screenshot({ path: 'test-results/member-card-mobile.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('news network failure does not discard successful events and supports retry', async ({ page }) => {
  await fixtures(page);
  let fail = true;
  await page.route('**/api/news', route => fail ? route.abort('failed') : route.fulfill({ json: news }));
  await home(page);
  await expect(page.getByText('กิจกรรมทดสอบ', { exact: true })).toBeVisible();
  const retry = page.getByRole('button', { name: 'ลองโหลดข่าวสารใหม่', exact: true });
  await expect(retry).toBeVisible();
  await expect(page.getByText('ขณะนี้ยังไม่มีบทความหรือข่าวสารประชาสัมพันธ์', { exact: true })).not.toBeVisible();
  fail = false; await retry.click();
  await expect(page.getByText('ทดสอบข่าวชมรม', { exact: true })).toBeVisible();
});

test('events HTTP failure does not discard successful news and supports retry', async ({ page }) => {
  await fixtures(page);
  let fail = true;
  await page.route('**/api/events', route => fail ? route.fulfill({ status: 500, json: { error: 'fixture failure' } }) : route.fulfill({ json: { events: [event], participants: [] } }));
  await home(page);
  await expect(page.getByText('ทดสอบข่าวชมรม', { exact: true })).toBeVisible();
  const retry = page.getByRole('button', { name: 'ลองโหลดกิจกรรมใหม่', exact: true });
  await expect(retry).toBeVisible();
  fail = false; await retry.click();
  await expect(page.getByText('กิจกรรมทดสอบ', { exact: true })).toBeVisible();
});

test('pending requests show loading instead of empty states', async ({ page }) => {
  await fixtures(page);
  let releaseNews!: () => void;
  let releaseEvents!: () => void;
  const newsGate = new Promise<void>(resolve => { releaseNews = resolve; });
  const eventsGate = new Promise<void>(resolve => { releaseEvents = resolve; });
  await page.route('**/api/news', async route => { await newsGate; await route.fulfill({ json: [] }); });
  await page.route('**/api/events', async route => { await eventsGate; await route.fulfill({ json: { events: [], participants: [] } }); });
  try {
    await home(page);
    await expect(page.getByText('กำลังโหลดข่าวสาร...', { exact: true })).toBeVisible();
    await expect(page.getByText('กำลังโหลดกิจกรรม...', { exact: true })).toBeVisible();
    await expect(page.getByText('ขณะนี้ยังไม่มีบทความหรือข่าวสารประชาสัมพันธ์', { exact: true })).not.toBeVisible();
    releaseNews();
    await expect(page.getByText('ขณะนี้ยังไม่มีบทความหรือข่าวสารประชาสัมพันธ์', { exact: true })).toBeVisible();
    await expect(page.getByText('กำลังโหลดกิจกรรม...', { exact: true })).toBeVisible();
  } finally { releaseNews(); releaseEvents(); }
});

test('malformed public news data is recoverable not a false empty state', async ({ page }) => {
  await fixtures(page);
  await page.route('**/api/news', route => route.fulfill({ json: { unexpected: true } }));
  await home(page);
  await expect(page.getByRole('button', { name: 'ลองโหลดข่าวสารใหม่', exact: true })).toBeVisible();
  await expect(page.getByText('กิจกรรมทดสอบ', { exact: true })).toBeVisible();
});

test('event detail distinguishes server failure from 404 and retries without a mutation', async ({ page }) => {
  await fixtures(page);
  let fail = true;
  await page.route('**/api/events/test-event', route => fail ? route.fulfill({ status: 500, json: { error: 'fixture failure' } }) : route.fulfill({ json: { event, participants: [] } }));
  await page.goto('/events/test-event', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'ไม่พบกิจกรรม', exact: true })).not.toBeVisible();
  const retry = page.getByRole('button', { name: 'ลองโหลดกิจกรรมใหม่', exact: true });
  await expect(retry).toBeVisible();
  fail = false; await retry.click();
  await expect(page.getByRole('heading', { name: 'กิจกรรมทดสอบ', exact: true })).toBeVisible();
});

test('event detail keeps genuine 404 behavior', async ({ page }) => {
  await fixtures(page);
  await page.route('**/api/events/test-event', route => route.fulfill({ status: 404, json: { error: 'Not found' } }));
  await page.goto('/events/test-event', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'ไม่พบกิจกรรม', exact: true })).toBeVisible();
});
