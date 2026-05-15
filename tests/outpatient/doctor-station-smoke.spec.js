import { test, expect } from '../../fixtures/login.fixture.js';
import { DoctorPage } from '../../pages/outpatient/DoctorPage.js';

/**
 * 医生站冒烟测试
 *
 * 目的：快速验证系统可用性，2分钟内完成
 * 范围：接诊→写病历→开诊断→开西药处方→结束就诊
 *
 * 运行命令：
 * npx playwright test tests/outpatient/doctor-station-smoke.spec.js
 */

test.describe('医生站冒烟测试', () => {
  test('SMOKE-001: 核心就诊流程（2分钟内完成）', async ({ page }) => {
    const doctorPage = new DoctorPage(page);

    // 1. 进入医生站
    await doctorPage.selectDepartment('外科门诊');
    await doctorPage.enterDoctorStation();

    // 2. 选择患者
    await doctorPage.selectPatient('测试挂号');
    await doctorPage.waitForVisitPage();

    // // 3. 快速写病历
    // await doctorPage.newMedicalRecord('test00001');
    // await doctorPage.fillMedicalRecord('患者一般情况良好。');
    // await doctorPage.saveMedicalRecord();
    // await doctorPage.renameMedicalRecord(`门诊病历_${Date.now()}`)

    // 4. 快速添加诊断
    await doctorPage.addDiagnosis('西医', '伤寒A01.000');

    // 5. 快速开西药处方
    await doctorPage.switchToPrescription();
    await doctorPage.switchDrugType('西药');

    // 填写药品信息（必填项：药品名称、频次、用法、天数）
    await doctorPage.fillDrug({
      name: '多潘立酮片',
      dose: '5', // 可选，不填则使用自动填充值或默认值10-30mg
      frequency: '每日3次',
      usage: '口服',
      days: '3',
    });

    // 6. 开立处方
    await doctorPage.submitPrescription();

    // 7. 结束就诊
    await doctorPage.endVisit();

    // 验证流程完成（检查结束就诊按钮存在）
    await expect(page.getByRole('button', { name: '结束就诊' })).toBeVisible({
      timeout: 5000,
    });
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
