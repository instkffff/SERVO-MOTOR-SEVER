/* Mv
Modbus

Addr hex 地址
functionCode 10
location 00 FC
registerCount 00 02
bytes 04
value 脉冲数-有符号int32_t 
CRC16-Modbus

return dataBuffer
*/

/* 返回解析 

MvBack
Modbus

addr hex 地址
functionCode 10
location 00 FC
value 00 02
CRC16-Modbus

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 生成移动指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} pulses 脉冲数 (有符号 int32)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function Mv(slaveAddr, pulses = 0) {
    // 1. 构建基础数据包头部
    const header = Buffer.from([
        slaveAddr, 
        0x10,       // Function Code: Write Multiple Registers
        0x00, 0xFC, // Location: 00 FC
        0x00, 0x02, // Register Count: 00 02
        0x04        // Bytes: 04
    ]);

    // 2. 处理 32 位有符号整数 (int32_t)
    const valueBuf = Buffer.alloc(4);
    valueBuf.writeInt32BE(pulses, 0);

    const data = Buffer.concat([header, valueBuf]);

    // 3. 计算 CRC16-Modbus
    const [crcLow, crcHigh] = calculateCRC(data);

    // 4. 将 CRC 附加到数据包末尾
    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* // 示例用法:
const framePos = Mv(0x01, 1000); 
console.log(framePos.toString('hex'));*/

export { Mv };