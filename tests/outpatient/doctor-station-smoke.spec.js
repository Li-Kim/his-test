import { expect, test } from '../../fixtures/login.fixture.js';
import { DoctorPage } from '../../pages/outpatient/DoctorPage.js';

/**
 * 医生站冒烟测试
 *
 * 目的：快速验证系统可用性，2分钟内完成
 * 范围：接诊→写病历→开诊断→开西药处方→结束就诊
 *
 */

test.describe('医生站冒烟测试', () => {
  test('SMOKE-001: 核心就诊流程（2分钟内完成）', async ({ page }) => {
    const doctorPage = new DoctorPage(page);

    // 1. 进入医生站
    await doctorPage.selectDepartment('外科门诊');
    await doctorPage.enterDoctorStation();

    // 2. 选择患者（点击"接诊"进入编辑模式）
    await doctorPage.startTreatment('测试挂号');
    await doctorPage.waitForVisitPage();

    // 3. 快速写病历（使用病历模块）
    await doctorPage.medicalRecord.newMedicalRecord('门诊病历2');
    await doctorPage.medicalRecord.fillMedicalRecord('患者一般情况良好。');
    await doctorPage.medicalRecord.saveMedicalRecord();
    // await doctorPage.medicalRecord.renameMedicalRecord(`门诊病历_${Date.now()}`)

    // 4. 快速添加诊断（使用诊断模块）
    await doctorPage.diagnosis.addDiagnosis('西医', '伤寒A01.000');
    await doctorPage.diagnosis.addDiagnosis('中医', '感冒A01.01.01');

    // 5. 快速开西药处方（使用处方模块）
    await doctorPage.prescription.switchToPrescription();
    await doctorPage.prescription.switchDrugType('西药');

    // 填写药品信息（必填项：药品名称、频次、用法、天数）
    await doctorPage.prescription.fillDrug({
      name: '多潘立酮片',
      dose: '5',
      frequency: '每日三次',
      usage: '口服',
      days: '3',
    });

    // 6. 开立处方
    await doctorPage.prescription.submitPrescription();

    // 7. 结束就诊（使用就诊管理模块）
    await doctorPage.visitManagement.endVisit();

    // 验证：回到了患者列表页面（接诊按钮可见）
    await expect(page.getByText('接诊')).toBeVisible();
  });
});

/**
 * 运行命令
 *
 * 运行冒烟测试:
 * npx playwright test tests/outpatient/doctor-station-smoke.spec.js
 *
 * 调试模式:
 * npx playwright test tests/outpatient/doctor-station-smoke.spec.js --debug
 */
