/* EStatus
Modbus

Addr hex 地址
functionCode 03
location 00 3A
value 00 01
CRC16-Modbus

return dataBuffer

*/

/* 返回解析 

EStatusBack
Modbus

addr hex 地址
functionCode 03
bytes 02
value 00 电机状态标志

电机状态标志转换为二进制
    - 掉电标志 0/1
    - 0
    - 0
    - 0
    - 0
    - 0
    - 位置达到标志 0/1
    - 使能状态 0/1

CRC16-Modbus

return bufferString

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 生成读取电机状态指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function EStatus(slaveAddr) {
    // 1. 构建基础数据包
    // 结构: [设备地址, 功能码, 寄存器起始地址高位, 寄存器起始地址低位, 读取数量高位, 读取数量低位]
    const data = Buffer.from([
        slaveAddr, 
        0x03,       // Function Code: Read Holding Registers
        0x00, 0x3A, // Location: 00 3A
        0x00, 0x01  // Quantity: 00 01 (读取 1 个寄存器)
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

export { EStatus };