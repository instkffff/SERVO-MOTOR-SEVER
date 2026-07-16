/* →发 0A 06 00 53 00 01 B9 60 
←收 0A 06 00 53 00 01 B9 60  

0 停 1 正 2 反
*/

/* Spin
Modbus

Addr hex 地址
functionCode 06
location 00 53
value 
    - 0 停 
    - 1 正
    - 2 反

CRC16-Modbus

return dataBuffer

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 控制旋转方向
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} direction 方向 (0: 停, 1: 正, 2: 反)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function Spin(slaveAddr, direction) {
    const data = Buffer.from([
        slaveAddr, 
        0x06,       // Function Code: Write Single Register
        0x00, 0x53, // Location: 00 53
        0x00, direction // Value: 0, 1, or 2
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* const frame = Spin(0x0A, 1);
console.log(frame.toString('hex'));
 */

export { Spin };