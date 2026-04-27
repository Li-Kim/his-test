import path from 'path';
import fs from 'fs';

// 🔥 核心修复：直接获取项目根目录（Windows / Mac 都通用）
const rootDir = process.cwd();
const exampleEnvPath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

console.log('=========================================');
console.log('🔧 正在初始化环境...');
console.log('📍 项目根目录：', rootDir);
console.log('📍 模板文件：', exampleEnvPath);
console.log('📍 目标文件：', envPath);
console.log('=========================================');

// 1. 检查模板文件是否存在
if (!fs.existsSync(exampleEnvPath)) {
  console.error('❌ 错误：.env.example 文件不存在！');
  console.error('❌ 请确认文件在项目根目录下');
  process.exit(1);
}

// 2. 如果 .env 已经存在，直接跳过
if (fs.existsSync(envPath)) {
  console.log('✅ .env 文件已存在，跳过生成');
  console.log('=========================================');
  process.exit(0);
}

// 3. 复制模板生成 .env
try {
  const content = fs.readFileSync(exampleEnvPath, 'utf8');
  fs.writeFileSync(envPath, content);
  console.log('✅ .env 文件创建成功！');
  console.log('✅ 环境初始化完成！');
} catch (err) {
  console.error('❌ 创建 .env 失败：', err.message);
  process.exit(1);
}

console.log('=========================================');

//node scripts\setup-env.js