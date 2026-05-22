import { BasePage } from '../common/BasePage.js';
import { DiagnosisPage } from './DiagnosisPage.js';
import { MedicalRecordPage } from './MedicalRecordPage.js';
import { PrescriptionPage } from './PrescriptionPage.js';
import { VisitManagementPage } from './VisitManagementPage.js';

/**
 * 门诊医生站页面类（主入口）
 * 完整就诊流程：科室选择 → 业务选择 → 医生站 → 患者管理 → 看诊 → 病历 → 诊断 → 处方 → 开立 → 结束就诊
 *
 * 此类组合了各个功能模块，提供统一的访问接口
 */
export class DoctorPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      // 工作台入口区
      departmentDropdown: '.dept-selector__label',
      deptDialog: '.dept-dialog-body',
      deptSelect: '.dept-dialog-row__select',
      saveBtn: 'button:has-text("保存")',
      cancelBtn: 'button:has-text("取消")',
      businessDropdown: '.business-select, select[name="business"]',
      doctorStationButton: 'button:has-text("门诊医生站")',
      patientManagementButton: 'button:has-text("患者管理")',
      // 患者列表区
      patientTable: '.patient-table, .patient-list',
      patientRow: '.vxe-body--row',
    };

    // 初始化功能模块
    this.medicalRecord = new MedicalRecordPage(page);
    this.diagnosis = new DiagnosisPage(page);
    this.prescription = new PrescriptionPage(page);
    this.visitManagement = new VisitManagementPage(page);
  }

  // ==================== 工作台操作 ====================

  /**
   * 选择门诊科室（弹窗式选择器）
   */
  async selectDepartment(deptName) {
    if (!deptName) throw new Error('selectDepartment: deptName 不能为空');

    const triggerBtn = this.page.locator(this.selectors.departmentDropdown);
    await triggerBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await triggerBtn.click();

    const dialog = this.page.locator(this.selectors.deptDialog);
    await dialog.waitFor({ state: 'visible', timeout: this.timeout });

    const deptSelector = this.page.locator(this.selectors.deptSelect).first();
    await deptSelector.waitFor({ state: 'visible', timeout: this.timeout });
    await deptSelector.click();

    const deptOption = this.page
      .locator('.el-select-dropdown__item', { hasText: deptName })
      .first();
    await deptOption.waitFor({ state: 'visible', timeout: this.timeout });
    await deptOption.click();

    await this.saveDepartmentChange();
    await this.waitForNetworkIdle();
  }

  /**
   * 选择门诊业务
   */
  async selectBusiness(businessName) {
    if (!businessName) throw new Error('selectBusiness: businessName 不能为空');
    await this.waitForVisible(businessName);
    await this.clickButton(businessName);
    await this.waitForNetworkIdle();
  }

  /**
   * 点击门诊医生站
   */
  async enterDoctorStation() {
    const doctorStationBtn = this.page.getByText('门诊医生站').first();
    await doctorStationBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await doctorStationBtn.click();
    await this.waitForNetworkIdle();
  }

  /**
   * 点击弹窗中的保存按钮
   */
  async saveDepartmentChange() {
    const saveBtn = this.page.locator(this.selectors.saveBtn);
    await saveBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await saveBtn.click();
    await this.waitForNetworkIdle();
  }

  // ==================== 患者列表操作 ====================

  /**
   * 在患者列表中双击患者姓名查看信息
   */
  async selectPatient(patientName) {
    if (!patientName) throw new Error('selectPatient: patientName 不能为空');

    const patientCell = this.page
      .getByText(patientName, { exact: true })
      .first();
    await patientCell.waitFor({ state: 'visible', timeout: this.timeout });
    await patientCell.dblclick();
    await this.waitForNetworkIdle();
  }

  /**
   * 点击患者行的"接诊"按钮进入编辑模式
   * @returns {string} 门诊ID（挂号流水号）
   */
  async startTreatment(patientName) {
    if (!patientName) throw new Error('startTreatment: patientName 不能为空');

    const targetRow = this.page
      .locator(this.selectors.patientRow)
      .filter({ has: this.page.getByText(patientName) })
      .first();

    await targetRow.waitFor({ state: 'visible', timeout: this.timeout });

    const clinicId = await targetRow
      .locator('td')
      .nth(4)
      .textContent()
      .then(t => t.trim());
    console.log(`📋 患者: ${patientName}, 门诊ID: ${clinicId}`);

    await targetRow.getByText('接诊').click();

    await this.page.waitForURL(new RegExp(`fwid=${clinicId}`), {
      timeout: this.pageLoadTimeout,
    });

    console.log(`✅ 跳转成功，fwid=${clinicId}`);
    await this.waitForNetworkIdle();
  }

  /**
   * 等待进入看诊界面
   */
  async waitForVisitPage() {
    await this.page.waitForURL(/doctor|visit|medical/, {
      timeout: this.pageLoadTimeout,
    });
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ==================== 标签页操作 ====================

  /**
   * 切换到处方标签页（处置）
   */
  async switchToPrescription() {
    await this.prescription.switchToPrescription();
  }

  // ==================== 组合方法（完整流程） ====================

  /**
   * 完整就诊流程
   */
  async fullVisitProcess(options = {}) {
    const {
      deptName = '门诊科室',
      patientName = '测试2 女',
      medicalRecord = '患者一般情况良好。',
      diagnoses = ['西医'],
      prescriptions = [],
      autoEndVisit = true,
    } = options;

    await this.selectDepartment(deptName);
    await this.enterDoctorStation();
    await this.selectPatientManagement();
    await this.selectPatient(patientName);
    await this.waitForVisitPage();

    await this.medicalRecord.newMedicalRecord();
    await this.medicalRecord.fillMedicalRecord(medicalRecord);
    await this.medicalRecord.saveMedicalRecord();

    await this.switchToPrescription();
    for (const diagnosis of diagnoses) {
      await this.diagnosis.addDiagnosis(diagnosis);
    }
    await this.diagnosis.confirmDiagnosis();

    if (prescriptions.length > 0) {
      await this.switchToPrescription();
      for (const prescription of prescriptions) {
        await this.prescription.switchDrugType(prescription.type);
        if (prescription.drugs?.length > 0) {
          for (const drug of prescription.drugs) {
            await this.prescription.fillDrug(drug);
          }
        }
      }
      await this.prescription.submitPrescription();
    }

    if (autoEndVisit) {
      await this.visitManagement.endVisit();
      await this.visitManagement.viewTodayPrescriptions();
    }
  }

  /**
   * 快速开方流程
   */
  async quickPrescribe(patientName, prescriptions) {
    if (!patientName) throw new Error('quickPrescribe: patientName 不能为空');
    if (!prescriptions?.length) {
      throw new Error('quickPrescribe: prescriptions 不能为空');
    }

    await this.selectDepartment('门诊科室');
    await this.enterDoctorStation();
    await this.selectPatientManagement();
    await this.selectPatient(patientName);
    await this.waitForVisitPage();

    await this.switchToPrescription();

    for (const prescription of prescriptions) {
      await this.prescription.switchDrugType(prescription.type);
      if (prescription.drugs?.length > 0) {
        for (const drug of prescription.drugs) {
          await this.prescription.fillDrug(drug);
        }
      }
    }

    await this.prescription.submitPrescription();
    await this.visitManagement.endVisit();
  }
}
