import { BasePage } from '../common/BasePage.js';

export class RefundPage extends BasePage {
  async searchInvoice(name) {
    await this.fill('患者姓名', name);
    await this.clickButton('查询');
  }

  async refund() {
    await this.clickButton('退费');
    await this.clickButton('确认退费');
    await this.waitForVisible('退费成功');
  }
}
