import { BasePage } from '../common/BasePage.js';

export class LoginPage extends BasePage {
  async login(username, password, options = {}) {
    const { timeout = this.timeout } = options;
    await this.fill('*账号', username, { timeout });
    await this.fill('*密码', password, { timeout });
    await this.click('login', { timeout });
    await this.waitLoad(timeout);
  }
}
