import { test, expect } from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';
import { config } from '../config';
import loginData from '../data/commom/loginData.json';
//  前置：每个用例进入登录页
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(config.baseUrl);
});
//  后置：解锁，足够保证所有用例干净
test.afterEach(async ({ page }) => {
  try {
    const unlockUrl = `${config.baseUrl}/prod-his-api/his/v5/auth/clear/loginError/${encodeURIComponent(config.username)}`;
    await page.request.get(unlockUrl);
    // console.log('✅ 用例结束 → 自动解锁');
    // console.log('----------------------------------------'); 
  } catch (e) {
    console.log('❌ 解锁失败:', e);
  }
});

// 1. 正确账号密码 → 登录成功
test('正确账号密码登录成功', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(config.username, config.password);

  await expect(page).toHaveURL(config.baseUrl + '/workspace');
});

// 2. 密码错误 → 登录失败
test('正确账号+错误密码提示异常', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(config.username, '123456');

  await page.getByText(loginData.errorMsg.wrongPwd1).last().waitFor({state: 'visible',timeout: 10000 });
});

// 3. 账号为空 → 不能登录
test('空账号登录提示异常', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('', config.password);

  await page.getByText(loginData.errorMsg.emptyUsername).last().waitFor({state: 'visible',timeout: 10000 });
});

// 4. 密码为空 → 不能登录
test('空密码登录提示异常', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(config.username, '');

  await page.getByText(loginData.errorMsg.emptyPassword).last().waitFor({state: 'visible',timeout: 10000 });
});

// 5.连续 5 次错误密码锁定账号 10 分钟
test('连续5次错误密码锁定账号', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const wrongPwd = '123456';

  // 1-4次错误密码
  for (let i = 1; i <= 4; i++) {
    await loginPage.login(config.username, wrongPwd);
    await  page.getByText(loginData.errorMsg[`wrongPwd${i}`]).last().waitFor({
      state: 'visible',
      timeout: 10000
    });
  };

  // 第5次错误 → 锁定
  await loginPage.login(config.username, wrongPwd);
  await page.getByText(/密码输入错误5次/).last().waitFor({state: 'visible',timeout: 10000 });

  // 锁定后正确密码也无法登录
  await loginPage.login(config.username, config.password);
  await page.getByText(/锁定10分钟/).last().waitFor({state: 'visible',timeout: 10000 });

  // ==============================================
  //  解锁代码（GET 接口）
  // ==============================================
  // 1. 拼接完整接口URL（和Apifox完全一致，替换{userName}为真实账号）
  const unlockUrl = `${config.baseUrl}/prod-his-api/his/v5/auth/clear/loginError/${encodeURIComponent(config.username)}`;

  // 2. 发送 GET 请求解锁
  const unlockResponse = await page.request.get(unlockUrl);
  console.log(`解锁接口响应状态: ${unlockResponse.status()}`);

  // 3. 先验证HTTP状态码成功（200）
  expect(unlockResponse.ok()).toBeTruthy();

  // 4. 解析接口返回的JSON，验证业务数据成功（data: true）
  const responseData = await unlockResponse.json();
  console.log('解锁接口返回数据:', responseData);
  expect(responseData.data).toBe(true); // 验证业务成功

  // 5. 刷新页面，清除锁定状态
  await page.reload();
  await loginPage.waitLoad();

  // 解锁后再次输错 → 从第1次开始
  await loginPage.login(config.username,wrongPwd);
  await page.getByText(loginData.errorMsg.wrongPwd1).last().waitFor({state: 'visible',timeout: 10000 });
});
 

// LOGIN-008 密码显示/隐藏按钮功能验证
test('LOGIN-008 密码显示隐藏功能', async ({ page }) => {
  const loginPage = new LoginPage(page);
 
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