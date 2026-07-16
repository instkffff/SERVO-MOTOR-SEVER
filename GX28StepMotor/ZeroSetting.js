/* ZeroSetting
Modbus

Addr hex 地址
functionCode 10
location 00 4C 
registerCount 00 09
bytes 12
value1 AE 00
value2 02 01
value3 回零速度
value4 回零超时时间uint32_t
value5 碰撞回零检测转速 uint16_t
value6 碰撞回零检测电流 uint16_t
value7 碰撞回零检测时间 uint16_t
value8 00 00
CRC16-Modbus

return dataBuffer
*/

/* 返回解析 

ZeroSettingBack
Modbus

addr hex 地址
functionCode 10
location 00 4C
value 00 09
CRC16-Modbus

return bufferString

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 生成回零设置指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} zeroSpeed 回零速度 (uint16)
 * @param {number} zeroTimeout 回零超时时间 (uint32)
 * @param {number} collisionSpeed 碰撞回零检测转速 (uint16)
 * @param {number} collisionCurrent 碰撞回零检测电流 (uint16)
 * @param {number} collisionTime 碰撞回零检测时间 (uint16)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function ZeroSetting(slaveAddr, zeroSpeed = 300, zeroTimeout = 10000, collisionSpeed = 300, collisionCurrent = 800, collisionTime = 60) {
    // 1. 构建基础数据包头部
    // 结构: [设备地址, 功能码, 寄存器高位, 寄存器低位, 寄存器数量高位, 寄存器数量低位, 字节数]
    // 注意: bytes 12 在此处应为 0x12 (十进制 18 字节)
    const header = Buffer.from([
        slaveAddr, 
        0x10,       // Function Code: Write Multiple Registers
        0x00, 0x4C, // Location: 00 4C
        0x00, 0x09, // Register Count: 00 09
        0x12        // Bytes: 18 (0x12)
    ]);

    // 2. 处理数值部分 (共 18 字节)
    const valueBuf = Buffer.alloc(18);
    
    // value1: AE 00
    valueBuf.writeUInt16BE(0xAE00, 0);
    // value2: 02 01
    valueBuf.writeUInt16BE(0x0201, 2);
    // value3: 回零速度 (uint16)
    valueBuf.writeUInt16BE(zeroSpeed, 4);
    // value4: 回零超时时间 (uint32)
    valueBuf.writeUInt32BE(zeroTimeout, 6);
    // value5: 碰撞回零检测转速 (uint16)
    valueBuf.writeUInt16BE(collisionSpeed, 10);
    // value6: 碰撞回零检测电流 (uint16)
    valueBuf.writeUInt16BE(collisionCurrent, 12);
    // value7: 碰撞回零检测时间 (uint16)
    valueBuf.writeUInt16BE(collisionTime, 14);
    // value8: 00 00
    valueBuf.writeUInt16BE(0, 16);

    // 合并头部和数值部分
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
// 设备地址 0x01, 速度 100, 超时 10000ms, 碰撞转速 300, 电流 800, 时间 60ms
const zeroFrame = ZeroSetting(0x01, 100, 10000, 300, 800, 60); 
console.log(zeroFrame.toString('hex')); */

export { ZeroSetting };