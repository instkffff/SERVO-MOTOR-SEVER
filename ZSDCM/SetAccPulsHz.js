/* →发 0A 06 00 48 00 64 09 4C 
←收 0A 06 00 48 00 64 09 4C 

100 - 10000 int
*/

/* SetAccPulsHz
Modbus

Addr hex 地址
functionCode 06
location 00 48
value int
CRC16-Modbus

return dataBuffer

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 设置加速度脉冲频率
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} value 频率值 (100 - 10000)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function SetAccPulsHz(slaveAddr, value) {
    // 将 16 位整数转换为两个字节 (高位在前，低位在后)
    const highByte = (value >> 8) & 0xFF;
    const lowByte = value & 0xFF;

    const data = Buffer.from([
        slaveAddr, 
        0x06,       // Function Code: Write Single Register
        0x00, 0x48, // Location: 00 48
        highByte, 
        lowByte
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* const buffer = SetAccPulsHz(0x0A, 100);
console.log(buffer.toString('hex')); */

export { SetAccPulsHz };