import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/index.js';
import { config } from '../config/index.js';
import { testData, loginErrorMsg } from '../data/index.js';
import { unlockAccount, waitForError } from '../utils/common/index.js';

// 输出环境信息
console.log('=========================================');
console.log('🏥 当前医院：', config.hospitalName);
console.log('🌍 当前环境：', config.env);
console.log('🔗 测试地址：', config.baseUrl);
console.log('=========================================');

//  前置：每个用例进入登录页
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(config.baseUrl);
  await loginPage.waitFullLoad(); // 等待登录页面完全加载
});
//  后置：解锁，足够保证所有用例干净
test.afterEach(async ({ page }) => {
  try {
    await unlockAccount(page, config.username, config.baseUrl);
  } catch (e) {
    console.log('❌ 解锁失败:', e);
  }
});

// 1. 正确账号密码 → 登录成功
test('正确账号密码登录成功', async ({ page }) => {
  const loginPage = new LoginPage(page);
  try {
    console.log('开始测试：正确账号密码登录成功');
    await loginPage.login(config.username, config.password);
    await loginPage.waitUrl(config.baseUrl + '/workspace');
    await loginPage.waitFullLoad(); // 等待工作台页面完全加载
    await expect(page).toHaveURL(config.baseUrl + '/workspace');
    console.log('测试通过：正确账号密码登录成功');
    console.log('----------------------------------------');
  } catch (error) {
    console.error('登录测试失败:', error);
    await loginPage.screenshot('login-success-failure');
    throw error;
  }
});

// 2. 密码错误 → 登录失败
test('正确账号+错误密码提示异常', async ({ page }) => {
  const loginPage = new LoginPage(page);
  try {
    console.log('开始测试：正确账号+错误密码提示异常');
    await loginPage.login(config.username, '123456');
    await waitForError(page, loginErrorMsg.wrongPwd1);
    console.log('测试通过：正确账号+错误密码提示异常');
    console.log('----------------------------------------');
  } catch (error) {
    console.error('测试失败:', error);
    await loginPage.screenshot('wrong-password-failure');
    throw error;
  }
});

// 3. 账号为空 → 不能登录
test('空账号登录提示异常', async ({ page }) => {
  const loginPage = new LoginPage(page);
  try {
    console.log('开始测试：空账号登录提示异常');
    await loginPage.login('', config.password);
    await waitForError(page, loginErrorMsg.emptyUsername);
    console.log('测试通过：空账号登录提示异常');
    console.log('----------------------------------------');
  } catch (error) {
    console.error('测试失败:', error);
    await loginPage.screenshot('empty-username-failure');
    throw error;
  }
});

// 4. 密码为空 → 不能登录
test('空密码登录提示异常', async ({ page }) => {
  const loginPage = new LoginPage(page);
  try {
    console.log('开始测试：空密码登录提示异常');
    await loginPage.login(config.username, '');
    await waitForError(page, loginErrorMsg.emptyPassword);
    console.log('测试通过：空密码登录提示异常');
    console.log('----------------------------------------');
  } catch (error) {
    console.error('测试失败:', error);
    await loginPage.screenshot('empty-password-failure');
    throw error;
  }
});

