import { BasePage } from '../common/BasePage.js';

/**
 * 门诊病历页面类
 * 处理病历相关的所有操作
 */
export class MedicalRecordPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      editorContent: '.tiptap',
      newRecordButton: 'button:has-text("新建")',
      saveRecordButton: 'button:has-text("保存")',
      templateDialog: '.el-dialog:has-text("选择模板")',
    };
  }

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
   * 点击新建病历
   * @param {string} templateName - 病历模板名称，如'门诊通用病历'，不传则关闭模板弹窗
   */
  async newMedicalRecord(templateName) {
    // 1. 点击【新建】按钮
    const newButton = this.page.getByRole('button', { name: '新建' }).first();
    // 修复：标准等待可见 API
    await newButton.waitFor({ state: 'visible', timeout: this.timeout });
    await this.clickButton('新建');

    // 2. 等待创建病历弹窗
    const dialog = this.page
      .locator('[role="dialog"]')
      .filter({ hasText: '创建病历' });
    await dialog.waitFor({ state: 'visible', timeout: this.timeout });

    // 3. 选择模板并确认
    if (templateName) {
      const template = dialog.getByText(templateName).first();
      await template.waitFor({ state: 'visible', timeout: this.timeout });
      await template.dblclick();

      // 点击确定按钮
      await this.clickButton('确定');
      await dialog.waitFor({ state: 'hidden', timeout: this.timeout });
      return;
    }

    // 4. 无模板名：关闭弹窗
    await this._closeMedicalRecordDialog(dialog);
  }

  /**
   * 私有方法：统一关闭弹窗
   */
  async _closeMedicalRecordDialog(dialog) {
    try {
      // 优先点击取消/关闭按钮
      const cancelBtn = this.page
        .getByRole('button', { name: /取消|关闭|×/ })
        .first();
      await cancelBtn.waitFor({ state: 'visible', timeout: 2000 });
      await this.clickButton(await cancelBtn.textContent());
    } catch {
      try {
        // 点击遮罩层
        await this.page.locator('.bg-overlay').click({ timeout: 2000 });
      } catch {
        // ESC 快捷键关闭
        await this.page.keyboard.press('Escape');
      }
    }

    // 等待弹窗关闭
    await dialog.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
  }

  /**
   * 填写病历内容
   * @param {string} content - 病历内容
   */
  async fillMedicalRecord(content) {
    if (!content) throw new Error('fillMedicalRecord: content 不能为空');

    try {
      const dialog = this.page.locator('[role="dialog"]').first();
      // 修复：isVisible() 不支持 timeout，改用 waitFor
      await dialog.waitFor({ state: 'visible', timeout: 2000 });

      const cancelBtn = dialog
        .locator('button')
        .filter({ hasText: /取消|关闭/ })
        .first();
      await cancelBtn.waitFor({ state: 'visible', timeout: 2000 });
      await cancelBtn.click();

      await dialog.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
    } catch {
      // 没有弹窗，继续
    }

    // 你的编辑器定位（保留你原有的写法）
    const editor = this.page.locator(this.selectors.editorContent).first();

    await editor.waitFor({ state: 'visible', timeout: this.timeout });
    await editor.click({ force: true, timeout: this.timeout });

    await this.page.keyboard.press('Control+End');
    await this.page.keyboard.type(content);
  }

  /**
   * 保存病历
   */
  async saveMedicalRecord() {
    // 1. 点击【保存】按钮（使用你优化后的 clickButton）
    await this.clickButton('保存');

    // 2. 稳定处理【确定保存吗？】弹窗
    try {
      // 先等待弹窗的「确定」按钮出现（自动等待，不写死timeout）
      const confirmBtn = this.page.getByRole('button', { name: '确定' });
      await confirmBtn.waitFor({ state: 'visible', timeout: 3000 });

      // 用 clickButton 点击，和你封装的逻辑统一
      await this.clickButton('确定');
    } catch {
      // 如果没有弹窗，直接跳过，不影响流程
      console.log('保存病历无弹窗，继续执行');
    }

    // 等待保存请求完成
    await this.waitForNetworkIdle();
  }

  /**
   * 修改病历标题（避免重复冲突）
   * @param {string} newTitle - 新标题
   */
  async renameMedicalRecord(newTitle) {
    await this.page.getByRole('button', { name: '已保存' }).first().click();
    await this.page.getByRole('menuitem', { name: '修改标题' }).click();

    const titleInput = this.page.getByRole('textbox', { name: '新病历名称' });
    await titleInput.waitFor();
    await titleInput.press('ControlOrMeta+a');
    await titleInput.fill(newTitle);

    await this.clickButton('确定');
    await this.waitForNetworkIdle();
  }

  // ==================== 病历扩展功能 ====================

  /**
   * 存为模板
   * @param {string} templateName - 模板名称
   */
  async saveAsTemplate(templateName) {
    await this.clickButton('存为模板');

    if (templateName) {
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
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }
}
