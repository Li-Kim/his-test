import { BasePage } from '../common/BasePage.js';

/**
 * 就诊管理页面类
 * 处理就诊结束、患者列表等相关操作
 */
export class VisitManagementPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      endVisitButton: 'button:has-text("结束就诊")',
      todayPrescriptionsButton: 'button:has-text("今日已开立")',
      patientRow: '.vxe-body--row',
    };
  }

  // ==================== 就诊管理 ====================

  /**
   * 结束就诊
   */
  async endVisit() {
    // 点击结束就诊（无任何等待）
    await this.clickButton('结束就诊', { exact: false });

    // 点击第一个确定（自动等待弹窗出现，无固定延时）
    await this.clickButton('确定');

    // 尝试点击第二个确定，无则跳过
    try {
      await this.clickButton('确定', { timeout: 1000 });
    } catch {}

    await this.waitForNetworkIdle();
  }

  /**
   * 查看今日已开立
   */
  async viewTodayPrescriptions() {
    await this.clickButton('今日已开立');
    await this.waitForNetworkIdle();
  }

  // ==================== 患者列表相关 ====================

  /**
   * 呼叫患者
   * @param {string} patientName - 患者姓名
   */
  async callPatient(patientName) {
    if (!patientName) throw new Error('callPatient: patientName 不能为空');

    const callBtn = this.page
      .getByRole('row')
      .filter({ hasText: patientName })
      .getByRole('button', { name: '呼叫' });

    await callBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await callBtn.click();
    await this.waitForNetworkIdle();
  }

  /**
   * 获取未呼叫患者数量
   * @returns {number} 未呼叫数量
   */
  async getUnCalledCount() {
    const button = this.page.getByRole('button', { name: /未\s*呼叫\s*\d+/ });
    const text = await button.textContent();
    const match = text.match(/未\s*呼叫\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * 获取总患者数量
   * @returns {number} 总数量
   */
  async getTotalCount() {
    const button = this.page.getByRole('button', { name: /总数\s*\d+/ });
    const text = await button.textContent();
    const match = text.match(/总数\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * 切换到今日门诊
   */
  async switchToTodayOutpatient() {
    await this.clickButton('今日门诊');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到诊间加号
   */
  async switchToWalkIn() {
    await this.clickButton('诊间加号');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到本医生患者
   */
  async switchToMyPatients() {
    await this.clickTab('本医生患者');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到全科室患者
   */
  async switchToAllDeptPatients() {
    await this.clickTab('全科室患者');
    await this.waitForNetworkIdle();
  }

  /**
   * 筛选患者
   * @param {Object} filterOptions - 筛选选项
   * @param {string} filterOptions.field - 筛选字段（如：就诊状态、签到状态）
   * @param {string} filterOptions.value - 筛选值
   */
  async filterPatients(filterOptions = {}) {
    const { field, value } = filterOptions;

    if (field) {
      const fieldSelect = this.page
        .locator('.el-select')
        .filter({ hasText: '请选择' })
        .first();
      await fieldSelect.click();
      await this.page.getByText(field).first().click();
    }

    if (value) {
      const input = this.page.getByPlaceholder('请输入');
      await input.fill(value);
    }

    await this.clickButton('筛选');
    await this.waitForNetworkIdle();
  }

  /**
   * 查询患者
   * @param {string} keyword - 查询关键词
   */
  async searchPatients(keyword) {
    if (!keyword) throw new Error('searchPatients: keyword 不能为空');

    const input = this.page.getByPlaceholder('请输入');
    await input.fill(keyword);
    await this.clickButton('查询');
    await this.waitForNetworkIdle();
  }

  /**
   * 选择就诊类型（初诊/复诊）
   * @param {string} visitType - 就诊类型: '初诊' | '复诊'
   */
  async selectVisitType(visitType = '初诊') {
    const radioButton = this.page.getByRole('radio', { name: visitType });
    await radioButton.waitFor({ state: 'visible', timeout: this.timeout });
    await radioButton.check();
    await this.waitForNetworkIdle();
  }

  /**
   * 读卡获取患者信息
   */
  async readCard() {
    await this.clickButton('读卡');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到患者列表
   */
  async switchToPatientList() {
    await this.clickButton('患者列表');
    await this.waitForNetworkIdle();
  }

  // ==================== 页面状态检查 ====================

  /**
   * 等待页签激活
   * @param {string} tabName - 页签名称
   */
  async waitForTabActive(tabName) {
    const tab = this.page.getByRole('tab', { name: tabName });
    await tab.waitFor({ state: 'visible', timeout: this.timeout });
    await tab.evaluate(
      el =>
        el.getAttribute('aria-selected') === 'true' ||
        Promise.reject('Tab not active')
    );
  }
}
