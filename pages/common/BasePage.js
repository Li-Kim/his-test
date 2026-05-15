/**
 * 基础页面类 - 所有页面类的基类
 * 封装通用操作：导航、输入、点击、等待
 */
export class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 10000; // 默认超时（简单操作）
    this.assertTimeout = 30000; // 断言超时（等待元素出现）
    this.pageLoadTimeout = 60000; // 页面加载超时（慢加载页面）
  }

  // ==================== 导航 ====================

  /**
   * 访问URL
   * @param {string} url - 目标地址
   */
  async goto(url) {
    if (!url) throw new Error('goto: url 不能为空');
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: this.pageLoadTimeout,
    });
  }

  /**
   * 等待URL匹配指定模式
   * @param {string|RegExp} pattern - URL模式，如 '/doctor' 或 /\/doctor/
   */
  async waitUrl(pattern) {
    if (!pattern) throw new Error('waitUrl: pattern 不能为空');
    await this.page.waitForURL(pattern, { timeout: this.pageLoadTimeout });
  }

  // ==================== 输入 ====================

  /**
   * 向输入框输入内容（通过label定位）
   * @param {string} label - 输入框的label属性值
   * @param {string} value - 要输入的内容
   * @example await this.fill('用户名', 'admin')
   */
  async fill(label, value) {
    if (!label) throw new Error('fill: label 不能为空');
    if (value == null) throw new Error('fill: value 不能为空');
    const element = this.page.getByLabel(label);
    await element.waitFor({ state: 'visible', timeout: this.timeout });
    await element.fill(value);
  }

  // ==================== 点击 ====================

  /**
   * 点击按钮（通过按钮文字定位）
   * @param {string} text - 按钮上的文字
   * @example await this.clickButton('确定')
   * @example await this.clickButton('保存')
   */
  async clickButton(text) {
    if (!text) throw new Error('clickButton: text 不能为空');
    const element = this.page.getByRole('button', { name: text, exact: true });
    await element.waitFor({ state: 'visible', timeout: this.timeout });
    // 等待元素稳定（动画完成）
    await element.waitFor({ state: 'attached', timeout: 5000 });
    // 使用 force: true 处理元素不稳定的情况（如hover效果）
    await element.click({ force: true, timeout: 10000 });
  }

  /**
   * 点击标签页（通过标签文字定位）
   * @param {string} text - 标签上的文字
   * @example await this.clickTab('病历')
   * @example await this.clickTab('处置')
   * @example await this.clickTab('西药')
   */
  async clickTab(text) {
    if (!text) throw new Error('clickTab: text 不能为空');
    const element = this.page.getByText(text, { exact: true }).first();
    await element.waitFor({ state: 'visible', timeout: this.timeout });
    await element.click();
  }

  /**
   * 点击包含指定文字的元素（通用方法）
   * @param {string} text - 文字内容
   * @param {Object} options - 可选配置
   * @param {string} options.role - 元素角色（如 'button', 'tab', 'link' 等）
   * @param {boolean} options.exact - 是否精确匹配
   * @example await this.clickText('确定', { role: 'button' })
   * @example await this.clickText('病历')  // 自动查找
   */
  async clickText(text, options = {}) {
    if (!text) throw new Error('clickText: text 不能为空');

    const { role, exact = true } = options;

    let element;
    if (role) {
      element = this.page.getByRole(role, { name: text, exact });
    } else {
      element = this.page.getByText(text, { exact });
    }

    await element.waitFor({ state: 'visible', timeout: this.timeout });
    await element.click();
  }

  // ==================== 等待 ====================

  /**
   * 等待页面上的文字可见
   * @param {string} text - 要等待的文字内容
   * @param {number} timeout - 超时时间（毫秒），默认30秒
   * @example await this.waitForVisible('挂号成功')
   */
  async waitForVisible(text, timeout = this.assertTimeout) {
    if (!text) throw new Error('waitForVisible: text 不能为空');
    await this.page.getByText(text).waitFor({ state: 'visible', timeout });
  }

  /**
   * 等待网络请求完成（页面完全加载）
   * @param {number} timeout - 超时时间（毫秒），默认60秒
   * @example await this.click('提交'); await this.waitForNetworkIdle();
   */
  async waitForNetworkIdle(timeout = this.pageLoadTimeout) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * 等待DOM加载完成
   */
  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded', {
      timeout: this.timeout,
    });
  }

  // ==================== 获取 ====================

  /**
   * 获取元素的文本内容
   * @param {string} selector - CSS选择器
   * @returns {Promise<string>} 元素的文本内容
   * @example const text = await this.getText('.status')
   */
  async getText(selector) {
    if (!selector) throw new Error('getText: selector 不能为空');
    return await this.page.textContent(selector, { timeout: this.timeout });
  }

  // ==================== 工具 ====================

  /**
   * 截图保存到 test-results 目录
   * @param {string} name - 截图文件名（不含.png后缀）
   * @example await this.screenshot('登录失败')
   */
  async screenshot(name) {
    if (!name) throw new Error('screenshot: name 不能为空');
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}
