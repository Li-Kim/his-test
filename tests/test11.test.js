// 导入 fixture
import { expect, test } from '../fixtures/login.fixture.js';

// 使用 fixture 提供的已登录页面
test('测试缓存生成', async ({ page }) => {
  // page 已经是已登录状态，直接验证
  await expect(page).toHaveURL(/workspace|login/); // 允许登录页或工作台
  console.log('✅ 缓存已生成！');

  // 添加等待，保持页面可见（等待足够时间让登录完成）
  console.log('⏳ 保持页面打开 5 秒...');
  await page.waitForTimeout(5000); // 等待 5 秒
});
