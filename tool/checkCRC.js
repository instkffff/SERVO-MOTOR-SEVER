import { calculateCRC } from './CRC.js';

/**
 * @param {Buffer} buffer - 完整的 Modbus RTU 报文
 * @returns {Buffer|null}
 */
function checkCRC(buffer) {
    if (!buffer || buffer.length < 4) return null;

    // 1. 获取除最后两个字节（CRC）之外的数据部分
    const data = buffer.subarray(0, buffer.length - 2);
    
    // 2. 调用你的函数计算校验码 [low, high]
    const [calcLow, calcHigh] = calculateCRC(data);
    
    // 3. 获取报文末尾的两个字节
    const bufferLow = buffer[buffer.length - 2];
    const bufferHigh = buffer[buffer.length - 1];

    // 4. 对比计算结果与报文末尾的字节
    if (calcLow === bufferLow && calcHigh === bufferHigh) {
        return buffer;
    }

    return null;
}


/* // --- 使用示例 ---
const validPacket = Buffer.from([0x01, 0x03, 0x00, 0x3b, 0x00, 0x01, 0xf5, 0xc7]);
const invalidPacket = Buffer.from([0x01, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);

console.log(checkCRC(validPacket));
console.log(checkCRC(invalidPacket));
 */

export { checkCRC };
