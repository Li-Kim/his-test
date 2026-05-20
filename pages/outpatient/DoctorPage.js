import { BasePage } from '../common/BasePage.js';

/**
 * 门诊医生站页面类
 * 完整就诊流程：科室选择 → 业务选择 → 医生站 → 患者管理 → 看诊 → 病历 → 诊断 → 处方 → 开立 → 结束就诊
 */
export class DoctorPage extends BasePage {
  constructor(page) {
    super(page);

    // 【选择器仓库：只存放页面元素定位】
    // 左边：自定义名字   右边：Playwright 定位语法
    this.selectors = {
      // ===================== 工作台入口区 =====================
      departmentDropdown: '.dept-selector__label',
      deptDialog: '.dept-dialog-body', // 科室弹窗容器
      deptSelect: '.dept-dialog-row__select', // 科室选择器（通用）
      saveBtn: 'button:has-text("保存")', // 弹窗保存按钮
      cancelBtn: 'button:has-text("取消")', // 弹窗取消按钮
      businessDropdown: '.business-select, select[name="business"]',
      doctorStationButton: 'button:has-text("门诊医生站")',
      patientManagementButton: 'button:has-text("患者管理")',

      // ===================== 患者列表区 =====================
      patientTable: '.patient-table, .patient-list',
      patientRow: '.patient-row, tr.patient',

      // ===================== 顶部标签页 =====================
      medicalRecordTab: 'tab:has-text("病历")',
      dispositionTab: 'tab:has-text("处置")',
      prescriptionTab: 'tab:has-text("处方")',

      // ===================== 病历模块 =====================
      newRecordButton: 'button:has-text("新建")',
      editorContent: '.tiptap',
      templateDialog: '.el-dialog:has-text("选择模板")',
      saveRecordButton: 'button:has-text("保存")',

      // ===================== 诊断模块 =====================
      diagnosisType: {
        western: 'button:has-text("西医")',
        tcm: 'button:has-text("中医")',
        tibetan: 'button:has-text("藏医")',
      },
      diagnosisSearch: '.diagnosis-search input',
      confirmDiagnosisButton: 'button:has-text("确认")',

      // ===================== 处方分类标签 =====================
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

      // ===================== 处方药品录入 =====================
      addDrugRowButton: 'button:has-text("新增一行"), button:has-text("新增")',
      drugNameInput: 'input[placeholder*="药品名称"]',
      drugDoseInput: 'input[placeholder*="剂量"]',
      drugQuantityInput: 'input[placeholder*="数量"]',
      drugUsageInput: 'input[placeholder*="用法"]',

      // ===================== 处方操作按钮 =====================
      savePrescriptionButton: 'button:has-text("暂存")',
      submitPrescriptionButton: 'button:has-text("开立")',

      // ===================== 就诊结束相关 =====================
      endVisitButton: 'button:has-text("结束就诊")',
      todayPrescriptionsButton: 'button:has-text("今日已开立")',
      prescriptionsList: '.prescriptions-list',
    };
  }

  // ==================== 1. 工作台操作 ====================

  /**
   * 选择门诊科室（弹窗式选择器）
   * 流程：点击科室标签 → 等待弹窗 → 点击选择器 → 选择科室
   * @param {string} deptName - 科室名称
   */
  async selectDepartment(deptName) {
    if (!deptName) throw new Error('selectDepartment: deptName 不能为空');

    // 1. 点击顶部的科室标签，触发弹窗
    const triggerBtn = this.page.locator(this.selectors.departmentDropdown);
    await triggerBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await triggerBtn.click();

    // 2. 等待弹窗出现
    const dialog = this.page.locator(this.selectors.deptDialog);
    await dialog.waitFor({ state: 'visible', timeout: this.timeout });

    // 3. 点击弹窗中的科室选择器（第一个 el-select）
    const deptSelector = this.page.locator(this.selectors.deptSelect).first();
    await deptSelector.waitFor({ state: 'visible', timeout: this.timeout });
    await deptSelector.click();

    // 4. 等待下拉选项出现并选择（使用 el-select 下拉选项的特征定位，避免模糊匹配）
    const deptOption = this.page
      .locator('.el-select-dropdown__item', { hasText: deptName })
      .first();
    await deptOption.waitFor({ state: 'visible', timeout: this.timeout });
    await deptOption.click();

    //5. 点击弹窗中的保存按钮
    await this.saveDepartmentChange();

    await this.waitForNetworkIdle();
  }

