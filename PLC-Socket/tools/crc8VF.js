import { crc8 } from './crc8.js';

/**
 * 校验 Buffer 的 CRC8 码是否正确
 * 假设 Buffer 的最后一个字节是校验码
 * @param {Buffer} buffer - 待校验的完整 Buffer
 * @returns {boolean} - 校验成功返回 true，失败返回 false
 */
function crc8VF(buffer) {
    if (!buffer || buffer.length < 2) {
        return false; // 数据太短，无法包含校验码
    }

    // 1. 提取除最后一个字节以外的所有数据
    const data = buffer.slice(0, -1);
    
    // 2. 提取最后一个字节作为接收到的校验码
    const receivedCrc = buffer[buffer.length - 1];

    // 3. 计算数据的 CRC8 值
    const calculatedCrc = crc8(data).slice(-1)[0];

    // 4. 对比计算结果与接收到的校验码
    return calculatedCrc === receivedCrc;
}

/* // --- 测试代码 ---
const validBuffer = Buffer.from([0xaa, 0x03, 0xee, 0x74]); 
const invalidBuffer = Buffer.from([0xaa, 0x02, 0x01, 0xe5]);

console.log('校验正确包:', crc8VF(validBuffer));   // 预期: true (取决于具体多项式)
console.log('校验错误包:', crc8VF(invalidBuffer)); // 预期: false */

export { crc8VF }
