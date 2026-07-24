import { checkCRC } from '../tool/checkCRC.js';
import { VFBack } from '../tool/VFBack.js';
import { GX28 } from '../GX28StepMotor/main.js';
import { ZSDCM } from '../ZSDCM/main.js';
import { createWebSocketAPI, emitResponse, getBusyState, bus } from '../websocket/API.js';
import { dataBack } from '../tool/dataBack.js';

import { setting, side } from '../Setting.js';

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

// ===== 新增：导入侧边串口模块 =====
import {
    openSideSerialPort,
    closeSideSerialPort,
    sendSideData,
    onSideReceiveData,
    getSidePortStatus,
    clearSideReceiveBuffer,
} from './sideSerial.js';

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
const DDServo = ['enOn', 'enOff']

// 01 06 00 35 00 01 58 04
const enOnBuffer = Buffer.from([0x01, 0x06, 0x00, 0x35, 0x00, 0x01, 0x58, 0x04])

// 01 06 00 35 00 00 99 c4
const enOffBuffer = Buffer.from([0x01, 0x06, 0x00, 0x35, 0x00, 0x00, 0x99, 0xc4])

// ===== 新增：DD伺服指令 → 发送缓冲区映射 =====
const ddServoBufferMap = {
    'enOn': enOnBuffer,
    'enOff': enOffBuffer,
}

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

    // ===== 1. 打开主串口（GX28 / ZSDCM）=====
    await openSerialPort(comPath, { baudRate })

    // ===== 2. 打开侧边串口（DD伺服 enOn / enOff）=====
    await openSideSerialPort(side.COM, {
        baudRate: side.BAUDRATE,
        dataBits: side.DATA,
        stopBits: side.STOP,
        parity: side.PARITY,
    })
    console.log(`[SerialApp] 侧边串口已打开: ${side.COM} @ ${side.BAUDRATE}bps`)

    // ===== 3. 绑定主串口 send 事件 - 指令分流 =====
    bus.on('send', async (data) => {
        let convertedData = convertData(data)
        let buffer = null

        // ===== 指令分流 =====
        if (cmdGX28.includes(convertedData.cmd)) {
            // GX28 步进电机指令 → 主串口
            buffer = GX28(convertedData.cmd, convertedData.params)
            if (buffer === null) {
                emitResponse(resError)
                console.log('send buffer is null')
                return
            }
            await sendData(buffer)

            // 启动主串口接收超时定时器
            if (receiveTimer) clearTimeout(receiveTimer)
            receiveTimer = setTimeout(() => {
                console.log(`接收超时 (${RECEIVE_TIMEOUT_MS}ms): ${CMD}`)
                emitResponse(timeoutResponse)
                receiveTimer = null
            }, RECEIVE_TIMEOUT_MS)

        } else if (cmdZSDCM.includes(convertedData.cmd)) {
            // ZSDCM 直流电机指令 → 主串口
            buffer = ZSDCM(convertedData.cmd, convertedData.params)
            if (buffer === null) {
                emitResponse(resError)
                console.log('send buffer is null')
                return
            }
            await sendData(buffer)

            // 启动主串口接收超时定时器
            if (receiveTimer) clearTimeout(receiveTimer)
            receiveTimer = setTimeout(() => {
                console.log(`接收超时 (${RECEIVE_TIMEOUT_MS}ms): ${CMD}`)
                emitResponse(timeoutResponse)
                receiveTimer = null
            }, RECEIVE_TIMEOUT_MS)

        } else if (DDServo.includes(convertedData.cmd)) {
            // ===== DD伺服指令 → 侧边串口（回环验证） =====
            const sendBuf = ddServoBufferMap[convertedData.cmd]
            if (!sendBuf) {
                console.log(`未知 DD 指令: ${convertedData.cmd}`)
                emitResponse(resError)
                return
            }

            await sendSideData(sendBuf)

            // 启动侧边串口接收超时定时器
            if (receiveTimer) clearTimeout(receiveTimer)
            receiveTimer = setTimeout(() => {
                console.log(`侧边串口接收超时 (${RECEIVE_TIMEOUT_MS}ms): ${CMD}`)
                emitResponse(timeoutResponse)
                receiveTimer = null
            }, RECEIVE_TIMEOUT_MS)

        } else {
            console.log(`未知指令: ${convertedData.cmd}`)
            emitResponse(resError)
            return
        }
    });

    // ===== 4. 绑定主串口接收回调（GX28 / ZSDCM 响应验证）=====
    onReceiveData((data) => {
        // 收到数据 → 清除超时定时器
        if (receiveTimer) {
            clearTimeout(receiveTimer)
            receiveTimer = null
        }

        console.log('主串口接收数据:', data)
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

    // ===== 5. 绑定侧边串口接收回调（DD伺服回环验证）=====
    onSideReceiveData((data) => {
        // 收到数据 → 清除超时定时器
        if (receiveTimer) {
            clearTimeout(receiveTimer)
            receiveTimer = null
        }

        console.log('侧边串口接收数据:', data)

        // 回环验证：收到的数据必须与发送的指令完全相同
        const expectedBuf = ddServoBufferMap[CMD]
        if (expectedBuf && data.equals(expectedBuf)) {
            emitResponse({
                "status": "success",
                "data": [data.toString('hex')]
            })
        } else {
            console.log(`侧边串口回环验证失败: 期望 ${expectedBuf?.toString('hex')}, 收到 ${data.toString('hex')}`)
            emitResponse(resError)
        }
    })

    console.log(`[SerialApp] 初始化完成: 主串口=${comPath} @ ${baudRate}bps, 侧边串口=${side.COM} @ ${side.BAUDRATE}bps`)

    // 返回控制接口
    return {
        /** 关闭串口 */
        close: () => {
            closeSerialPort()
            closeSideSerialPort()
        },
        /** 获取主串口状态 */
        getStatus: () => getPortStatus(),
        /** 获取侧边串口状态 */
        getSideStatus: () => getSidePortStatus(),
        /** 清空主串口接收缓冲区 */
        clearBuffer: () => clearReceiveBuffer(),
        /** 清空侧边串口接收缓冲区 */
        clearSideBuffer: () => clearSideReceiveBuffer(),
        /** 主动发送数据到主串口 */
        send: (data) => sendData(data),
        /** 主动发送数据到侧边串口 */
        sendSide: (data) => sendSideData(data),
        /** 列出可用串口 */
        listPorts: () => listPorts(),
        /** 设置接收超时时间（毫秒） */
        setTimeout: (ms) => { RECEIVE_TIMEOUT_MS = ms },
    }
}

export { initSerialApp }