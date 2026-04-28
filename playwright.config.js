// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  //外层管「框架」：用例跑多久、并行多少、失败重试几次。
  testDir: './tests', // 测试用例目录
  timeout: 60000, // 单个用例最大执行时间（全局超时）
  fullyParallel: true, // 是否并行跑用例
  forbidOnly: !!process.env.CI, // CI 环境禁止 test.only
  retries: process.env.CI ? 2 : 0, // 失败重试次数
  workers: process.env.CI ? 2 : undefined, //  worker 数量
  reporter: 'html', // 测试报告格式

  //use 管「页面」：页面默认网址、操作超时、截图录屏、登录状态。
  use: {
    baseURL: 'http://10.58.2.201:20505', //写 await page.goto('/workspace')，实际会访问 http://10.58.2.201:20505/workspace。
    trace: 'on-first-retry', // 失败时录制操作轨迹
    screenshot: 'only-on-failure', // 失败自动截图
    video: 'retain-on-failure', // 失败自动录屏

    actionTimeout: 10000, // 页面操作超时（点击/输入）
    navigationTimeout: 60000, // 页面跳转超时
    expect: {
      timeout: 10000, // 断言超时
    },
  },

  projects: [
    // 1. 环境清理（解锁账号）
    {
      name: 'clean',
      testMatch: '**/clean.setup.js',
    },

    // 2. 全局登录（给业务用例使用）
    {
      name: 'setup',
      testMatch: '**/login.setup.js',
    },

    // 3. 登录测试用例 → 只清理，不登录
    {
      name: 'login',
      dependencies: ['clean'], //清理账号
      testMatch: '**/login.spec.js',
      workers: 1, //一次只跑1个用例
      fullyParallel: false, // 同一个文件里的用例一个跑完再跑一个（串行） 文件内用例也串行
      use: {
        headless: false,
        ...devices['Desktop Chrome'],
        storageState: undefined, // 清理浏览器
      },
    },

    // 4. 业务测试用例 → 走登录状态
    {
      name: 'test',
      //dependencies: ['setup'],
      testIgnore: [
        '**/clean.setup.js',
        '**/login.setup.js',
        '**/login.spec.js',
      ],
      use: {
        headless: false,
        ...devices['Desktop Chrome'],
      },
    },

    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
