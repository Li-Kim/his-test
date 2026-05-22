import { BasePage } from '../common/BasePage.js';

/**
 * 门诊处方页面类
 * 处理处方、药品、卫材、检查、检验等所有相关操作
 */
export class PrescriptionPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      // 处方类型标签
      prescriptionType: {
        western: 'tab:has-text("西药")',
        herbal: 'tab:has-text("草药")',
        patent: 'tab:has-text("中成药")',
        tibetan: 'tab:has-text("藏药")',
        material: 'tab:has-text("卫材")',
        exam: 'tab:has-text("检查")',
        lab: 'tab:has-text("检验")',
        treatment: 'tab:has-text("治疗")',
        blood: 'tab:has-text("输血")',
        surgery: 'tab:has-text("手术")',
      },
      // 处方表格
      tableBody: '.vxe-table--body tbody',
      tableRow: '.vxe-body--row',
      currentRow: '.vxe-body--row.row--current',
      tableColumn: '.vxe-body--column',
      // 按钮
      addDrugRowButton: 'button:has-text("新增一行"), button:has-text("新增")',
      savePrescriptionButton: 'button:has-text("暂存")',
      submitPrescriptionButton: 'button:has-text("开立")',
    };
  }

  // ==================== 处方基础操作 ====================

  /**
   * 切换到处方标签页
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
   * 切换药品/处方类型标签页
   * @param {string} type - 类型: '西药' | '草药' | '中成药' | '藏药' | '检查' | '检验'
   */
  async switchDrugType(type) {
    if (!type) throw new Error('switchDrugType: type 不能为空');
    await this.clickTab(type);
    await this.waitForNetworkIdle();
  }

  /**
   * 暂存处方
   */
  async savePrescription() {
    await this.clickButton('暂存');
    await this.waitForNetworkIdle();
  }

  /**
   * 开立处方
   */
  async submitPrescription() {
    await this.page
      .getByText('开立 (F4)')
      .or(this.page.getByText('开立(F4)'))
      .first()
      .click();
    await this.clickButton('确定');
    await this.waitForNetworkIdle();
  }

  // ==================== 药品相关 ====================

  /**
   * 获取当前药品行（优先最后一行，回退到当前选中行）
   * @returns {Locator} 当前行定位器
   */
  #getCurrentDrugRow() {
    return this.page
      .locator(
        `${this.selectors.tableBody} ${this.selectors.tableRow}:last-child`
      )
      .or(
        this.page.locator(
          `${this.selectors.tableBody} ${this.selectors.currentRow}`
        )
      )
      .first();
  }

  /**
   * 新增一行药品
   */
  async addDrugRow() {
    await this.clickButton('新增一行');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写药品名称
   * @param {string} drugName - 药品名称
   */
  async fillDrugName(drugName) {
    const currentRow = this.#getCurrentDrugRow();
    const drugCell = currentRow.locator(this.selectors.tableColumn).nth(3);
    await drugCell.click({ force: true });
    await this.page.getByText(drugName).first().click();
  }

  /**
   * 填写药品剂量
   * @param {string} dose - 剂量
   */
  async fillDrugDose(dose) {
    const currentRow = this.#getCurrentDrugRow();
    const doseInput = currentRow
      .locator(this.selectors.tableColumn)
      .nth(6)
      .locator('input')
      .first();
    await doseInput.fill(dose);
  }

  /**
   * 填写药品频次
   * @param {string} frequency - 频次
   */
  async fillDrugFrequency(frequency) {
    const currentRow = this.#getCurrentDrugRow();
    const freqCell = currentRow.locator(this.selectors.tableColumn).nth(8);
    await freqCell.click();
    await this.page.getByText(frequency).click();
  }

  /**
   * 填写药品用法
   * @param {string} usage - 用法
   */
  async fillDrugUsage(usage) {
    const currentRow = this.#getCurrentDrugRow();
    const usageCell = currentRow.locator(this.selectors.tableColumn).nth(9);
    await usageCell.click();
    await this.page.getByText(usage).click();
  }

  /**
   * 填写药品天数
   * @param {string} days - 天数
   */
  async fillDrugDays(days) {
    const currentRow = this.#getCurrentDrugRow();
    const daysInput = currentRow
      .locator(this.selectors.tableColumn)
      .nth(10)
      .locator('input')
      .first();
    await daysInput.fill(days);
  }

  /**
   * 填写完整药品信息
   */
  async fillDrug(drugInfo) {
    if (!drugInfo) throw new Error('fillDrug: 药品信息不能为空');
    if (!drugInfo.name) throw new Error('fillDrug: 药品名称不能为空');
    if (!drugInfo.frequency) throw new Error('fillDrug: 药品频次不能为空');
    if (!drugInfo.usage) throw new Error('fillDrug: 药品用法不能为空');

    await this.addDrugRow();

    await this.fillDrugName(drugInfo.name);
    await this.page
      .locator('.el-select-dropdown')
      .waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => {});

    if (drugInfo.dose) {
      await this.fillDrugDose(drugInfo.dose);
    }

    await this.fillDrugFrequency(drugInfo.frequency);
    await this.fillDrugUsage(drugInfo.usage);

    if (drugInfo.days) {
      await this.fillDrugDays(drugInfo.days);
    }
  }

  /**
   * 填写草药饮片信息（别名方法，与fillDrug相同）
   */
  async fillHerb(herbInfo) {
    return this.fillDrug(herbInfo);
  }

  // ==================== 卫材耗材 ====================

  /**
   * 新增卫材耗材行
   */
  async addMaterialRow() {
    await this.clickButton('新增');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写卫材耗材信息
   */
  async fillMaterial(materialInfo) {
    if (!materialInfo) throw new Error('fillMaterial: materialInfo 不能为空');
    await this.addMaterialRow();

    const input = this.page
      .locator('input[placeholder*="耗材名称"]')
      .or(this.page.locator('input[placeholder*="卫材"]'))
      .or(this.page.locator('input[placeholder*="材料"]'))
      .nth(-1);

    await input.waitFor({ state: 'visible', timeout: this.timeout });
    await input.fill(materialInfo.name);

    if (materialInfo.spec) {
      const specInput = this.page.locator('input[placeholder*="规格"]').nth(-1);
      if (await specInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await specInput.fill(materialInfo.spec);
      }
    }

    if (materialInfo.quantity) {
      const qtyInput = this.page.locator('input[placeholder*="数量"]').nth(-1);
      if (await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await qtyInput.fill(materialInfo.quantity);
      }
    }
  }

  // ==================== 检查申请 ====================

  /**
   * 新增检查申请行
   */
  async addExamRow() {
    await this.clickButton('新增');
    await this.clickButton('申请检查');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写检查申请信息
   */
  async fillExam(examInfo) {
    if (!examInfo) throw new Error('fillExam: examInfo 不能为空');
    await this.addExamRow();

    const input = this.page
      .locator('input[placeholder*="检查名称"]')
      .or(this.page.locator('input[placeholder*="检查项目"]'))
      .or(this.page.locator('input[placeholder*="项目"]'))
      .nth(-1);

    await input.waitFor({ state: 'visible', timeout: this.timeout });
    await input.fill(examInfo.name);

    if (examInfo.part) {
      const partInput = this.page.locator('input[placeholder*="部位"]').nth(-1);
      if (await partInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await partInput.fill(examInfo.part);
      }
    }

    if (examInfo.urgent) {
      await this.clickButton('加急');
    }
  }

  // ==================== 检验申请 ====================

  /**
   * 新增检验申请行
   */
  async addLabRow() {
    await this.clickButton('新增');
    await this.clickButton('申请检验');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写检验申请信息
   */
  async fillLab(labInfo) {
    if (!labInfo) throw new Error('fillLab: labInfo 不能为空');
    await this.addLabRow();

    const input = this.page
      .locator('input[placeholder*="检验名称"]')
      .or(this.page.locator('input[placeholder*="检验项目"]'))
      .or(this.page.locator('input[placeholder*="项目"]'))
      .nth(-1);

    await input.waitFor({ state: 'visible', timeout: this.timeout });
    await input.fill(labInfo.name);

    if (labInfo.sample) {
      const sampleInput = this.page
        .locator('input[placeholder*="标本"]')
        .or(this.page.locator('input[placeholder*="采样"]'))
        .nth(-1);
      if (await sampleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sampleInput.fill(labInfo.sample);
      }
    }

    if (labInfo.urgent) {
      await this.clickButton('加急');
    }
  }

  // ==================== 治疗项目 ====================

  /**
   * 新增治疗项目行
   */
  async addTreatmentRow() {
    await this.clickButton('新增');
    await this.clickButton('添加治疗');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写治疗项目信息
   */
  async fillTreatment(treatmentInfo) {
    if (!treatmentInfo)
      throw new Error('fillTreatment: treatmentInfo 不能为空');
    await this.addTreatmentRow();

    const input = this.page
      .locator('input[placeholder*="治疗名称"]')
      .or(this.page.locator('input[placeholder*="项目"]'))
      .nth(-1);

    await input.waitFor({ state: 'visible', timeout: this.timeout });
    await input.fill(treatmentInfo.name);

    if (treatmentInfo.freq) {
      const freqInput = this.page.locator('input[placeholder*="频次"]').nth(-1);
      if (await freqInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await freqInput.fill(treatmentInfo.freq);
      }
    }

    if (treatmentInfo.duration) {
      const durationInput = this.page
        .locator('input[placeholder*="疗程"]')
        .nth(-1);
      if (await durationInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await durationInput.fill(treatmentInfo.duration);
      }
    }
  }

  // ==================== 输血申请 ====================

  /**
   * 新增输血申请行
   */
  async addBloodRow() {
    await this.clickButton('新增');
    await this.clickButton('申请输血');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写输血申请信息
   */
  async fillBlood(bloodInfo) {
    if (!bloodInfo) throw new Error('fillBlood: bloodInfo 不能为空');
    await this.addBloodRow();

    const select = this.page
      .locator('select[name*="blood"], .el-select__input')
      .first();

    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.click();
      const option = this.page
        .getByText(bloodInfo.name || '红细胞悬液')
        .first();
      await option.click();
    }

    if (bloodInfo.quantity) {
      const qtyInput = this.page.locator('input[placeholder*="数量"]').nth(-1);
      await qtyInput.fill(bloodInfo.quantity);
    }

    if (bloodInfo.urgency) {
      const urgentSelect = this.page.locator('select[name*="urgency"]').first();
      if (await urgentSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await urgentSelect.selectOption(bloodInfo.urgency);
      }
    }
  }

  // ==================== 手术申请 ====================

  /**
   * 新增手术申请行
   */
  async addSurgeryRow() {
    await this.clickButton('新增');
    await this.clickButton('申请手术');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写手术申请信息
   */
  async fillSurgery(surgeryInfo) {
    if (!surgeryInfo) throw new Error('fillSurgery: surgeryInfo 不能为空');
    await this.addSurgeryRow();

    const input = this.page
      .locator('input[placeholder*="手术名称"]')
      .or(this.page.locator('input[placeholder*="术式"]'))
      .nth(-1);

    await input.waitFor({ state: 'visible', timeout: this.timeout });
    await input.fill(surgeryInfo.name);

    if (surgeryInfo.anesthesia) {
      const anesSelect = this.page
        .locator('select[name*="anesthesia"]')
        .or(this.page.locator('.el-select:has-text("麻醉")'));
      if (await anesSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await anesSelect.click();
        await this.page.getByText(surgeryInfo.anesthesia).first().click();
      }
    }

    if (surgeryInfo.level) {
      const levelSelect = this.page.locator('select[name*="level"]').first();
      if (await levelSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await levelSelect.selectOption(surgeryInfo.level);
      }
    }
  }

  // ==================== 处方扩展功能 ====================

  /**
   * 成组处方
   */
  async groupPrescriptions() {
    await this.clickButton('成组');
    await this.waitForNetworkIdle();
  }

  /**
   * 解散组
   */
  async ungroupPrescriptions() {
    await this.clickButton('解散组');
    await this.waitForNetworkIdle();
  }

  /**
   * 批量删除处方
   */
  async batchDeletePrescriptions() {
    await this.clickButton('批量删除');

    try {
      await this.clickButton('确定');
    } catch {
      // 可能不需要确认
    }

    await this.waitForNetworkIdle();
  }

  /**
   * 选择自动分方类型
   */
  async selectAutoGrouping(type) {
    const select = this.page
      .getByText('自动分方')
      .locator('..')
      .locator('select');
    await select.waitFor({ state: 'visible', timeout: this.timeout });
    await select.selectOption(type);
    await this.waitForNetworkIdle();
  }

  /**
   * 获取费用统计信息
   */
  async getCostSummary() {
    const costText = await this.page
      .getByText(/总费用|西药费|草药费/)
      .textContent();

    const parseCost = (text, label) => {
      const match = text.match(new RegExp(`${label}\\s*[:：]?\\s*([\\d.]+)`));
      return match ? parseFloat(match[1]) : 0;
    };

    return {
      total: parseCost(costText, '总费用'),
      western: parseCost(costText, '西药费'),
      herbal: parseCost(costText, '草药费'),
      tibetan: parseCost(costText, '藏药费'),
      material: parseCost(costText, '卫材费'),
      exam: parseCost(costText, '检查费'),
      lab: parseCost(costText, '检验费'),
      treatment: parseCost(costText, '治疗费'),
      surgery: parseCost(costText, '手术费'),
      blood: parseCost(costText, '输血费'),
    };
  }

  /**
   * 查看今日已开立处方
   */
  async viewTodayPrescribed() {
    await this.clickButton('今日已开立');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换治疗方案标签页
   */
  async switchTreatmentPlanTab(tabName = '模板') {
    await this.clickTab(tabName);
    await this.waitForNetworkIdle();
  }

  /**
   * 搜索治疗方案模板
   */
  async searchTreatmentTemplate(templateName) {
    if (!templateName)
      throw new Error('searchTreatmentTemplate: templateName 不能为空');

    const searchInput = this.page.getByPlaceholder('搜索模板名称');
    await searchInput.waitFor({ state: 'visible', timeout: this.timeout });
    await searchInput.fill(templateName);
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  /**
   * 选择治疗方案分类
   */
  async selectTreatmentCategory(category = '全部') {
    await this.clickButton(category);
    await this.waitForNetworkIdle();
  }

  /**
   * 选择治疗方案模板
   */
  async selectTreatmentTemplate(templateName) {
    if (!templateName)
      throw new Error('selectTreatmentTemplate: templateName 不能为空');

    const template = this.page.getByText(templateName).first();
    await template.waitFor({ state: 'visible', timeout: this.timeout });
    await template.click();
    await this.waitForNetworkIdle();
  }

  /**
   * 使用快捷键暂存处方 (F3)
   */
  async quickSavePrescription() {
    await this.page.keyboard.press('F3');
    await this.waitForNetworkIdle();
  }

  /**
   * 使用快捷键开立处方 (F4)
   */
  async quickSubmitPrescription() {
    await this.page.keyboard.press('F4');
    try {
      await this.clickButton('确定');
    } catch {
      // 可能不需要确认
    }
    await this.waitForNetworkIdle();
  }

  /**
   * 使用快捷键打印 (F1)
   */
  async quickPrint() {
    await this.page.keyboard.press('F1');
    await this.waitForNetworkIdle();
  }

  /**
   * 使用快捷键存为模板 (F2)
   */
  async quickSaveAsTemplate() {
    await this.page.keyboard.press('F2');
    await this.waitForNetworkIdle();
  }
}
