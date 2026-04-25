// 工具1：生成随机姓名（测试患者用）
export function randomName() {
  const firstName = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵'];
  const lastName = ['伟', '芳', '敏', '静', '丽', '强', '磊', '军'];
  return firstName[Math.floor(Math.random() * firstName.length)] +
         lastName[Math.floor(Math.random() * lastName.length)];
}

// 工具2：生成随机手机号
export function randomPhone() {
  return '138' + Math.random().toString().slice(2, 10);
}

// 工具3：生成随机门诊号
export function randomClinicNo() {
  return 'MZ' + new Date().getTime().toString().slice(-8);
}

// 工具4：获取今天日期 2026-03-25
export function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 工具5：等待几秒（调试非常好用）
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 工具6：随机身份证号（18位，符合规则）
export function randomIdCard() {
  const prefix = '110101199'; // 北京东城区，可自己改
  const year = Math.floor(Math.random() * 10); // 90~99 随机年
  const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
  const day = Math.floor(1 + Math.random() * 28).toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const lastCode = 'X' || Math.floor(Math.random() * 10); // 最后一位
  return prefix + year + month + day + seq + lastCode;
}

// 工具7：随机病历号（医疗系统专用）
export function randomMedicalRecordNo() {
  const prefix = 'BL';
  const time = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return prefix + time + random;
}

// 工具8：随机医生工号（医院专用）
export function randomDoctorCode() {
  const prefix = 'DOC';
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + num;
}

// 工具9：解锁账号（清除登录错误次数）
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
      throw new Error(`解锁操作失败，响应数据：${JSON.stringify(responseData)}`);
    }
    
    console.log('✅ 账号已解锁');
  } catch (error) {
    console.error('❌ 解锁失败:', error);
    throw error; // 向上传递错误
  }
}

// 工具10：等待错误信息显示
export async function waitForError(page, errorMsg, options = {}) {
  const {
    timeout = 10000, // 超时时间，默认10秒
    exact = false,    // 是否精确匹配文本
    locator = null    // 自定义定位器
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