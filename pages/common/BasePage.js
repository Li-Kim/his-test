// 基础页面类：所有页面（登录、挂号、医生站...）都继承这个类
// 封装通用方法：访问URL、输入、点击、等待、获取、截图、日志...
import fs from 'fs';
import path from 'path';

export class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 10000; // 默认超时时间，10秒（适用于元素输入、简单点击）
    this.assertTimeout = 30000; // 断言超时，30秒（适用于页面加载、普通断言）
    this.pageLoadTimeout = 60000; // 页面加载超时，60秒（适用于医疗系统内网接口、慢加载页面）
  }

   // 访问URL（支持options）  timeout: 60000, 超时时间（毫秒） waitUntil: 'load'等待页面加载到什么程度
  async goto(url) {
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.pageLoadTimeout // 使用页面加载超时
      });
    } catch (error) {
      throw new Error(`访问URL失败: "${url}"\n${error.message}`);
    }
  }
  
  // 输入
  async input(label, value, options = {}) {
    try {
      const { timeout = this.timeout } = options;
      // 等待元素出现
      await this.page.getByLabel(label).waitFor({ state: 'visible', timeout });
      // 执行输入操作
      await this.page.getByLabel(label).fill(value, { timeout });
    } catch (error) {
      throw new Error(`输入操作失败: 标签 "${label}", 值 "${value}"\n${error.message}`);
    }
  }

  // 点击按钮
  async clickBtn(text, options = {}) {
    try {
      const { timeout = this.timeout } = options;
      // 等待按钮出现
      await this.page.getByRole('button', { name: text }).waitFor({ state: 'visible', timeout });
      // 执行点击操作
      await this.page.getByRole('button', { name: text }).click({ timeout });
    } catch (error) {
      throw new Error(`点击按钮失败: "${text}"\n${error.message}`);
    }
  }


  // 获取文本
  async getText(selector) {
    try {
      return await this.page.textContent(selector, { timeout: this.timeout });
    } catch (error) {
      throw new Error(`获取文本失败: 选择器 "${selector}"\n${error.message}`);
    }
  }
  
  // 等待文字可见
  async waitText(text, timeout = this.assertTimeout) {
    try {
      await this.page.getByText(text).waitFor({ 
        state: 'visible',
        timeout: timeout 
      });
    } catch (error) {
      throw new Error(`等待文字可见失败: "${text}"\n${error.message}`);
    }
  }

    // 截图
  async screenshot(name) {
    try {
      // 确保screenshots目录存在
      const screenshotDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      await this.page.screenshot({ path: `screenshots/${name}.png` });
    } catch (error) {
      throw new Error(`截图失败: "${name}"\n${error.message}`);
    }
  }

  // domcontentloaded(结构加载) 页面DOM结构加载完成（默认，推荐，速度快）
  // load(完全加载)             页面所有资源加载完成（图片、样式、视频）
  // networkidle(网络空闲)      网络空闲（无请求，最稳但最慢）

  // 等待页面加载    	结构简单页面
  async waitLoad(timeout = this.timeout) {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
    } catch (error) {
      throw new Error(`等待页面加载失败\n${error.message}`);
    }
  }

  // 等待URL
  async waitUrl(url, timeout = this.pageLoadTimeout) {
    try {
      await this.page.waitForURL(url, { 
        timeout: timeout, 
        waitUntil: 'networkidle' // 更可靠的等待策略 
      }); 
    } catch (error) {
      throw new Error(`等待URL失败: "${url}"\n${error.message}`);
    }
  }
  
  // 等待页面完全加载（网络空闲，适合数据密集型页面）
  async waitFullLoad() {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: this.pageLoadTimeout }); // 使用页面加载超时
    } catch (error) {
      throw new Error(`等待页面完全加载失败\n${error.message}`);
    }
  }

}