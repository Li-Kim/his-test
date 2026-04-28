import { BasePage } from '../common/BasePage.js';

export class ChargePage extends BasePage {
  async searchPatient(name) {
    await this.fill('患者姓名', name);
    await this.click('查询');
  }

  async pay() {
    await this.click('确认收费');
    await this.waitForVisible('收费成功');
  }
}
