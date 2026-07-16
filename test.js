/* 执行 

'./GX28StepMotor/test/test.js'
'./ZSDCM/test/test.js' */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 在 ES Module 中没有 __dirname，需要通过 import.meta.url 手动构建
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 需要执行的测试文件列表
 */
const testFiles = [
    './GX28StepMotor/test/test.js',
    './ZSDCM/test/test.js'
];

console.log('开始执行自动化测试 (ESM 模式)...\n');

let allPassed = true;

for (const [index, file] of testFiles.entries()) {
    const fullPath = path.resolve(__dirname, file);
    console.log(`[${index + 1}/${testFiles.length}] 正在执行: ${file}`);
    
    try {
        // 使用 stdio: 'inherit' 直接输出子进程的日志
        execSync(`node "${fullPath}"`, { stdio: 'inherit' });
        console.log(`✅ ${file} 执行成功\n`);
    } catch (error) {
        console.error(`❌ ${file} 执行失败: ${error.message}\n`);
        allPassed = false;
        // 如果需要一旦失败立即停止，请取消下行注释
        // process.exit(1);
    }
}

if (allPassed) {
    console.log('✨ 所有测试用例均已通过！');
} else {
    console.log('⚠️ 部分测试用例执行失败，请检查上方日志。');
    process.exit(1);
}