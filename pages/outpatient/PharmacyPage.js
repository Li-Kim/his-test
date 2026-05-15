import { BasePage } from '../common/BasePage.js';

export class PharmacyPage extends BasePage {
  async searchPrescription(name) {
    await this.fill('患者姓名', name);
    await this.clickButton('查询');
  }

  async sendDrug() {
    await this.clickButton('发药');
  }

  async returnDrug() {
    await this.clickButton('退药');
    await this.clickButton('确认退药');
  }
}
