// 测试数据管理模块
// 集中管理所有测试数据，提供统一的访问接口

// 导入所有测试数据
import loginData from './common/loginData.json' with { type: 'json' };
import commonData from './common/common.data.json' with { type: 'json' };
import suoxianData from './suoxian/test.data.json' with { type: 'json' };

// 统一导出测试数据
export const testData = {
  login: loginData,
  common: commonData,
  suoxian: suoxianData,
};

// 导出常用数据的快捷访问
export const loginErrorMsg = loginData.errorMsg;
export const commonConstants = commonData.constants;
