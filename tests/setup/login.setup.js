import { test, chromium } from '@playwright/test';
import { config } from "../../config";
import { LoginPage } from '../../pages';

test('全局登录', async () => {
  // ==================== 核心：开启持久缓存 ====================
  // 保存 IndexedDB / Cookie / 接口缓存 / 登录态
  // ===========================================================
  const context = await chromium.launchPersistentContext('./pw-cache', {
    headless: false,
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  // 1. 打开网页
  await loginPage.goto(config.baseUrl, { waitUntil: 'networkidle' });

  // 2. 登录
  await loginPage.login(config.username, config.password);

  // 3. 等待工作台
  await loginPage.waitUrl(config.baseUrl + '/workspace');

  // ==================== 关键：删掉这一行 ====================
  // await page.context().storageState({ path: baseConfig.STORAGE_STATE });
  // ===========================================================

  console.log('=========================================');
  console.log('🏥 当前医院：', config.hospitalName);
  console.log('🌍 当前环境：', config.env);
  console.log('🔗 测试地址：', config.baseUrl);
  console.log("✅ 登录成功！缓存已保存！");
  console.log('=========================================');
});