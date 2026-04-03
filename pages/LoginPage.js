import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  async login(username, password) {
    await this.input('*账号', username);
    await this.input('*密码', password);
    await this.clickBtn('login');
    await this.waitLoad();
  }
}