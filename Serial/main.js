import { checkCRC } from '../tool/checkCRC.js';
import { VFBack } from '../tool/VFBack.js';
import { GX28 } from '../GX28StepMotor/main.js';
import { ZSDCM } from '../ZSDCM/main.js';
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

// ==== 全局超时配置 ====
let RECEIVE_TIMEOUT_MS = 3000          // 默认 3 秒，可外部修改
let receiveTimer = null                // 定时器句柄

const timeoutResponse = {
    "status": "timeout",
    "data": [],
}

const cmdGX28 = ['Cal', 'EStatus', 'Mv', 'MvSetting', 'Stop', 'Zero', 'ZeroSetting', 'ZeroStatus']
const cmdZSDCM = ['SetAccPulsHz', 'SetStopHz', 'SetPuls', 'SetPulsHz', 'ZeroSwitch', 'SpinStatus', 'Spin']

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

    // 绑定 send 事件 - 指令分流
    bus.on('send', async (data) => {
        let convertedData = convertData(data)
        let buffer = null

        // ===== 指令分流 =====
        if (cmdGX28.includes(convertedData.cmd)) {
            // GX28 步进电机指令
            buffer = GX28(convertedData.cmd, convertedData.params)
        } else if (cmdZSDCM.includes(convertedData.cmd)) {
            // ZSDCM 直流电机指令
            buffer = ZSDCM(convertedData.cmd, convertedData.params)
        } else {
            console.log(`未知指令: ${convertedData.cmd}`)
            emitResponse(resError)
            return
        }

        if (buffer === null) {
            emitResponse(resError)
            console.log('send buffer is null')
            return
        }

        await sendData(buffer)

        // ===== 启动接收超时定时器 =====
        if (receiveTimer) clearTimeout(receiveTimer)
        receiveTimer = setTimeout(() => {
            console.log(`接收超时 (${RECEIVE_TIMEOUT_MS}ms): ${CMD}`)
            emitResponse(timeoutResponse)
            receiveTimer = null
        }, RECEIVE_TIMEOUT_MS)
    });

    // 绑定接收数据回调
    onReceiveData((data) => {
        // 收到数据 → 清除超时定时器
        if (receiveTimer) {
            clearTimeout(receiveTimer)
            receiveTimer = null
        }

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
        /** 设置接收超时时间（毫秒） */
        setTimeout: (ms) => { RECEIVE_TIMEOUT_MS = ms },
    }
}


export { initSerialApp }