import { BasePage } from '../common/BasePage.js';

export class DoctorPage extends BasePage {
  async searchPatient(name) {
    await this.fill('患者姓名', name);
    await this.click('查询');
  }

  async receivePatient() {
    await this.click('接诊');
  }

  async addPrescription(drugName) {
    await this.click('新增处方');
    await this.fill('药品名称', drugName);
    await this.click('保存处方');
  }

  async cancelPrescription() {
    await this.click('撤销处方');
    await this.click('确认退方');
  }
}