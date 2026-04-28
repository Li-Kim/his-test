// 基础页面类：所有页面（登录、挂号、医生站...）都继承这个类
// 封装通用方法：访问URL、输入、点击、等待、获取、截图、日志...

export class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 10000; // 默认超时时间，10秒（适用于元素输入、简单点击）
    this.assertTimeout = 30000; // 断言超时，30秒（适用于页面加载、普通断言）
    this.pageLoadTimeout = 60000; // 页面加载超时，60秒（适用于医疗系统内网接口、慢加载页面）
  }

  // 访问URL
  async goto(url) {
    if (!url) throw new Error('goto 方法：url 参数不能为空');
    try {
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.pageLoadTimeout,
      });
    } catch (error) {
      throw new Error(`访问URL失败: "${url}"\n${error.message}`);
    }
  }

  // 输入
  async fill(label, value, options = {}) {
    if (!label) throw new Error('fill 方法：label 参数不能为空');
    if (value === undefined || value === null)
      throw new Error('fill 方法：value 参数不能为空');
    try {
      const { timeout = this.timeout } = options;
      await this.page.getByLabel(label).waitFor({ state: 'visible', timeout });
      await this.page.getByLabel(label).fill(value, { timeout });
    } catch (error) {
      throw new Error(
        `输入操作失败: 标签 "${label}", 值 "${value}"\n${error.message}`
      );
    }
  }

  // 点击按钮
  async click(text, options = {}) {
    if (!text) throw new Error('click 方法：text 参数不能为空');
    try {
      const { timeout = this.timeout } = options;
      await this.page
        .getByRole('button', { name: text })
        .waitFor({ state: 'visible', timeout });
      await this.page.getByRole('button', { name: text }).click({ timeout });
    } catch (error) {
      throw new Error(`点击按钮失败: "${text}"\n${error.message}`);
    }
  }

  // 获取文本
  async getText(selector) {
    if (!selector) throw new Error('getText 方法：selector 参数不能为空');
    try {
      return await this.page.textContent(selector, { timeout: this.timeout });
    } catch (error) {
      throw new Error(`获取文本失败: 选择器 "${selector}"\n${error.message}`);
    }
  }

  // 等待文字可见
  async waitForText(text, timeout = this.assertTimeout) {
    if (!text) throw new Error('waitForText 方法：text 参数不能为空');
    try {
      await this.page.getByText(text).waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(`等待文字可见失败: "${text}"\n${error.message}`);
    }
  }

  // 等待文字可见
  async waitForVisible(text, timeout = this.assertTimeout) {
    return this.waitForText(text, timeout);
  }

  // 截图
  async screenshot(name) {
    if (!name) throw new Error('screenshot 方法：name 参数不能为空');
    try {
      await this.page.screenshot({ path: `test-results/${name}.png` });
    } catch (error) {
      throw new Error(`截图失败: "${name}"\n${error.message}`);
    }
  }

  // 等待页面加载
  async waitLoad(timeout = this.timeout) {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
    } catch (error) {
      throw new Error(`等待页面加载失败\n${error.message}`);
    }
  }

  // 等待URL
  async waitUrl(url, timeout = this.pageLoadTimeout) {
    if (!url) throw new Error('waitUrl 方法：url 参数不能为空');
    try {
      await this.page.waitForURL(url, {
        timeout: timeout,
        waitUntil: 'networkidle',
      });
    } catch (error) {
      throw new Error(`等待URL失败: "${url}"\n${error.message}`);
    }
  }

  // 等待页面完全加载（网络空闲）
  async waitFullLoad() {
    try {
      await this.page.waitForLoadState('networkidle', {
        timeout: this.pageLoadTimeout,
      });
    } catch (error) {
      throw new Error(`等待页面完全加载失败\n${error.message}`);
    }
  }
}
