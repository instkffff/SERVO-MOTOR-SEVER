/* MvSetting
Modbus

Addr hex 地址
functionCode 10
location 00 F1
registerCount 00 03
bytes 06
value1 00 加速度
value2 速度（RPM）
value3 00 00
CRC16-Modbus

return dataBuffer
*/

/* 返回解析 

MvSettingBack
Modbus

addr hex 地址
functionCode 10
location 00 F1
value 00 03
CRC16-Modbus

return bufferString

*/

import { calculateCRC } from './tool/CRC.js';

/**
 * 生成移动设置指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} acceleration 加速度 (16位整数)
 * @param {number} speed 速度 (RPM, 16位整数)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function MvSetting(slaveAddr, acceleration = 100, speed = 1200) {
    // 1. 构建基础数据包头部
    // 结构: [设备地址, 功能码, 寄存器高位, 寄存器低位, 寄存器数量高位, 寄存器数量低位, 字节数]
    const header = Buffer.from([
        slaveAddr, 
        0x10,       // Function Code: Write Multiple Registers
        0x00, 0xF1, // Location: 00 F1
        0x00, 0x03, // Register Count: 00 03
        0x06        // Bytes: 06
    ]);

    // 2. 处理数值部分 (共 6 字节)
    const valueBuf = Buffer.alloc(6);
    // value1: 加速度 (2字节, 大端序)
    valueBuf.writeUInt16BE(acceleration, 0);
    // value2: 速度 (2字节, 大端序)
    valueBuf.writeUInt16BE(speed, 2);
    /* // value3: 固定为 00 00 (2字节)
    valueBuf.writeUInt16BE(1, 4); */
    // value3: 固定为 01 00 (2字节)
    valueBuf.writeUInt8(0x01, 4);  // 写入第一个字节 01
    valueBuf.writeUInt8(0x00, 5);  // 写入第二个字节 00

    // 合并头部和数值部分
    const data = Buffer.concat([header, valueBuf]);

    // 3. 计算 CRC16-Modbus
    const [crcLow, crcHigh] = calculateCRC(data);

    // 4. 将 CRC 附加到数据包末尾 (低字节在前，高字节在后)
    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/* // 示例用法:
// 设备地址 0x01, 加速度 200, 速度 1200 RPM
const settingFrame = MvSetting(0x01, 200, 1200); 
console.log(settingFrame.toString('hex')); */

export { MvSetting };

