#!/usr/bin/env node

/**
 * 环境设置脚本
 * 自动创建 .env 文件（如果不存在）
 */

import fs from 'fs';
import path from 'path';

// 源文件和目标文件路径
const exampleEnvPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '.env.example');
const envPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '.env');

console.log('🔧 开始设置环境变量...');

// 检查 .env.example 文件是否存在
if (!fs.existsSync(exampleEnvPath)) {
  console.error('❌ .env.example 文件不存在');
  process.exit(1);
}

// 检查 .env 文件是否已存在
if (fs.existsSync(envPath)) {
  console.log('ℹ️ .env 文件已存在，跳过创建');
  process.exit(0);
}

// 从 .env.example 复制到 .env
try {
  const exampleContent = fs.readFileSync(exampleEnvPath, 'utf8');
  fs.writeFileSync(envPath, exampleContent);
  console.log('✅ .env 文件创建成功');
  console.log('📝 请根据实际情况修改 .env 文件中的配置');
} catch (error) {
  console.error('❌ 创建 .env 文件失败:', error.message);
  process.exit(1);
}

console.log('✨ 环境设置完成！');