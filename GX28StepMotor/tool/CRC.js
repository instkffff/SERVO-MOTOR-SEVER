/**
 * 计算 Modbus RTU CRC16 校验码
 * @param {Buffer} buffer 
 * @returns {number[]} [lowByte, highByte]
 */
function calculateCRC(buffer) {
    let crc = 0xFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x0001) !== 0) {
                crc = (crc >> 1) ^ 0xA001;
            } else {
                crc >>= 1;
            }
        }
    }
    return [crc & 0xFF, (crc >> 8) & 0xFF];
}

export { calculateCRC };