// 5.连续 5 次错误密码锁定账号 10 分钟
test('连续5次错误密码锁定账号', async ({ page }) => {
  const loginPage = new LoginPage(page);
  try {
    console.log('开始测试：连续5次错误密码锁定账号');
    const wrongPwd = '123456';
    const longTimeout = loginPage.pageLoadTimeout; // 60秒超时，仅用于关键节点

    // 1-4次错误密码
    for (let i = 1; i <= 4; i++) {
      console.log(`第${i}次错误密码尝试`);
      await loginPage.login(config.username, wrongPwd);
      await waitForError(page, loginErrorMsg[`wrongPwd${i}`]);
    };

    // 第5次错误 → 锁定
    console.log('第5次错误密码尝试（锁定账号）');
    await loginPage.login(config.username, wrongPwd);
    await waitForError(page, /密码输入错误5次/);

    // 锁定后正确密码也无法登录
    console.log('验证锁定状态：使用正确密码登录');
    await loginPage.login(config.username, config.password);
    await waitForError(page, /锁定10分钟/);

    // ==============================================
    //  解锁代码（使用工具函数）
    // ==============================================
    console.log('解锁账号');
    await unlockAccount(page, config.username, config.baseUrl);

    // 5. 刷新页面，清除锁定状态
    console.log('刷新页面，清除锁定状态');
    await page.reload();
    await loginPage.waitFullLoad();

    // 解锁后再次输错 → 从第1次开始
    console.log('验证解锁效果：再次输入错误密码');
 // 解锁后可能需要更长时间加载，使用60秒超时
    await loginPage.login(config.username, wrongPwd, { timeout: longTimeout });
    await waitForError(page, loginErrorMsg.wrongPwd1, { timeout: longTimeout });
    console.log('测试通过: 连续5次错误密码锁定账号');
    console.log('----------------------------------------');
  } catch (error) {
    console.error('测试失败:', error);
    await loginPage.screenshot('account-lock-failure');
    throw error;
  }
});
 

// LOGIN-008 密码显示/隐藏按钮功能验证
test('LOGIN-008 密码显示隐藏功能', async ({ page }) => {
  const loginPage = new LoginPage(page);
  try {
    console.log('开始测试：LOGIN-008 密码显示隐藏功能');
    
    // 1. 在密码框输入密码
    await loginPage.input('*密码', '1234qwer');

    // 2. 定位元素
    const passwordInput = page.getByLabel('*密码');
    const eyeBtn = page.locator('div.cursor-pointer');

    // 3. 等待眼睛按钮加载完成
    await eyeBtn.waitFor({ state: 'visible' });

    // 4. 点击眼睛 → 显示密码（明文）
    await eyeBtn.click({ force: true });
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // 5. 再次点击眼睛 → 隐藏密码（密文）
    await eyeBtn.click({ force: true });
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    console.log('测试通过：LOGIN-008 密码显示隐藏功能');
    console.log('----------------------------------------');
  } catch (error) {
    console.error('测试失败:', error);
    await loginPage.screenshot('password-visibility-failure');
    throw error;
  }
}); 

/* // LOGIN-009 记住密码功能验证
test('LOGIN-009 记住密码功能验证', async ({ page }) => {
  const loginPage = new LoginPage(page);
  // 从配置读取
  const username = config.username;
  const password = config.password;
  // 1. 输入账号密码
  await loginPage.input('*账号', username);
  await loginPage.input('*密码', password);

  // 2. 勾选记住密码
  await page.getByLabel('记住密码').check();

  // 3. 点击登录 → 等待页面加载
  await loginPage.clickBtn('login');
  await loginPage.waitLoad();

  // 4. 等待跳转到工作台（必须等跳转完成）
  await loginPage.waitUrl(config.baseUrl + '/workspace');

  // 等页面里一个标志性元素出现（比如待办事项/用户按钮本身）
  const userBtn = page.getByRole('button', { name: /测试索县人民医院管理员/ });
  await userBtn.waitFor({ state: 'visible', timeout: 30000 });

  // ===================== 安全退出流程 =====================
  // 点击用户按钮 → 展开下拉菜单
  await userBtn.click({ force: true });

  // 等待 退出登录 菜单项出现
  const logoutItem = page.getByRole('menuitem', { name: /退出登录/ });
  await logoutItem.waitFor({ state: 'visible', timeout: 20000 });
  await logoutItem.click();

  // 等待确认弹窗的【确认】按钮出现
  const confirmBtn = page.getByRole('button', { name: '确认' });
  await confirmBtn.waitFor({ state: 'visible', timeout: 20000 });
  await loginPage.clickBtn('确认');

  // 等待回到登录页
  await loginPage.waitUrl(config.baseUrl);

  // ===================== 验证记住密码生效 =====================
  await page.reload();
  await expect(page.getByLabel('*账号')).toHaveValue(username);
  await expect(page.getByLabel('*密码')).toHaveValue(password);
});  */