import { test } from '@playwright/test';
import { config } from '../../config';
import { unlockAccount } from '../../utils/common';

test('全局环境清理：解锁账号、清空错误次数', async ({ page }) => {
  try {
    await unlockAccount(page, config.username, config.baseUrl);
    console.log('=========================================');
    console.log('🧹 环境清理完成');
    console.log('医院：', config.hospitalName);
    console.log('账号：', config.username);
    console.log('环境：', config.env);
    console.log('地址：', config.baseUrl);
    console.log('=========================================');
  } catch (error) {
    console.error('环境清理失败:', error);
    throw error;
  }
});
