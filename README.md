# HIS-TEST | 医疗系统UI自动化测试框架

> 基于 Playwright 构建的医院信息系统（HIS）UI 自动化测试框架。
> 支持全局登录持久化、POM 页面封装、多环境/多医院配置与 CI/CD 自动化执行。

## 📌 核心特性

- ✅ 全局登录状态持久化 (`login.setup.js`)
- ✅ 页面对象模型 (POM) 封装，代码高复用
- ✅ 多环境 / 多医院配置管理 (`config/` 目录）
- ✅ 内置测试数据隔离 (`data/` 目录）
- ✅ 支持 CI/CD 自动化流水线执行
- ✅ 清晰的目录结构与公共工具库
- ✅ 模块化导入系统（index.js 导出模式）
- ✅ 环境变量管理（.env 文件）

## 📂 目录结构

```text
his-test/
├── .github/workflows/  # CI/CD 流水线配置
├── config/             # 全局环境与医院配置
│   ├── base.js         # 基础配置
│   ├── config.js       # 主配置文件
│   └── index.js        # 配置导出入口
├── data/               # 测试数据管理
│   ├── common/         # 通用测试数据
│   └── suoxian/        # 索县医院测试数据
├── docs/               # 项目文档
├── pages/              # POM 页面类 (登录/门诊/收费等)
│   ├── common/         # 基础页面类
│   ├── login/          # 登录相关页面
│   ├── outpatient/     # 门诊相关页面
│   └── index.js        # 页面类导出入口
├── scripts/            # 辅助脚本
├── tests/              # 测试用例集合
├── utils/              # 公共工具方法
│   ├── common/         # 通用工具函数
│   │   ├── common.js   # 工具函数实现
│   │   └── index.js    # 工具函数导出入口
├── .env                # 环境变量配置
├── .env.example        # 环境变量示例
├── .gitignore          # Git 忽略文件
├── playwright.config.js # Playwright 核心配置
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 🚀 快速开始

### 1. 环境搭建

```bash
# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install

# 配置环境变量
# 复制 .env.example 为 .env 并填写实际值
cp .env.example .env
```

### 2. 运行测试

```bash
# 运行所有测试
npm test

# 运行指定测试文件
npx playwright test tests/login.spec.js

# 运行测试并打开 UI 界面
npm run test:ui

# 查看测试报告
npm run test:report
```

## 📖 使用指南

### 导入模块

项目使用 index.js 导出模式，简化导入路径：

```javascript
// 导入工具函数
import { randomName, randomPhone } from '../utils/common';

// 导入页面类
import { LoginPage, BasePage } from '../pages';

// 导入配置
import { config, baseConfig } from '../config';
```

### 多医院配置

1. 在 `config/config.js` 中添加医院配置
2. 在 `.env` 文件中添加医院的敏感信息
3. 修改 `.env` 文件中的 `CURRENT_HOSPITAL` 切换医院

### 编写测试用例

```javascript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import { config } from '../config';

test('登录测试', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(config.baseUrl);
  await loginPage.login(config.username, config.password);
  await expect(page).toHaveURL(/workspace/);
});
```

## 🔧 配置管理

### 环境变量

敏感信息（如用户名、密码）存储在 `.env` 文件中：

```env
# 索县医院配置
SUOXIAN_TEST_USERNAME=SA540626000010
SUOXIAN_TEST_PASSWORD=1234qwer

# 当前医院
CURRENT_HOSPITAL=suoxian
```

### 医院配置

医院的非敏感信息（如名称、URL）存储在 `config/config.js` 中：

```javascript
const hospitalData = {
  suoxian: {
    name: '索县医院',
    testUrl: 'http://10.58.2.201:20505',
    prodUrl: 'https://xxxx',
  },
  // 其他医院配置...
};
```

## 📝 最佳实践

1. **使用 POM 模式**：将页面操作封装到页面类中
2. **使用工具函数**：复用通用功能，如随机数据生成
3. **使用环境变量**：避免硬编码敏感信息
4. **使用 index.js 导出模式**：简化导入路径
5. **编写独立测试**：确保测试用例之间相互独立
6. **添加适当的等待**：使用 Playwright 的自动等待，避免硬等待
7. **添加详细的日志**：便于调试和分析测试结果
8. **定期清理测试数据**：使用 `clean.setup.js` 清理测试环境
