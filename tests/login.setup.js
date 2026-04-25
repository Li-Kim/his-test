import { test} from '@playwright/test';
import { baseConfig, config } from "../config";
import { LoginPage } from '../pages';

test('全局登录', async ({ page }) => {
  const loginPage = new LoginPage(page);
  // 1. 打开网页
  await loginPage.goto(config.baseUrl, { waitUntil: 'networkidle' });

  // 2.登录
  await loginPage.login(config.username,config.password);

  // 3. 等待工作台URL
  await loginPage.waitUrl(config.baseUrl + '/workspace');

  // 4. 保存登录状态
  await page.context().storageState({ path: baseConfig.STORAGE_STATE });
  
  console.log('=========================================');
  console.log('🏥 当前医院：',config.hospitalName);
  console.log('🌍 当前环境：', config.env);
  console.log('🔗 测试地址：', config.baseUrl);
  console.log("---登录成功！已保存登录状态---")
  console.log('=========================================');
});