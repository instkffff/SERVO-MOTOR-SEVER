/* Stop
Modbus

Addr hex 地址
functionCode 06
location 00 FE
value 98 00
CRC16-Modbus

return dataBuffer

*/

/* 返回解析 

StopBack
Modbus

addr hex 地址
functionCode 06
location 00 FE
value 00 00
CRC16-Modbus

return bufferString

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 生成停止指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function Stop(slaveAddr) {
    // 1. 构建基础数据包
    // 结构: [设备地址, 功能码, 寄存器高位, 寄存器低位, 数值高位, 数值低位]
    const data = Buffer.from([
        slaveAddr, 
        0x06,       // Function Code: Write Single Register
        0x00, 0xFE, // Location: 00 FE
        0x98, 0x00  // Value: 98 00
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
const frame = Stop(0x01); 
console.log(frame.toString('hex')); */

export { Stop };