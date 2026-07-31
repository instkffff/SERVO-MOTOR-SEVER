import { crc8 } from '../tools/crc8.js';

/**
 * 构建卸载数据包
 * @param {number} diameter1 - 大圈直径 (uint16)
 * @param {number} diameter2 - 小圈直径 (uint16)
 * @param {number} length - 长度 (uint16)
 * @param {number} result - 检测结果 (uint8)
 * @returns {Buffer} 包含 CRC-8 校验位的完整数据包
 */
function offload(diameter1, diameter2, length, result) {
    // 重新计算长度: 包头(1) + 功能(1) + 数据1(2) + 数据2(2) + 数据3(2) + 数据4(1) = 9 字节
    const buf = Buffer.alloc(9);

    buf[0] = 0xAA;          // 包头
    buf[1] = 0x02;          // 功能码
    
    // 使用 writeUInt16BE 写入 2 字节整数 (Big Endian)
    buf.writeUInt16BE(diameter1, 2); // 占用索引 2, 3
    buf.writeUInt16BE(diameter2, 4); // 占用索引 4, 5
    buf.writeUInt16BE(length, 6);    // 占用索引 6, 7
    
    buf[8] = result & 0x0F;         // 数据4 (确保只有 4 位)

    // 调用 crc8 函数，它会计算校验码并将其追加到 Buffer 尾部
    return crc8(buf);
}

const offloadSuccess = Buffer.from([0xaa, 0x02, 0x01, 0xe2]);

/* // 现在传入 10000 等大数将正确转换
console.log(offload(10000, 9000, 8000, 1)); */

export { offload, offloadSuccess }
