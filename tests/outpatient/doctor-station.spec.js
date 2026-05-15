import { test, expect } from '../../fixtures/login.fixture.js';
import { DoctorPage } from '../../pages';
import { config } from '../../config/config.js';

test.beforeEach(async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  const currentUrl = page.url();

  // 如果不在工作台，先导航过去
  if (!currentUrl.includes('/workspace')) {
    await page.goto(config.baseUrl + '/workspace', { timeout: 15000 });
    await doctorPage.selectDepartment('外科门诊');
    await doctorPage.enterDoctorStation();
  } else if (!currentUrl.includes('/doctor-station')) {
    // 在工作台但不在医生站，需要进入医生站
    await doctorPage.selectDepartment('外科门诊');
    await doctorPage.enterDoctorStation();
  }

  await doctorPage.selectPatient('测试2');
  await doctorPage.waitForVisitPage();
});

test('DOC-001: 进入医生站并选择患者', async ({ page }) => {
  await expect(page).toHaveURL(/doctor-station/);
  await page.waitForTimeout(5000);
});

test('DOC-002: 写病历并保存', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord(
    '患者因咳嗽、发热3天就诊，查体体温38.5℃。'
  );
  await doctorPage.saveMedicalRecord();

  await expect(page.getByText(/保存|成功/)).toBeVisible({ timeout: 5000 });
});

test('DOC-003: 添加西医诊断', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者初诊，咳嗽伴流涕2天。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('西医', '上呼吸道感染');
  await doctorPage.confirmDiagnosis();

  await expect(page.getByText(/感冒|上呼吸|诊断/)).toBeVisible({
    timeout: 5000,
  });
});

test('DOC-004: 添加中医诊断', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者因胃痛、食欲不振就诊。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('中医', '脾胃虚弱');
  await doctorPage.confirmDiagnosis();
});

test('DOC-005: 添加藏医诊断', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者因头痛、失眠就诊。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('藏医', '隆病');
  await doctorPage.confirmDiagnosis();
});

test('DOC-006: 添加西药处方', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者因咳嗽、发热3天就诊。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('西医');

  await doctorPage.switchToPrescription();
  await doctorPage.switchDrugType('西药');
  await doctorPage.fillDrug({
    name: '阿莫西林',
    dose: '0.5g',
    quantity: '2盒',
    usage: '口服',
  });
});

test('DOC-007: 添加草药处方', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者因胃痛、食欲不振就诊。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('中医');

  await doctorPage.switchToPrescription();
  await doctorPage.switchDrugType('草药');
  await doctorPage.fillDrug({
    name: '党参',
    dose: '15g',
    quantity: '1剂',
  });
});

test('DOC-008: 开立处方', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者复诊，继续治疗。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('西医');

  await doctorPage.switchToPrescription();
  await doctorPage.switchDrugType('西药');
  await doctorPage.fillDrug({ name: '感冒胶囊', dose: '2粒', quantity: '1盒' });

  await doctorPage.submitPrescription();
  await expect(page.getByText(/开立|成功/)).toBeVisible({ timeout: 5000 });
});

test('DOC-010: 结束就诊', async ({ page }) => {
  const doctorPage = new DoctorPage(page);
  await doctorPage.newMedicalRecord();
  await doctorPage.fillMedicalRecord('患者一般情况良好。');
  await doctorPage.saveMedicalRecord();

  await doctorPage.switchToDisposition();
  await doctorPage.addDiagnosis('西医');
  await doctorPage.switchToPrescription();
  await doctorPage.fillDrug({ name: '维生素C' });
  await doctorPage.submitPrescription();

  await doctorPage.endVisit();
  await doctorPage.viewTodayPrescriptions();

  await expect(page.getByText(/今日|已开立|处方/)).toBeVisible({
    timeout: 5000,
  });
});
