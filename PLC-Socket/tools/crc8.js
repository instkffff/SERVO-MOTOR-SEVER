/**
 * 计算 CRC8 校验码并将其添加到 Buffer 末尾
 * @param {Buffer} buffer - 输入的数据 Buffer
 * @returns {Buffer} - 包含校验码的新 Buffer
 */
function crc8(buffer) {
    const POLYNOMIAL = 0x07; // 常用多项式 x^8 + x^2 + x + 1
    let crc = 0x00; // 初始值

    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x80) !== 0) {
                crc = (crc << 1) ^ POLYNOMIAL;
            } else {
                crc <<= 1;
            }
            crc &= 0xFF; // 保持在 8 位范围内
        }
    }

    // 创建一个新 Buffer，长度为原长度 + 1
    const result = Buffer.allocUnsafe(buffer.length + 1);
    buffer.copy(result);
    result[buffer.length] = crc;

    return result;
}

/* // --- 测试代码 ---
const testData = Buffer.from([0xaa, 0x03, 0xee]);
const finalBuffer = crc8(testData);
console.log('原数据:', testData);
console.log('添加校验码后:', finalBuffer);
console.log('校验码为:', finalBuffer[finalBuffer.length - 1].toString(16)); */

export { crc8 }