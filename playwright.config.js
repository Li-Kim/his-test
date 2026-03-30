// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  //外层管「框架」：用例跑多久、并行多少、失败重试几次。
  testDir: './tests',        // 测试用例目录
  timeout: 60000,            // 单个用例最大执行时间（全局超时）
  fullyParallel: true,       // 是否并行跑用例
  forbidOnly: !!process.env.CI, // CI 环境禁止 test.only
  retries: process.env.CI ? 2 : 0, // 失败重试次数
  workers: process.env.CI ? 1 : undefined, // 并行 worker 数量
  reporter: 'html',          // 测试报告格式
  
  //use 管「页面」：页面默认网址、操作超时、截图录屏、登录状态。
  use: {
    baseURL: 'http://10.58.2.201:20505', //写 await page.goto('/workspace')，实际会访问 http://10.58.2.201:20505/workspace。
    trace: 'on-first-retry',       // 失败时录制操作轨迹
    screenshot: 'only-on-failure', // 失败自动截图 
    video: 'retain-on-failure',    // 失败自动录屏 

    actionTimeout: 10000,          // 页面操作超时（点击/输入）
    navigationTimeout: 30000,     // 页面跳转超时 
    expect: {
      timeout: 5000                // 断言超时 
    }
  },


  projects: [
  // 1. 登录准备（只跑一次）
    {
      name: 'setup',
      testMatch: '**/*.setup.js', // 登录文件
    },

    // 2. 正式测试（依赖 setup）
    {
      name: 'test',
      dependencies: ['setup'], // 关键！先跑setup
      testMatch: '**/*.spec.js', // 测试用例
      use: {
        ...devices['Desktop Chrome'], // chromium 合并到 test项目
        storageState: './loginState.json', // 加载登录状态
        headless:false
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

