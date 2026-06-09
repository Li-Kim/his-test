import dotenv from 'dotenv';
dotenv.config();

// 读取环境配置（全大写，无大小写转换）
const currentEnv = process.env.NODE_ENV || 'TEST';
const currentHospital = process.env.CURRENT_HOSPITAL || 'SUOXIAN';

// 医院基础配置（只存名称，不存任何地址！）
const hospitalData = {
  SUOXIAN: {
    name: '索县医院',
  },
};

// 校验医院是否存在
const hospital = hospitalData[currentHospital];
if (!hospital) {
  throw new Error(`未找到医院配置：${currentHospital}`);
}

// 拼接环境变量 KEY
const envKey = `${currentHospital}_${currentEnv}`;  // 例如：SUOXIAN_TEST

// 从 .env 读取所有配置（必须全部配置在 .env 中）
const baseUrl = process.env[`${envKey}_URL`];
const username = process.env[`${envKey}_USERNAME`];
const password = process.env[`${envKey}_PASSWORD`];

// 强制校验：必须全部填写，不填直接报错
if (!baseUrl) throw new Error(`缺少配置：${envKey}_URL`);
if (!username) throw new Error(`缺少配置：${envKey}_USERNAME`);
if (!password) throw new Error(`缺少配置：${envKey}_PASSWORD`);

// 导出给测试用例使用
export const config = {
  env: currentEnv,
  hospital: currentHospital,
  hospitalName: hospital.name,
  baseUrl: baseUrl,
  username: username,
  password: password,
};