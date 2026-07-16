/* Calibration
Modbus

Addr hex 地址
functionCode 06
location 00 06
value 00 01
CRC16-Modbus

return dataBuffer

*/

/* 返回解析 

CalBack
Modbus

addr hex 地址
functionCode 06
location 00 06
value 00 01
CRC16-Modbus


*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 生成校准指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function Cal(slaveAddr) {
    const data = Buffer.from([
        slaveAddr, 
        0x06,       // Function Code: Write Single Register
        0x00, 0x06, // Location: 00 06
        0x00, 0x01  // Value: 00 01
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* // 示例用法:
const frame = Cal(0x01); 
console.log(frame.toString('hex')); */

export { Cal };