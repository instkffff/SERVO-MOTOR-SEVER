/* modbus 40001 读取 

0 停 1 正 2 反

0A 03 02 00 01 DC 45 
*/

/* SpinStatus
Modbus

Addr hex 地址
functionCode 03
location 00 00
value 00 01
CRC16-Modbus

return dataBuffer

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 读取旋转状态
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function SpinStatus(slaveAddr) {
    const data = Buffer.from([
        slaveAddr, 
        0x03,       // Function Code: Read Holding Registers
        0x00, 0x00, // Location: 00 00
        0x00, 0x01  // Quantity: 读取 1 个寄存器
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* const frame = SpinStatus(0x0A);
console.log(frame.toString('hex'));
 */

export { SpinStatus };