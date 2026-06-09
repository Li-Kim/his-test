/**
 * 页面/等待工具函数
 */

/** 获取今天日期 2026-03-25 */
export function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 等待几秒（调试非常好用） */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 等待错误信息显示
 * @param {import('@playwright/test').Page} page - Playwright 页面对象
 * @param {string} errorMsg - 错误信息文本
 * @param {Object} options - 配置选项
 */
export async function waitForError(page, errorMsg, options = {}) {
  const {
    timeout = 10000, // 超时时间，默认10秒
    exact = false, // 是否精确匹配文本
    locator = null, // 自定义定位器
  } = options;

  if (locator) {
    await locator.waitFor({ state: 'visible', timeout });
  } else {
    const textLocator = exact
      ? page.getByText(errorMsg, { exact: true })
      : page.getByText(errorMsg);
    await textLocator.last().waitFor({ state: 'visible', timeout });
  }
}
