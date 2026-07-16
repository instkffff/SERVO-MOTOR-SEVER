/* →发 0A 10 00 46 00 02 04 00 00 00 32 D3 44 
←收 0A 10 00 46 00 02 A1 66 

uint32
*/

/* SetPulsHz
Modbus

Addr hex 地址
functionCode 10
location 00 46
registerCount 00 02
bytes 04
value uint32 频率
CRC16-Modbus

return dataBuffer

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 设置脉冲频率 (uint32)
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} value 频率值 (uint32)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function SetPulsHz(slaveAddr, value) {
    // 将 32 位无符号整数转换为 4 个字节 (大端模式)
    const valBytes = [
        (value >> 24) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF
    ];

    const data = Buffer.from([
        slaveAddr, 
        0x10,       // Function Code: Write Multiple Registers
        0x00, 0x46, // Location: 00 46
        0x00, 0x02, // Register Count: 2 registers (4 bytes)
        0x04,       // Byte Count: 4 bytes
        ...valBytes // Value: uint32
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* const frame = SetPulsHz(0x0A, 50);
console.log(frame.toString('hex')); */

export { SetPulsHz };