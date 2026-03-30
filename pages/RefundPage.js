import { BasePage } from './BasePage.js';

export class RefundPage extends BasePage {
  async searchInvoice(name) {
    await this.fill('患者姓名', name);
    await this.click('查询');
  }

  async refund() {
    await this.click('退费');
    await this.click('确认退费');
    await this.waitForVisible('退费成功');
  }
}