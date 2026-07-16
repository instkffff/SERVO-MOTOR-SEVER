/* →发 0A 10 00 BE 00 02 04 00 00 27 10 46 4F 
←收 0A 10 00 BE 00 02 20 97  

int 32
*/

/* SetPuls
Modbus

Addr hex 地址
functionCode 10
location 00 BE
registerCount 00 02
bytes 04
value int32 脉冲数
CRC16-Modbus

return dataBuffer

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 设置脉冲数 (int32)
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} value 脉冲数 (int32)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function SetPuls(slaveAddr, value) {
    // 将 32 位有符号整数转换为 4 个字节 (大端模式)
    // JavaScript 的位运算会自动处理为 32-bit signed integer
    const valBytes = [
        (value >> 24) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF
    ];

    const data = Buffer.from([
        slaveAddr, 
        0x10,       // Function Code: Write Multiple Registers
        0x00, 0xBE, // Location: 00 BE
        0x00, 0x02, // Register Count: 2 registers (4 bytes)
        0x04,       // Byte Count: 4 bytes
        ...valBytes // Value: int32
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* const frame = SetPuls(0x0A, 10000);
console.log(frame.toString('hex')); */


export { SetPuls };