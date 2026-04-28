# 环境搭建指南

本指南将帮助您快速搭建 HIS-TEST 项目的测试环境。

## 1. 系统要求

- **操作系统**：Windows、macOS 或 Linux
- **Node.js**：v16 或更高版本
- **npm**：v7 或更高版本

## 2. 安装步骤

### 2.1 克隆项目

```bash
# 克隆项目到本地
git clone <项目地址>
cd his-test
```

### 2.2 安装依赖

```bash
# 安装项目依赖
npm install

# 安装 Playwright 浏览器
npx playwright install
```

### 2.3 配置环境变量

1. **自动创建 .env 文件**：

   ```bash
   # 运行环境设置脚本
   npm run setup:env
   ```

2. **手动修改 .env 文件**：

   编辑生成的 `.env` 文件，填写实际的配置值：

   ```env
   # 索县医院配置
   SUOXIAN_TEST_USERNAME=您的测试账号
   SUOXIAN_TEST_PASSWORD=您的测试密码

   # 当前医院
   CURRENT_HOSPITAL=suoxian
   ```

## 3. 运行测试

### 3.1 运行所有测试

```bash
npm test
```

### 3.2 运行特定测试文件

```bash
# 运行登录测试
npx playwright test tests/login.spec.js

# 运行环境清理
npx playwright test tests/clean.setup.js

# 运行全局登录
npx playwright test tests/login.setup.js
```

### 3.3 运行测试并打开 UI 界面

```bash
npm run test:ui
```

### 3.4 查看测试报告

```bash
# 运行测试并生成报告
npm test

# 查看报告
npm run test:report
```

## 4. 多医院配置

### 4.1 添加新医院

1. **修改 config/config.js**：

   ```javascript
   const hospitalData = {
     suoxian: {
       name: '索县医院',
       testUrl: 'http://10.58.2.201:20505',
       prodUrl: 'https://xxxx',
     },
     hospital2: {
       name: '医院2',
       testUrl: 'http://test-hospital2.com',
       prodUrl: 'https://prod-hospital2.com',
     },
   };
   ```

2. **修改 .env 文件**：

   ```env
   # 医院2配置
   HOSPITAL2_TEST_USERNAME=医院2测试账号
   HOSPITAL2_TEST_PASSWORD=医院2测试密码

   # 当前医院
   CURRENT_HOSPITAL=hospital2
   ```

### 4.2 切换医院

修改 `.env` 文件中的 `CURRENT_HOSPITAL` 值：

```env
# 当前医院
CURRENT_HOSPITAL=suoxian  # 切换为索县医院
# CURRENT_HOSPITAL=hospital2  # 切换为医院2
```

## 5. 常见问题

### 5.1 依赖安装失败

如果遇到依赖安装失败的问题，可以尝试：

```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 目录
rm -rf node_modules

# 重新安装
npm install
```

### 5.2 浏览器安装失败

如果 Playwright 浏览器安装失败，可以尝试：

```bash
# 强制安装
npx playwright install --force

# 或指定安装特定浏览器
npx playwright install chromium
```

### 5.3 环境变量配置错误

确保 `.env` 文件中的配置值正确，特别是：

- 用户名和密码是否正确
- 当前医院是否设置正确
- 没有多余的空格或注释

### 5.4 网络连接问题

确保测试环境可以访问目标医院的系统地址，检查网络连接和防火墙设置。

## 6. 调试技巧

### 6.1 查看测试运行日志

```bash
# 运行测试并查看详细日志
npx playwright test --verbose
```

### 6.2 使用 UI 模式运行测试

```bash
# 打开 UI 模式运行测试
npm run test:ui
```

### 6.3 查看测试报告

```bash
# 运行测试并生成报告
npm test

# 查看报告
npm run test:report
```

## 7. 项目结构

```
his-test/
├── config/             # 配置文件
│   ├── base.js         # 基础配置
│   ├── config.js       # 主配置文件
│   └── index.js        # 配置导出入口
├── data/               # 测试数据
├── docs/               # 项目文档
├── pages/              # 页面模型
│   ├── common/         # 基础页面
│   ├── login/          # 登录页面
│   ├── outpatient/     # 门诊页面
│   └── index.js        # 页面导出入口
├── scripts/            # 辅助脚本
├── tests/              # 测试用例
├── utils/              # 工具函数
│   ├── common/         # 通用工具
│   │   ├── common.js   # 工具实现
│   │   └── index.js    # 工具导出入口
├── .env                # 环境变量
├── .env.example        # 环境变量示例
├── .gitignore          # Git 忽略文件
├── README.md           # 项目说明
└── package.json        # 项目配置
```

## 8. 测试用例编写规范

### 8.1 命名规范

- 测试文件名：使用 `.spec.js` 后缀
- 测试用例名称：使用清晰的描述性名称，如 `正确账号密码登录成功`
- 测试套件名称：使用功能模块名称，如 `登录测试`

### 8.2 结构规范

```javascript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import { config } from '../config';

test('测试用例名称', async ({ page }) => {
  const loginPage = new LoginPage(page);
  // 测试步骤
  await loginPage.goto(config.baseUrl);
  // 测试操作
  await loginPage.login(config.username, config.password);
  // 断言
  await expect(page).toHaveURL(/workspace/);
});
```

### 8.3 最佳实践

- **使用 POM 模式**：将页面操作封装到页面类中
- **使用工具函数**：复用通用功能，如随机数据生成
- **使用环境变量**：避免硬编码敏感信息
- **使用 index.js 导出模式**：简化导入路径
- **编写独立测试**：确保测试用例之间相互独立
- **添加适当的等待**：使用 Playwright 的自动等待，避免硬等待
- **添加详细的日志**：便于调试和分析测试结果
- **定期清理测试数据**：使用 `clean.setup.js` 清理测试环境

## 9. 升级指南

### 9.1 更新依赖

```bash
# 更新所有依赖
npm update

# 更新 Playwright
npm update @playwright/test
npx playwright install
```

### 9.2 更新配置

当项目结构或配置方式发生变化时，需要更新：

- `.env` 文件中的配置
- `config/config.js` 中的医院配置
- 测试用例中的导入路径

## 10. 联系支持

如果遇到无法解决的问题，请联系项目维护人员或查看项目文档。

---

**提示**：定期更新依赖和浏览器版本，以确保测试的稳定性和兼容性。
