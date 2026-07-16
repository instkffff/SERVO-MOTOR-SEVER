import { checkCRC } from '../tool/checkCRC.js';
import { VFBack } from '../tool/VFBack.js';
import { GX28 } from '../GX28StepMotor/main.js';
import { createWebSocketAPI, emitResponse, getBusyState, bus } from '../websocket/API.js';
import { dataBack } from '../tool/dataBack.js';

import { setting } from '../Setting.js';

import {
    openSerialPort,
    closeSerialPort,
    sendData,
    onReceiveData,
    getPortStatus,
    clearReceiveBuffer,
    getReceiveBuffer,
    listPorts
} from './serial.js';

/* 
data example
{
  "cmd": "Cal",
  "id": "0x01",
  "data": [a,b,c]
}

convert
{
  "cmd": "Cal",
  "params": [id,a,b,c]
}
*/

let CMD = ''

const resError = {
    "status": "error",
    "data": [],
}

function convertData(input) {
    if (typeof input !== 'object' || input === null) {
        throw new Error('Input must be an object');
    }

    if (!input.hasOwnProperty('cmd') || !input.hasOwnProperty('id') || !input.hasOwnProperty('data')) {
        throw new Error('Input must contain cmd, id and data properties');
    }

    const output = {
        cmd: input.cmd,
        params: [input.id, ...input.data]
    };

    CMD = output.cmd
    return output;
}

/**
 * 初始化串口应用
 * @param {object} [options] - 可选配置
 * @param {number} [options.baudRate=115200] - 波特率，默认 115200
 * @param {string} [options.comPath] - 串口路径，默认使用 setting.COM
 * @returns {Promise<{ close: Function, getStatus: Function }>}
 */
async function initSerialApp(options = {}) {
    const comPath = options.comPath || setting.COM
    const baudRate = options.baudRate || 115200

    // 打开串口
    await openSerialPort(comPath, { baudRate })

    // 绑定 send 事件
    bus.on('send', async (data) => {
        let convertedData = convertData(data)
        let buffer = GX28(convertedData.cmd, convertedData.params)
        if (buffer === null) {
            emitResponse(resError)
            console.log('send buffer is null')
            return
        }
        await sendData(buffer)
    });

    // 绑定接收数据回调
    onReceiveData((data) => {
        console.log('接收数据:', data)
        let buffer = checkCRC(data)
        if (buffer === null) {
            emitResponse(resError)
            console.log('res buffer is null')
            return
        }
        
        if (VFBack(buffer, dataBack[CMD]) === true) {
            emitResponse({
                "status": "success",
                "data": [buffer.toString('hex')]
            })
        } else {
            emitResponse(resError)
            console.log('res buffer is not valid')
        }
    })

    console.log(`[SerialApp] 初始化完成: ${comPath} @ ${baudRate}bps`)

    // 返回控制接口
    return {
        /** 关闭串口 */
        close: () => closeSerialPort(),
        /** 获取串口状态 */
        getStatus: () => getPortStatus(),
        /** 清空接收缓冲区 */
        clearBuffer: () => clearReceiveBuffer(),
        /** 主动发送数据 */
        send: (data) => sendData(data),
        /** 列出可用串口 */
        listPorts: () => listPorts(),
    }
}


export { initSerialApp }