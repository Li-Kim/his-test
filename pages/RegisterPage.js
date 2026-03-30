import { BasePage } from './BasePage.js';

export class RegisterPage extends BasePage {
  async selectDeptAndDoctor(dept, doctor) {
    await this.page.getByText(dept).click();
    await this.page.getByText(doctor).first().click();
  }

  async fillPatientInfo(name, idCard, phone) {
    await this.fill('姓名', name);
    await this.fill('身份证号', idCard);
    await this.fill('手机号', phone);
  }

  async submitRegister() {
    await this.click('确认挂号');
    await this.waitForVisible('挂号成功');
  }

  async cancelRegister() {
    await this.click('作废挂号');
    await this.click('确认');
  }
}