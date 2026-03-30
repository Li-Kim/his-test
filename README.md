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

## 📂 目录结构
```text
his-test/
├── .github/workflows/  # CI/CD 流水线配置
├── config/             # 全局环境与医院配置
├── data/               # 测试数据管理
├── pages/              # POM 页面类 (登录/门诊/收费等)
├── tests/              # 测试用例集合
├── utils/              # 公共工具方法
└── playwright.config.js # Playwright 核心配置
