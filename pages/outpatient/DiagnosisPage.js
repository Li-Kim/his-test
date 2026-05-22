import { BasePage } from '../common/BasePage.js';

/**
 * 门诊诊断页面类
 * 处理诊断相关的所有操作
 */
export class DiagnosisPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      diagnosisType: {
        western: 'button:has-text("西医")',
        tcm: 'button:has-text("中医")',
        tibetan: 'button:has-text("藏医")',
      },
      diagnosisSearch: '.diagnosis-search input',
      confirmDiagnosisButton: 'button:has-text("确认")',
    };
  }

  /**
   * 切换到处方标签页（诊断在处置中）
   */
  async switchToPrescription() {
    const dispositionTab = this.page.getByText('处置', { exact: true }).first();

    try {
      const isActive = await dispositionTab
        .evaluate(el => {
          const label = el.closest('label.el-segmented__item');
          return label?.classList.contains('is-selected') ?? false;
        })
        .catch(() => false);

      if (!isActive) {
        await this.clickTab('处置');
      }
    } catch (_e) {
      await this.clickTab('处置');
    }

    await this.waitForNetworkIdle();
  }

  /**
   * 添加诊断（西医/中医/藏医）
   * @param {string} type - 诊断类型: '西医' | '中医' | '藏医'
   * @param {string} diagnosisName - 诊断名称（可选）
   */
  async addDiagnosis(type = '西医', diagnosisName) {
    await this.switchToPrescription();
    const selectButton = this.page
      .getByText(`请选择${type}诊断`)
      .or(this.page.getByPlaceholder(`请选择${type}诊断`))
      .or(this.page.locator(`text=请选择${type}诊断`))
      .first();
    await selectButton.waitFor({ state: 'visible', timeout: this.timeout });
    await selectButton.click();

    if (diagnosisName) {
      await this.page
        .getByText(diagnosisName)
        .first()
        .waitFor({ state: 'visible', timeout: 2000 });
      await this.page.getByText(diagnosisName).first().click();
    }
  }

  /**
   * 确认诊断
   */
  async confirmDiagnosis() {
    await this.clickButton('确认');
    await this.waitForNetworkIdle();
  }

  // ==================== 诊断扩展功能 ====================

  /**
   * 进入诊断页面（完整流程）
   * @param {string} diagnosisType - 诊断类型: '西医' | '中医' | '藏医'
   */
  async enterDiagnosis(diagnosisType = '西医') {
    await this.switchToPrescription();

    const enterBtn = this.page
      .locator('button')
      .filter({ hasText: new RegExp(`${diagnosisType}诊断`) })
      .locator('button')
      .filter({ hasText: '进入诊断' });

    await enterBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await enterBtn.click();
    await this.waitForNetworkIdle();
  }

  /**
   * 搜索诊断
   * @param {string} keyword - 搜索关键词
   */
  async searchDiagnosis(keyword) {
    if (!keyword) throw new Error('searchDiagnosis: keyword 不能为空');

    const searchInput = this.page.getByPlaceholder('搜索诊断名称');
    await searchInput.waitFor({ state: 'visible', timeout: this.timeout });
    await searchInput.fill(keyword);
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  /**
   * 通过名称选择诊断
   * @param {string} diagnosisName - 诊断名称
   */
  async selectDiagnosisByName(diagnosisName) {
    if (!diagnosisName)
      throw new Error('selectDiagnosisByName: diagnosisName 不能为空');

    const option = this.page.getByText(diagnosisName).first();
    await option.waitFor({ state: 'visible', timeout: this.timeout });
    await option.click();
  }
}
