import { test } from '../../fixtures/login.fixture.js';
import { DoctorPage } from '../../pages/outpatient/DoctorPage.js';

/**
 * 删除病历工具脚本
 * 运行方式: npx playwright test tests/outpatient/delete-medical-records.spec.js
 */

test('删除指定患者的所有病历', async ({ page }) => {
  const doctorPage = new DoctorPage(page);

  // 1. 选择科室
  await doctorPage.selectDepartment('外科门诊');
  await doctorPage.enterDoctorStation();

  // 2. 选择患者（修改这里删除不同患者的病历）
  const patientName = '测试2';
  await doctorPage.selectPatient(patientName);
  await doctorPage.waitForVisitPage();

  // 3. 删除该患者的所有病历
  await deleteAllMedicalRecords(page, doctorPage);
});

/**
 * 删除当前患者的所有病历（保留最后一个）
 */
async function deleteAllMedicalRecords(page, doctorPage) {
  let count = 0;

  while (true) {
    // 查找所有"已保存"按钮
    const savedButtons = page.getByRole('button', { name: '已保存' });
    const buttonCount = await savedButtons.count();

    if (buttonCount === 0) {
      console.log('✅ 该患者没有病历');
      break;
    }

    // 系统要求保留至少一个病历，当只剩一个时停止
    if (buttonCount === 1) {
      console.log('⚠️ 系统要求保留至少一个病历，停止删除');
      break;
    }

    // 点击第一个"已保存"按钮
    await savedButtons.first().click();

    // 等待菜单出现，点击"删除"选项
    const deleteOption = page.getByRole('menuitem', { name: '删除' }).first();
    await deleteOption.click();

    // 确认删除
    await doctorPage.clickButton('确定');
    // 等待删除成功提示或页面变化（替代硬等待）
    await page
      .waitForSelector('text=删除成功', { timeout: 5000 })
      .catch(() => {});

    count++;
    console.log(`🗑️ 已删除 ${count} 个病历`);
  }

  console.log(`✅ 共删除了 ${count} 个病历，保留了 1 个病历`);
  return count;
}
