import { test, chromium } from '@playwright/test';
import { config } from '../config';

// 每个用例都自动用缓存
test('测试页面', async () => {
  // 🔥 自动复用 pw-cache 缓存（登录态 + IndexedDB + 字典表）
  const context = await chromium.launchPersistentContext('./pw-cache', {
    headless: false,
  });

  const page = await context.newPage();

  // 直接进页面，已登录！不下载字典！
  await page.goto(config.baseUrl + '/workspace');

  // --------------------
  // 在这里写你的测试逻辑
  // --------------------
});
