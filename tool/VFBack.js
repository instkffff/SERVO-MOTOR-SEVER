import { checkCRC } from './checkCRC.js'

/**
 * 从 Buffer 中去掉前 2 个字节和后 2 个字节，并转换为 UTF-8 字符串
 * @param {Buffer} buffer 
 * @returns {string}
 */
function bufferCut(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("传入的参数必须是 Buffer 类型");
    }

    // 长度校验：必须大于 6 字节才有意义
    if (buffer.length <= 6) {
        return "";
    }

    // 执行截取并返回
    const result = buffer.subarray(2, buffer.length - 2).toString('hex');
    return result;
}

function VFBack(buffer, ComBack) {
    if (checkCRC(buffer) === null) {
        return false
    }

    const result = bufferCut(buffer);

    // 如果 ComBack 是数组，检查结果是否在数组中
    if (Array.isArray(ComBack)) {
        return ComBack.includes(result);
    }

    // 如果 ComBack 是字符串，执行原有的相等判断
    return result === ComBack;
}

/* const CalBack = Buffer.from([0x01, 0x06, 0x00, 0x06, 0x00, 0x01, 0xA8, 0x0B])

console.log(VFBack(CalBack, '00060001')) */

export { VFBack }