  /**
   * 选择住院科室
   * @param {string} deptName - 住院科室名称
   */
  async selectInpatientDept(deptName) {
    if (!deptName) throw new Error('selectInpatientDept: deptName 不能为空');

    // 点击第二个 el-select（住院科室）
    const inpatientSelector = this.page
      .locator(this.selectors.deptSelect)
      .nth(1);
    await inpatientSelector.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });
    await inpatientSelector.click();

    // 选择目标科室
    const deptOption = this.page.getByText(deptName, { exact: true });
    await deptOption.waitFor({ state: 'visible', timeout: this.timeout });
    await deptOption.click();

    await this.waitForNetworkIdle();
  }

  /**
   * 选择住院病区
   * @param {string} wardName - 病区名称
   */
  async selectWard(wardName) {
    if (!wardName) throw new Error('selectWard: wardName 不能为空');

    // 点击第三个 el-select（住院病区）
    const wardSelector = this.page.locator(this.selectors.deptSelect).nth(2);
    await wardSelector.waitFor({ state: 'visible', timeout: this.timeout });
    await wardSelector.click();

    // 选择目标病区
    const wardOption = this.page.getByText(wardName, { exact: true });
    await wardOption.waitFor({ state: 'visible', timeout: this.timeout });
    await wardOption.click();

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

  /**
   * 点击弹窗中的取消按钮
   */
  async cancelDepartmentChange() {
    const cancelBtn = this.page.locator(this.selectors.cancelBtn);
    await cancelBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await cancelBtn.click();
    await this.waitForNetworkIdle();
  }

  /**
   * 选择门诊业务（下拉框）
   * @param {string} businessName - 业务名称，如"门诊业务"
   */
  async selectBusiness(businessName) {
    if (!businessName) throw new Error('selectBusiness: businessName 不能为空');
    await this.waitForVisible(businessName);
    await this.clickButton(businessName);
    await this.waitForNetworkIdle();
  }

  /**
   * 点击门诊医生站（直接使用 getByText 定位）
   */
  async enterDoctorStation() {
    const doctorStationBtn = this.page.getByText('门诊医生站').first();
    await doctorStationBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await doctorStationBtn.click();
    await this.waitForNetworkIdle();
  }

  // ==================== 2. 患者列表操作 ====================

  /**
   * 在患者列表中双击选择待看病患者
   * @param {string} patientName - 患者姓名
   */
  async selectPatient(patientName) {
    if (!patientName) throw new Error('selectPatient: patientName 不能为空');

    // 使用精确文本匹配，如果有多个同名患者则选择第一个
    const patientCell = this.page
      .getByText(patientName, { exact: true })
      .first();
    await patientCell.waitFor({ state: 'visible', timeout: this.timeout });
    await patientCell.dblclick();
    await this.waitForNetworkIdle();
  }

  /**
   * 等待进入看诊界面
   */
  async waitForVisitPage() {
    await this.page.waitForURL(/doctor|visit|medical/, { timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ==================== 3. 病历相关 ====================

  /**
   * 切换到病历标签页
   */
  async switchToMedicalRecord() {
    const element = this.page.getByText('病历', { exact: true }).first();
    await element.waitFor({ state: 'visible', timeout: this.timeout });
    await element.click();
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到处置标签页
   */
  async switchToDisposition() {
    await this.clickTab('处置');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到处方标签页
   * 注意：在当前系统中，处方功能在"处置"标签页中，不需要单独切换
   */
  async switchToPrescription() {
    // 处方功能在"处置"标签页中，如果不在处置标签页则切换过去
    const currentTab = this.page.getByText('处置', { exact: true }).first();
    try {
      // 检查是否已经在处置标签页
      const isActive = await currentTab
        .evaluate(
          el =>
            el.classList.contains('active') ||
            el.getAttribute('aria-selected') === 'true'
        )
        .catch(() => false);
      if (!isActive) {
        await this.switchToDisposition();
      }
    } catch {
      // 如果检查失败，直接切换到处置标签页
      await this.switchToDisposition();
    }
    await this.waitForNetworkIdle();
  }

  /**
   * 点击新建病历
   * @param {string} templateName - 病历模板名称，如'门诊通用病历'，不传则关闭模板弹窗
   */
  async newMedicalRecord(templateName) {
    // 1. 点击新建按钮（定位到病历编辑区的新建按钮）
    const newButton = this.page
      .locator('button')
      .filter({ hasText: '新建' })
      .first();
    await newButton.waitFor({ state: 'visible', timeout: 5000 });
    await newButton.click();

    // 2. 等待"创建病历"弹窗出现
    const dialog = this.page
      .locator('[role="dialog"]')
      .filter({ hasText: '创建病历' });
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // 3. 等待弹窗内容加载
    await this.page.waitForTimeout(1000);

    if (templateName) {
      // 4. 在弹窗中查找并双击模板
      const template = dialog.getByText(templateName).first();
      await template.waitFor({ state: 'visible', timeout: 5000 });
      await template.dblclick();

      // 等待双击生效
      await this.page.waitForTimeout(500);

      // 5. 点击确定按钮生成病历（使用文本定位，更可靠）
      const confirmBtn = dialog.locator('button').filter({ hasText: '确定' });
      await confirmBtn.waitFor({ state: 'visible', timeout: 3000 });
      await confirmBtn.click();

      // 6. 等待弹窗关闭
      await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    } else {
      // 如果没有指定模板，尝试多种方式关闭弹窗

      // 方法1: 尝试点击取消按钮
      try {
        const cancelBtn = this.page
          .getByRole('button', { name: '取消' })
          .or(this.page.getByRole('button', { name: /关闭|X/ }))
          .first();
        if (await cancelBtn.isVisible({ timeout: 2000 })) {
          await cancelBtn.click();
          await this.page.waitForTimeout(500);
          return;
        }
      } catch {
        // 忽略错误，继续尝试其他关闭方法
      }

      // 方法2: 尝试按 ESC 键关闭
      try {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
      } catch {
        // 忽略错误，继续尝试其他关闭方法
      }

      // 方法3: 点击弹窗外部关闭
      try {
        const overlay = this.page.locator('.bg-overlay').first();
        if (await overlay.isVisible({ timeout: 1000 })) {
          await overlay.click();
          await this.page.waitForTimeout(500);
        }
      } catch {
        // 忽略错误，继续尝试其他关闭方法
      }
    }

    // 最后等待：确保弹窗已关闭
    try {
      await this.page.waitForSelector('[role="dialog"][data-state="open"]', {
        state: 'hidden',
        timeout: 3000,
      });
    } catch {
      // 弹窗可能已关闭或有其他弹窗，继续执行
    }
  }

  /**
   * 填写病历内容
   * @param {string} content - 病历内容
   */
  async fillMedicalRecord(content) {
    if (!content) throw new Error('fillMedicalRecord: content 不能为空');

    // 先关闭可能存在的模板弹窗
    try {
      const dialog = this.page.locator('[role="dialog"]').first();
      if (await dialog.isVisible({ timeout: 1000 })) {
        // 尝试点击取消或关闭按钮
        const cancelBtn = dialog
          .locator('button')
          .filter({ hasText: /取消|关闭/ })
          .first();
        if (await cancelBtn.isVisible({ timeout: 1000 })) {
          await cancelBtn.click();
        } else {
          await this.page.keyboard.press('Escape');
        }
        await this.page.waitForTimeout(500);
      }
    } catch {
      // 没有弹窗，继续
    }

    const editor = this.page.locator(this.selectors.editorContent).first();

    await editor.waitFor({ state: 'visible', timeout: this.timeout });
    await editor.click();

    // 移动到文档末尾，然后输入内容（不清空原有模板）
    await this.page.keyboard.press('Control+End');
    await this.page.keyboard.type(content);
  }

  /**
   * 保存病历
   */
  async saveMedicalRecord() {
    await this.clickButton('保存');
    // 点击保存后可能会弹出确认弹窗，等待并检查是否有弹窗
    await this.page.waitForTimeout(500); // 等待弹窗出现
    try {
      // 检查是否有确定按钮（弹窗）
      const confirmBtn = this.page
        .getByRole('button', { name: '确定' })
        .first();
      if (await confirmBtn.isVisible({ timeout: 3000 })) {
        await confirmBtn.click();
      }
    } catch {
      // 没有弹窗，继续执行
    }
    await this.waitForNetworkIdle();
  }

  /**
   * 修改病历标题（避免重复冲突）
   * @param {string} newTitle - 新标题
   */
  async renameMedicalRecord(newTitle) {
    // 点击三个点菜单（已保存按钮）
    await this.page.getByRole('button', { name: '已保存' }).first().click();

    // 点击修改标题（菜单项）
    await this.page.getByRole('menuitem', { name: '修改标题' }).click();

    // 输入新标题
    const titleInput = this.page.getByRole('textbox', { name: '新病历名称' });
    await titleInput.click();
    await titleInput.press('ControlOrMeta+a');
    await titleInput.fill(newTitle);

    // 确认修改
    await this.clickButton('确定');
    await this.waitForNetworkIdle();
  }

  // ==================== 4. 诊断相关 ====================

  /**
   * 添加诊断（西医/中医/藏医）
   * @param {string} type - 诊断类型: '西医' | '中医' | '藏医'
   * @param {string} diagnosisName - 诊断名称（可选）
   */
  async addDiagnosis(type = '西医', diagnosisName) {
    await this.switchToDisposition();
    // 点击诊断类型的"请选择"输入框（使用更简单的定位方式）
    const selectButton = this.page
      .getByText(`请选择${type}诊断`)
      .or(this.page.getByPlaceholder(`请选择${type}诊断`))
      .or(this.page.locator(`text=请选择${type}诊断`))
      .first();
    await selectButton.waitFor({ state: 'visible', timeout: this.timeout });
    await selectButton.click();
    await this.page.waitForTimeout(500); // 等待下拉选项出现

    if (diagnosisName) {
      // 点击诊断名称选项
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

  // ==================== 5. 处方相关 ====================

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
    if (!drugName) throw new Error('fillDrugName: drugName 不能为空');

    // 1. 等待新增行加载完成
    await this.page.waitForTimeout(500);

    // 2. 定位最后一行第4列（索引3）的药品名称输入框
    const lastRow = this.page
      .locator('.vxe-table--body tbody .vxe-body--row:last-child')
      .or(
        this.page.locator('.vxe-table--body tbody .vxe-body--row.row--current')
      )
      .first();
    const drugColumn = lastRow.locator('.vxe-body--column').nth(3);
    const drugInput = drugColumn.locator('input').first();

    // 3. 强制点击药品名称输入框
    await drugInput.click({ force: true, timeout: 5000 });

    // 4. 点击目标药品
    const drugOption = this.page.getByText(drugName).first();
    await drugOption.click({ timeout: 5000 });
  }

  /**
   * 填写药品剂量
   * @param {string} dose - 剂量
   */
  async fillDrugDose(dose) {
    if (!dose) throw new Error('fillDrugDose: dose 不能为空');

    const input = this.page
      .locator(this.selectors.drugDoseInput)
      .or(this.page.locator('input[placeholder*="剂量"]'))
      .nth(-1);

    await input.fill(dose);
  }

  /**
   * 填写药品数量
   * @param {string} quantity - 数量
   */
  async fillDrugQuantity(quantity) {
    if (!quantity) throw new Error('fillDrugQuantity: quantity 不能为空');

    const input = this.page
      .locator(this.selectors.drugQuantityInput)
      .or(this.page.locator('input[placeholder*="数量"]'))
      .nth(-1);

    await input.fill(quantity);
  }

  /**
   * 填写完整药品信息
   * @param {Object} drugInfo - 药品信息
   * @param {string} drugInfo.name - 药品名称（必填）
   * @param {string} drugInfo.dose - 单次剂量（可选，不填则检查是否有自动填充的值）
   * @param {string} drugInfo.frequency - 频次（必填，如：每日3次）
   * @param {string} drugInfo.usage - 用法（必填，如：口服）
   * @param {string} drugInfo.days - 天数（必填，如：3）
   */
  async fillDrug(drugInfo) {
    if (!drugInfo) throw new Error('fillDrug: drugInfo 不能为空');
    if (!drugInfo.name)
      throw new Error('fillDrug: drugInfo.name 药品名称不能为空');

    await this.addDrugRow();

    // 1. 填写药品名称
    await this.fillDrugName(drugInfo.name);

    // 2. 等待自动填充完成
    await this.page.waitForTimeout(1000);

    // 3. 检查并填写单次剂量（有些药品会自动填充）
    if (drugInfo.dose) {
      await this.fillDrugDose(drugInfo.dose);
    } else {
      // 检查是否有自动填充的值，没有则填写默认值
      // 使用 vxe-cell 结构定位
      const lastRow = this.page.locator(
        '.vxe-table--body tbody .vxe-body--row:last-child'
      );
      try {
        // 在最后一行的所有 .vxe-cell 中查找包含输入框的单元格
        const cells = lastRow.locator('.vxe-cell');
        const cellCount = await cells.count();

        // 从前往后找，找到第一个输入框（通常是批号或药品规格后面的剂量框）
        let doseInput = null;
        for (let i = 0; i < cellCount; i++) {
          const cell = cells.nth(i);
          const input = cell.locator('input').first();
          const count = await input.count();
          if (count > 0) {
            // 检查这个输入框的值
            const value = await input.inputValue().catch(() => '');
            // 如果是空的，可能是剂量输入框
            if (!value || value === '0' || value === '') {
              doseInput = input;
              break;
            }
          }
        }

        if (doseInput) {
          await doseInput.fill('5');
        }
      } catch (e) {
        console.log('⚠️ 无法填写默认剂量:', e.message);
      }
    }

    // 4. 填写频次（必填）
    if (drugInfo.frequency) {
      await this.fillDrugFrequency(drugInfo.frequency);
    }

    // 5. 填写用法（必填）
    if (drugInfo.usage) {
      await this.fillDrugUsage(drugInfo.usage);
    }

    // 6. 填写天数（必填）
    if (drugInfo.days) {
      await this.fillDrugDays(drugInfo.days);
    } else {
      // 默认3天
      await this.fillDrugDays('3');
    }
  }

  /**
   * 填写药品频次
   * @param {string} frequency - 频次（如：每日3次、tid）
   */
  async fillDrugFrequency(frequency) {
    if (!frequency) throw new Error('fillDrugFrequency: frequency 不能为空');

    // 找到最后一行中的频次下拉框（通过"请选择"文本定位）
    const lastRow = this.page.locator(
      '.vxe-table--body tbody .vxe-body--row:last-child'
    );

    // 找到该行中所有包含"请选择"的元素
    const pleaseSelectCount = await lastRow.getByText('请选择').count();

    if (pleaseSelectCount > 0) {
      // 点击第一个"请选择"（通常是频次）
      await lastRow.getByText('请选择').first().click();
    } else {
      // 如果没有"请选择"文本，尝试点击 .el-select 元素
      const selectElement = lastRow.locator('.el-select').first();
      await selectElement.click();
    }

    await this.page.waitForTimeout(500);

    // 选择频次选项
    const freqOption = this.page
      .getByText(frequency)
      .or(this.page.getByText(/每日.*次/))
      .or(this.page.getByText(/次/))
      .or(this.page.getByText(/tid/))
      .first();

    if (await freqOption.isVisible({ timeout: 3000 })) {
      await freqOption.click();
    } else {
      console.log(`⚠️ 频次选项"${frequency}"未找到`);
    }
  }

  /**
   * 填写药品用法
   * @param {string} usage - 用法（如：口服）
   */
  async fillDrugUsage(usage) {
    if (!usage) throw new Error('fillDrugUsage: usage 不能为空');

    // 等待一下，确保频次已选择完成
    await this.page.waitForTimeout(300);

    // 找到最后一行中的用法下拉框（通过"请选择"文本定位，通常是第二个）
    const lastRow = this.page.locator(
      '.vxe-table--body tbody .vxe-body--row:last-child'
    );
    const pleaseSelectElements = lastRow.getByText('请选择');
    const count = await pleaseSelectElements.count();

    if (count > 1) {
      // 点击第二个"请选择"（用法）
      await pleaseSelectElements.nth(1).click();
    } else if (count === 1) {
      // 只有一个"请选择"，可能是用法
      await pleaseSelectElements.first().click();
    } else {
      // 如果没有"请选择"文本，尝试点击 .el-select 元素
      const selectElements = lastRow.locator('.el-select');
      const selectCount = await selectElements.count();
      if (selectCount > 1) {
        await selectElements.nth(1).click();
      } else if (selectCount === 1) {
        await selectElements.first().click();
      }
    }

    await this.page.waitForTimeout(500);

    // 选择用法选项
    const usageOption = this.page
      .getByText(usage)
      .or(this.page.getByText(/口服/))
      .or(this.page.getByText(/po/))
      .first();

    if (await usageOption.isVisible({ timeout: 3000 })) {
      await usageOption.click();
    } else {
      console.log(`⚠️ 用法选项"${usage}"未找到`);
    }
  }

  /**
   * 填写药品天数
   * @param {string} days - 天数
   */
  async fillDrugDays(days) {
    if (!days) throw new Error('fillDrugDays: days 不能为空');

    // 在最后一行中查找天数输入框
    const lastRow = this.page.locator(
      '.vxe-table--body tbody .vxe-body--row:last-child'
    );

    // 尝试多种方式定位天数输入框
    try {
      // 方法1: 通过 placeholder 定位
      const daysInput = lastRow
        .locator('input[type="number"]')
        .or(lastRow.locator('input[placeholder*="天数"]'))
        .or(lastRow.locator('input[placeholder*="数量"]'))
        .last();
      await daysInput.fill(days);
    } catch {
      // 方法2: 找到所有输入框，天数通常在后面
      const inputs = lastRow.locator('input');
      const count = await inputs.count();
      if (count > 0) {
        // 尝试从后往前找空的输入框
        for (let i = count - 1; i >= 0; i--) {
          const value = await inputs
            .nth(i)
            .inputValue()
            .catch(() => '');
          if (!value || value === '') {
            await inputs.nth(i).fill(days);
            break;
          }
        }
      }
    }
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
    // 使用 getByText 而不是 clickButton，因为按钮文本有空格
    await this.page
      .getByText('开立 (F4)')
      .or(this.page.getByText('开立(F4)'))
      .first()
      .click();
    // 确认处方内容
    await this.clickButton('确定');
    await this.waitForNetworkIdle();
  }

  // ==================== 6. 就诊管理 ====================

  /**
   * 结束就诊
   */
  async endVisit() {
    await this.clickButton('结束就诊');

    // 确认结束就诊
    await this.clickButton('确定');

    // 确认切换患者
    try {
      await this.clickButton('确定');
    } catch {
      // 可能没有第二个确认弹窗
    }

    await this.waitForNetworkIdle();
  }

  /**
   * 查看今日已开立
   */
  async viewTodayPrescriptions() {
    await this.clickButton('今日已开立');
    await this.waitForNetworkIdle();
  }

  // ==================== 组合方法（完整流程） ====================

  /**
   * 完整就诊流程
   * @param {Object} options - 配置选项
   * @param {string} options.deptName - 科室名称
   * @param {string} options.patientName - 患者姓名
   * @param {string} options.medicalRecord - 病历内容
   * @param {Array<string>} options.diagnoses - 诊断类型数组
   * @param {Array<Object>} options.prescriptions - 处方数组
   * @param {boolean} options.autoEndVisit - 是否自动结束就诊
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

    await this.newMedicalRecord();
    await this.fillMedicalRecord(medicalRecord);
    await this.saveMedicalRecord();

    await this.switchToDisposition();
    for (const diagnosis of diagnoses) {
      await this.addDiagnosis(diagnosis);
    }
    await this.confirmDiagnosis();

    if (prescriptions.length > 0) {
      await this.switchToPrescription();
      for (const prescription of prescriptions) {
        await this.switchDrugType(prescription.type);
        if (prescription.drugs?.length > 0) {
          for (const drug of prescription.drugs) {
            await this.fillDrug(drug);
          }
        }
      }
      await this.submitPrescription();
    }

    if (autoEndVisit) {
      await this.endVisit();
      await this.viewTodayPrescriptions();
    }
  }

  /**
   * 快速开方流程
   * @param {string} patientName - 患者姓名
   * @param {Array<Object>} prescriptions - 处方数组
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
      await this.switchDrugType(prescription.type);
      if (prescription.drugs?.length > 0) {
        for (const drug of prescription.drugs) {
          await this.fillDrug(drug);
        }
      }
    }

    await this.submitPrescription();
    await this.endVisit();
  }

  // ==================== 7. 卫材耗材 ====================

  /**
   * 新增卫材耗材行
   */
  async addMaterialRow() {
    await this.clickButton('新增');
    await this.waitForNetworkIdle();
  }

  /**
   * 填写卫材耗材信息
   * @param {Object} materialInfo - 耗材信息 { name, spec, quantity }
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
      if (await specInput.isVisible({ timeout: 1000 })) {
        await specInput.fill(materialInfo.spec);
      }
    }

    if (materialInfo.quantity) {
      const qtyInput = this.page.locator('input[placeholder*="数量"]').nth(-1);
      if (await qtyInput.isVisible({ timeout: 1000 })) {
        await qtyInput.fill(materialInfo.quantity);
      }
    }
  }

  // ==================== 8. 检查申请 ====================

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
   * @param {Object} examInfo - 检查信息 { name, part, urgent }
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
      if (await partInput.isVisible({ timeout: 1000 })) {
        await partInput.fill(examInfo.part);
      }
    }

    if (examInfo.urgent) {
      await this.clickButton('加急');
    }
  }

  // ==================== 9. 检验申请 ====================

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
   * @param {Object} labInfo - 检验信息 { name, sample, urgent }
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
      if (await sampleInput.isVisible({ timeout: 1000 })) {
        await sampleInput.fill(labInfo.sample);
      }
    }

    if (labInfo.urgent) {
      await this.clickButton('加急');
    }
  }

  // ==================== 10. 治疗项目 ====================

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
   * @param {Object} treatmentInfo - 治疗信息 { name, freq, duration }
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
      if (await freqInput.isVisible({ timeout: 1000 })) {
        await freqInput.fill(treatmentInfo.freq);
      }
    }

    if (treatmentInfo.duration) {
      const durationInput = this.page
        .locator('input[placeholder*="疗程"]')
        .nth(-1);
      if (await durationInput.isVisible({ timeout: 1000 })) {
        await durationInput.fill(treatmentInfo.duration);
      }
    }
  }

  // ==================== 11. 输血申请 ====================

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
   * @param {Object} bloodInfo - 输血信息 { name, quantity, urgency }
   */
  async fillBlood(bloodInfo) {
    if (!bloodInfo) throw new Error('fillBlood: bloodInfo 不能为空');
    await this.addBloodRow();

    const select = this.page
      .locator('select[name*="blood"], .el-select__input')
      .first();

    if (await select.isVisible({ timeout: 1000 })) {
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
      if (await urgentSelect.isVisible({ timeout: 1000 })) {
        await urgentSelect.selectOption(bloodInfo.urgency);
      }
    }
  }

  // ==================== 12. 手术申请 ====================

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
   * @param {Object} surgeryInfo - 手术信息 { name, anesthesia, level }
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
      if (await anesSelect.isVisible({ timeout: 1000 })) {
        await anesSelect.click();
        await this.page.getByText(surgeryInfo.anesthesia).first().click();
      }
    }

    if (surgeryInfo.level) {
      const levelSelect = this.page.locator('select[name*="level"]').first();
      if (await levelSelect.isVisible({ timeout: 1000 })) {
        await levelSelect.selectOption(surgeryInfo.level);
      }
    }
  }

  // ==================== 13. 草药专用方法 ====================

  /**
   * 填写草药饮片信息（别名方法，与fillDrug相同）
   * @param {Object} herbInfo - 饮片信息 { name, dose, quantity }
   */
  async fillHerb(herbInfo) {
    return this.fillDrug(herbInfo);
  }

  // ==================== 14. 页面状态检查 ====================

  /**
   * 等待页签激活
   * @param {string} tabName - 页签名称
   */
  async waitForTabActive(tabName) {
    const tab = this.page.getByRole('tab', { name: tabName });
    await tab.waitFor({ state: 'visible', timeout: this.timeout });
    // 等待 aria-selected="true" 表示页签已激活
    await tab.evaluate(
      el =>
        el.getAttribute('aria-selected') === 'true' ||
        Promise.reject('Tab not active')
    );
  }

  // ==================== 15. 患者列表相关 ====================

  /**
   * 呼叫患者
   * @param {string} patientName - 患者姓名
   */
  async callPatient(patientName) {
    if (!patientName) throw new Error('callPatient: patientName 不能为空');

    // 定位患者行中的呼叫按钮
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
      // 选择筛选字段
      const fieldSelect = this.page
        .locator('.el-select')
        .filter({ hasText: '请选择' })
        .first();
      await fieldSelect.click();
      await this.page.getByText(field).first().click();
    }

    if (value) {
      // 输入筛选值
      const input = this.page.getByPlaceholder('请输入');
      await input.fill(value);
    }

    // 点击筛选按钮
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

  // ==================== 16. 病历扩展功能 ====================

  /**
   * 存为模板
   * @param {string} templateName - 模板名称
   */
  async saveAsTemplate(templateName) {
    await this.clickButton('存为模板');

    if (templateName) {
      // 输入模板名称
      const input = this.page.getByPlaceholder('请输入模板名称');
      await input.waitFor({ state: 'visible', timeout: this.timeout });
      await input.fill(templateName);
    }

    await this.clickButton('确定');
    await this.waitForNetworkIdle();
  }

  /**
   * 清空病历内容
   */
  async clearMedicalRecord() {
    await this.clickButton('清空');

    // 确认清空
    try {
      await this.clickButton('确定');
    } catch {
      // 可能不需要确认
    }

    await this.waitForNetworkIdle();
  }

  /**
   * 打印病历
   */
  async printMedicalRecord() {
    await this.clickButton('打印');
    await this.waitForNetworkIdle();
  }

  /**
   * 导出病历
   */
  async exportMedicalRecord() {
    await this.clickButton('导出');
    await this.waitForNetworkIdle();
  }

  /**
   * 打开书写助手
   */
  async openWritingAssistant() {
    await this.clickButton('书写助手');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到病历目录标签
   */
  async switchToMedicalRecordCatalog() {
    await this.clickTab('病历目录');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到病历记录标签
   */
  async switchToMedicalRecordHistory() {
    await this.clickTab('病历记录');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换到常用标签
   */
  async switchToCommon() {
    await this.clickTab('常用');
    await this.waitForNetworkIdle();
  }

  /**
   * 切换编辑模式
   */
  async toggleEditMode() {
    await this.clickButton('切换工具栏');
    await this.page.waitForTimeout(500);
  }

  // ==================== 17. 诊断扩展功能 ====================

  /**
   * 进入诊断页面（完整流程）
   * @param {string} diagnosisType - 诊断类型: '西医' | '中医' | '藏医'
   */
  async enterDiagnosis(diagnosisType = '西医') {
    await this.switchToDisposition();

    // 点击对应诊断类型的"进入诊断"按钮
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
    await this.page.waitForTimeout(500); // 等待搜索结果
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

  // ==================== 18. 处方扩展功能 ====================

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

    // 确认删除
    try {
      await this.clickButton('确定');
    } catch {
      // 可能不需要确认
    }

    await this.waitForNetworkIdle();
  }

  /**
   * 选择自动分方类型
   * @param {string} type - 分方类型
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
   * @returns {Object} 费用信息 { total, western, herbal, tibetan, material, exam, lab, treatment, surgery, blood }
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
   * @param {string} tabName - 标签名称: '模板' | '历史' | '诊断治疗路径' | '协定方'
   */
  async switchTreatmentPlanTab(tabName = '模板') {
    await this.clickTab(tabName);
    await this.waitForNetworkIdle();
  }

  /**
   * 搜索治疗方案模板
   * @param {string} templateName - 模板名称
   */
  async searchTreatmentTemplate(templateName) {
    if (!templateName)
      throw new Error('searchTreatmentTemplate: templateName 不能为空');

    const searchInput = this.page.getByPlaceholder('搜索模板名称');
    await searchInput.waitFor({ state: 'visible', timeout: this.timeout });
    await searchInput.fill(templateName);
    await this.page.waitForTimeout(500);
  }

  /**
   * 选择治疗方案分类
   * @param {string} category - 分类: '全部' | '个人' | '科室'
   */
  async selectTreatmentCategory(category = '全部') {
    await this.clickButton(category);
    await this.waitForNetworkIdle();
  }

  /**
   * 选择治疗方案模板
   * @param {string} templateName - 模板名称（如：'西药模板', '中草药模板'）
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
    // 确认处方内容
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
