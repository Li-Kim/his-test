import { test} from '@playwright/test';
import baseConfig from '../config/base.js';
import { config } from "../config/index.js";
import { BasePage } from "../pages/BasePage.js";

test('全局登录', async ({ page }) => {
  const basePage = new BasePage(page);
  // 1. 打开网页
  await basePage.goto(config.baseUrl,{waitUntil:'networkidle'});
  // 2.登录
  await basePage.login(config);
  // 3.保存登录状态
  await page.context().storageState({ path: baseConfig.STORAGE_STATE });
  
  console.log('=========================================');
  console.log('🏥 当前医院：',config.hospitalName);
  console.log('🌍 当前环境：', config.env);
  console.log('🔗 测试地址：', config.baseUrl);
  console.log("---登录成功！！！---")
  console.log('=========================================');
});