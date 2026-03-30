// 基础页面类：所有页面（登录、挂号、医生站...）都继承这个类
// 封装通用方法：点击、输入、等待、截图、日志...
export class BasePage {
  constructor(page) {
    this.page = page;
  }

   // 访问URL（支持options）
  async goto(url, options) {
    await this.page.goto(url, options);
  }

  // 点击
  async click(text) {
    await this.page.getByRole('button', { name: text }).click();
  }

  // 输入
    async fill(label, value) {
    await this.page.getByLabel(label).fill(value);
  }

  // 等待元素可见
   async waitForVisible(text) {
    await this.page.getByText(text).waitFor({ state: 'visible' });
  }

  // 获取文本
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  // 等待加载完成
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // 截图
  async screenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  // 等待URL
  async waitForUrl(url) {
    await this.page.waitForURL(url);
  }


  // 封装：全自动登录
  async login(config) {
    await this.fill('*账号', config.username);
    await this.fill('*密码', config.password);
    await this.click('login');
    await this.waitForUrl('**/workspace**');
  }
}


