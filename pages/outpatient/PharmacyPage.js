import { BasePage } from '../common/BasePage.js';

export class PharmacyPage extends BasePage {
  async searchPrescription(name) {
    await this.fill('患者姓名', name);
    await this.click('查询');
  }

  async sendDrug() {
    await this.click('发药');
  }

  async returnDrug() {
    await this.click('退药');
    await this.click('确认退药');
  }
}