/* ZeroStatus
Modbus

Addr hex 地址
functionCode 03
location 00 3B
value 00 01
CRC16-Modbus

return dataBuffer

*/

/* 返回解析 

ZeroStatusBack
Modbus

addr hex 地址
functionCode 03
bytes 02
value 00 03
CRC16-Modbus

return bufferString

*/

import { calculateCRC } from './tool/CRC.js';

/**
 * 生成读取归零状态指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function ZeroStatus(slaveAddr) {
    // 1. 构建基础数据包
    // 结构: [设备地址, 功能码, 寄存器起始地址高位, 寄存器起始地址低位, 读取数量高位, 读取数量低位]
    const data = Buffer.from([
        slaveAddr, 
        0x03,       // Function Code: Read Holding Registers
        0x00, 0x3B, // Location: 00 3B
        0x00, 0x01  // Quantity: 00 01 (读取 1 个寄存器)
    ]);

    // 2. 计算 CRC16-Modbus
    const [crcLow, crcHigh] = calculateCRC(data);

    // 3. 将 CRC 附加到数据包末尾
    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* // 示例用法:
// 设备地址 0x01
const frame = ZeroStatus(0x01); 
console.log(frame.toString('hex'));*/

export { ZeroStatus };