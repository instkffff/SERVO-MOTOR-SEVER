/* En
Modbus

Addr hex 地址
functionCode 10
location 00 F3
registerCount 00 02
bytes 04
value1 AB 使能状态
    - 00 不使能
    - 01 使能
value2 同步标志 00
    - 00 不同步
    - 01 同步
CRC16-Modbus

return dataBuffer

*/

/* 返回解析 

EnBack
Modbus

addr hex 地址
functionCode 10
location 00 F3
value 00 02
CRC16-Modbus

return addrInt, locationInt, valueInt

*/

import { calculateCRC } from '../tool/CRC.js';

/**
 * 生成使能指令数据包
 * @param {number} slaveAddr 设备地址 (Addr hex)
 * @param {number} enableStatus 使能状态 (0x00: 不使能, 0x01: 使能)
 * @param {number} syncFlag 同步标志 (0x00: 立即, 0x01: 缓存)
 * @returns {Buffer} Modbus RTU 数据帧
 */
function En(slaveAddr, enableStatus = 0x01, syncFlag = 0x00) {
    const data = Buffer.from([
        slaveAddr, 
        0x10,       // Function Code: Write Multiple Registers
        0x00, 0xF3, // Location: 00 F3
        0x00, 0x02, // Register Count: 00 02
        0x04,       // Bytes: 04
        0xAB, enableStatus, // Value 1: 使能状态
        syncFlag, 0x00      // Value 2: 同步标志
    ]);

    const [crcLow, crcHigh] = calculateCRC(data);

    const dataBuffer = Buffer.concat([
        data, 
        Buffer.from([crcLow, crcHigh])
    ]);

    return dataBuffer;
}

/**
 * 解析使能返回数据包
 * @param {Buffer} buffer 接收到的 Modbus RTU 响应帧
 * @returns {{addrInt: number, locationInt: number, valueInt: number} | null} 解析结果或校验失败返回 null
 */
function EnBack(buffer) {
    if (!buffer || buffer.length !== 8) {
        console.error('Invalid buffer length');
        return null;
    }

    const data = buffer.slice(0, 6);
    const receivedCrcLow = buffer[6];
    const receivedCrcHigh = buffer[7];
    const [calcCrcLow, calcCrcHigh] = calculateCRC(data);

    if (receivedCrcLow !== calcCrcLow || receivedCrcHigh !== calcCrcHigh) {
        console.error('CRC verification failed');
        return null;
    }

    const addrInt = buffer[0];
    const locationInt = (buffer[2] << 8) | buffer[3];
    const valueInt = (buffer[4] << 8) | buffer[5];

    return {
        addrInt,
        locationInt,
        valueInt
    };
}

// 示例用法:
const frame = En(0x01, 0x01, 0x00); 
console.log('Send Frame:', frame.toString('hex'));

// 模拟响应包 (Modbus 10 响应: 地址 + 功能码 + 起始地址 + 数量 + CRC)
const mockResponse = Buffer.from([0x01, 0x10, 0x00, 0xF3, 0x00, 0x02, 0xb1, 0xfb]); 
// 注意：上面的 mockResponse CRC 是 00 00，实际运行 EnBack 会因为 CRC 校验失败返回 null
// 实际测试时请使用真实的响应包或计算正确的 CRC
const parsedResponse = EnBack(mockResponse);
console.log('Parsed Response:', parsedResponse);



export { En, EnBack };
