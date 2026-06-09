/**
 * 认证相关 API
 * 登录、解锁、token 等
 */

/**
 * 解锁账号（清除登录错误次数）
 * @param {import('@playwright/test').Page} page - Playwright 页面对象
 * @param {string} username - 要解锁的用户名
 * @param {string} baseUrl - API 基础 URL
 * @throws {Error} 解锁失败时抛出错误
 */
export async function unlockAccount(page, username, baseUrl) {
  try {
    // 构建解锁接口 URL
    const unlockUrl = `${baseUrl}/prod-his-api/his/v5/auth/clear/loginError/${encodeURIComponent(username)}`;

    // 发送 GET 请求解锁
    const unlockResponse = await page.request.get(unlockUrl);

    // 验证 HTTP 状态码
    if (!unlockResponse.ok()) {
      throw new Error(`解锁接口请求失败，状态码：${unlockResponse.status()}`);
    }

    // 解析响应数据
    const responseData = await unlockResponse.json();

    // 验证业务逻辑
    if (!responseData.data) {
      throw new Error(
        `解锁操作失败，响应数据：${JSON.stringify(responseData)}`
      );
    }

    console.log('✅ 账号已解锁');
  } catch (error) {
    console.error('❌ 解锁失败:', error);
    throw error; // 向上传递错误
  }
}
