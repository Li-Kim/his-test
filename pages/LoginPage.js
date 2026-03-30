import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  async login(username, password) {
    await this.fill('* 账号', username);
    await this.fill('* 密码', password);
    await this.click('登录');
    await this.waitForLoad();
  }
}