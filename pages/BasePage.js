// 基础页面类：所有页面（登录、挂号、医生站...）都继承这个类
// 封装通用方法：访问URL、输入、点击、等待、获取、截图、日志...
export class BasePage {
  constructor(page) {
    this.page = page;
  }

   // 访问URL（支持options）  timeout: 60000, 超时时间（毫秒） waitUntil: 'load'等待页面加载到什么程度
  async goto(url) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }
  
  // 输入
    async input(label, value) {
    await this.page.getByLabel(label).fill(value);
  }

  // 点击按钮
  async clickBtn(text) {
    await this.page.getByRole('button', { name: text }).click();
  }


  // 等待文字可见
   async waitText(text) {
    await this.page.getByText(text).waitFor({ state: 'visible' });
  }

  // 获取文本
  async getText(selector) {
    return await this.page.textContent(selector);
  }

 
  // load(完全加载)             页面所有资源加载完成（图片、样式、视频）
  // domcontentloaded(结构加载) 页面DOM结构加载完成（默认，推荐，速度快）
  // networkidle(网络空闲)      网络空闲（无请求，最稳但最慢）
  // 等待页面加载
  async waitLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // 等待页面完全加载（网络空闲，适合数据密集型页面）
  async waitFullLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // 截图
  async screenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  // 等待URL
  async waitUrl(url) {
    await this.page.waitForURL(url);
  }
}

