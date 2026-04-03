import { test as setup } from '@playwright/test';
import { config } from "../config/index.js";

setup('全局环境清理：解锁账号、清空错误次数', async ({ request }) => {
  const unlockUrl = `${config.baseUrl}/prod-his-api/his/v5/auth/clear/loginError/${encodeURIComponent(config.username)}`;

  const response = await request.get(unlockUrl);

  console.log('=========================================');
  console.log('🧹 环境清理完成');
  console.log('账号：', config.username);
  console.log('解锁接口状态：', response.status());
  console.log('✅ 不登录、不影响登录用例');
  console.log('=========================================');
});