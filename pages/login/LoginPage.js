import { BasePage } from '../common/BasePage.js';

export class LoginPage extends BasePage {
  async login(username, password, options = {}) {
    const { timeout = this.timeout } = options;
    await this.input('*账号', username, { timeout });
    await this.input('*密码', password, { timeout });
    await this.clickBtn('login', { timeout });
    await this.waitLoad(timeout);
  }
}