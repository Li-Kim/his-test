import { test as base, chromium } from '@playwright/test';
import { LoginPage } from '../pages/index.js';
import { config } from '../config/config.js';

const CACHE_PATH = './browser-data';
let globalContext = null;

export const test = base.extend({
  page: async ({}, use) => {
    if (!globalContext) {
      globalContext = await chromium.launchPersistentContext(CACHE_PATH, {
        headless: false,
        viewport: { width: 1920, height: 1080 },
      });

      // 确保 page 存在，如果不存在则创建一个
      let page =
        globalContext.pages().length > 0 ? globalContext.pages()[0] : null;
      if (!page) {
        page = await globalContext.newPage();
      }

      const loginPage = new LoginPage(page);

      await page.goto(config.baseUrl, { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      const isLoginPage =
        (await page.locator('input[type="password"]').count()) > 0;

      if (isLoginPage) {
        console.log('🔐 正在登录...');
        await loginPage.login(config.username, config.password);
        await page.waitForURL(config.baseUrl + '/workspace', {
          timeout: 120000,
        });
        await page.waitForLoadState('networkidle', { timeout: 120000 });
      }

      // 等待系统初始化完成（如果出现）
      await page.waitForURL(/workspace/, { timeout: 60000 }).catch(() => {});
    }

    // 获取 page（确保存在）
    let page =
      globalContext.pages().length > 0 ? globalContext.pages()[0] : null;
    if (!page) {
      page = await globalContext.newPage();
    }

    // 确保在工作台页面
    if (!page.url().includes('/workspace')) {
      await page.goto(config.baseUrl + '/workspace');
      await page.waitForLoadState('domcontentloaded');
    }

    await use(page);
  },
});

test.afterAll(async () => {
  if (globalContext) {
    await globalContext.close();
    globalContext = null;
  }
});

export { expect } from '@playwright/test';
