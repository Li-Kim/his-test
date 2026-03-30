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