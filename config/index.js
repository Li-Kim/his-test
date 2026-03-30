import { hospitalData } from "./hospitals.js";

const currentEnv = "test"; // 切换环境 test / prod
const currentHospital = "suoxian"; //索县人民医院

const hospital = hospitalData[currentHospital];
//安全校验（防止选错医院报错）
if (!hospital) {
  throw new Error(`未找到医院：${currentHospital}，请检查 hospitals.js`);
}

export const config = {
  env: currentEnv,
  hospital:currentHospital,
  hospitalName:hospital.name,
  baseUrl: currentEnv === "test" ? hospital.testUrl : hospital.prodUrl,
  username: hospital.username,
  password: currentEnv === "test" ? hospital.testPwd : hospital.prodPwd,
};

