import { checkCRC } from './checkCRC.js'

/**
 * 从 Buffer 中去掉前 2 个字节和后 2 个字节，并转换为 hex 字符串
 * @param {Buffer} buffer 
 * @returns {string}
 */
function bufferCut(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("传入的参数必须是 Buffer 类型");
    }

    // 长度校验：必须大于 4 字节（头2尾2）才有 payload
    if (buffer.length <= 4) {
        return "";
    }

    // 执行截取并返回 hex 字符串
    return buffer.subarray(2, buffer.length - 2).toString('hex');
}

function VFBack(buffer, ComBack) {
    if (checkCRC(buffer) === null) {
        console.log('CRC 校验失败')
        return false
    }

    // 获取去掉头尾后的 payload 部分
    const payload = buffer.subarray(2, buffer.length - 2);
    const result = payload.toString('hex');

    // 1. 如果 ComBack 是数组，检查结果是否在数组中
    if (Array.isArray(ComBack)) {
        return ComBack.includes(result);
    }

    // 2. 如果 ComBack 是数字，直接对比 buffer 的字节长度
    if (typeof ComBack.Length === 'number') {
        return buffer.length === ComBack.Length;
    }

    // 3. 如果 ComBack 是字符串，执行原有的相等判断
    if (typeof ComBack === 'string') {
        return result === ComBack;
    }

    return false;
}

export { VFBack }