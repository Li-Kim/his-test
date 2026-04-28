// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

// 配置加载逻辑
const currentEnv = process.env.NODE_ENV || 'test';
const currentHospital = process.env.CURRENT_HOSPITAL || 'suoxian'; // 从环境变量获取当前医院

// 医院配置（非敏感信息）
const hospitalData = {
  suoxian: {
    name: '索县医院',
    testUrl: 'http://10.58.2.201:20505',
    prodUrl: 'https://xxxx',
  },
};

const hospital = hospitalData[currentHospital];
// 安全校验
if (!hospital) {
  throw new Error(`未找到医院：${currentHospital}，请检查 config.js`);
}

// 从环境变量获取敏感信息
const hospitalPrefix = currentHospital.toUpperCase();
const username =
  process.env[`${hospitalPrefix}_${currentEnv.toUpperCase()}_USERNAME`];
const password =
  process.env[`${hospitalPrefix}_${currentEnv.toUpperCase()}_PASSWORD`];
const baseUrl =
  process.env[`${hospitalPrefix}_${currentEnv.toUpperCase()}_URL`] ||
  (currentEnv === 'test' ? hospital.testUrl : hospital.prodUrl);

// 验证必要配置
if (!username || !password) {
  throw new Error(
    `缺少必要的配置项，请检查 .env 文件中 ${hospitalPrefix}_${currentEnv.toUpperCase()}_USERNAME 和 ${hospitalPrefix}_${currentEnv.toUpperCase()}_PASSWORD 的配置`
  );
}

// 导出配置
export const config = {
  env: currentEnv,
  hospital: currentHospital,
  hospitalName: hospital.name,
  baseUrl: baseUrl,
  username: username,
  password: password,
};
