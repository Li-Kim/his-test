import { BasePage } from '../common/BasePage.js';

/**
 * 登录页面类
 */
export class LoginPage extends BasePage {
  /**
   * 执行登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  async login(username, password) {
    await this.fill('*账号', username);
    await this.fill('*密码', password);
    await this.clickButton('login');
    await this.waitForLoad();
  }
}
