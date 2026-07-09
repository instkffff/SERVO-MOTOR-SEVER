import { SerialPort } from 'serialport'

// 串口实例
let port = null
// 接收数据缓冲区 (Buffer 格式)
let receiveBuffer = Buffer.alloc(0)

/**
 * 打开串口
 * @param {string} path - 串口路径，如 'COM3'
 * @param {object} options - 串口配置
 * @param {number} [options.baudRate=9600] - 波特率
 * @param {number} [options.dataBits=8] - 数据位
 * @param {number} [options.stopBits=1] - 停止位
 * @param {string} [options.parity='none'] - 校验位
 * @returns {Promise<void>}
 */
function openSerialPort(path, options = {}) {
    return new Promise((resolve, reject) => {
        if (port && port.isOpen) {
            console.log('[串口] 串口已打开，先关闭当前串口')
            closeSerialPort()
        }

        const config = {
            path,
            baudRate: options.baudRate || 9600,
            dataBits: options.dataBits || 8,
            stopBits: options.stopBits || 1,
            parity: options.parity || 'none',
            autoOpen: false
        }

        port = new SerialPort(config)

        port.open((err) => {
            if (err) {
                console.error('[串口] 打开失败:', err.message)
                reject(err)
                return
            }
            console.log(`[串口] 打开成功: ${path} @ ${config.baudRate}bps`)
            resolve()
        })

        port.on('data', (data) => {
            // data 本身就是 Buffer，直接拼接
            receiveBuffer = Buffer.concat([receiveBuffer, data])
            console.log('[串口] 收到数据, 长度:', data.length)
        })

        port.on('error', (err) => {
            console.error('[串口] 错误:', err.message)
        })

        port.on('close', () => {
            console.log('[串口] 串口已关闭')
        })
    })
}

/**
 * 关闭串口
 */
function closeSerialPort() {
    if (port && port.isOpen) {
        port.close((err) => {
            if (err) {
                console.error('[串口] 关闭失败:', err.message)
                return
            }
            console.log('[串口] 串口已关闭')
        })
    } else {
        console.log('[串口] 串口未打开，无需关闭')
    }
}

/**
 * 串口发送数据
 * @param {Buffer} data - 要发送的数据 (Buffer)
 * @returns {Promise<void>}
 */
function sendData(data) {
    return new Promise((resolve, reject) => {
        if (!port || !port.isOpen) {
            const errMsg = '串口未打开，无法发送数据'
            console.error('[串口]', errMsg)
            reject(new Error(errMsg))
            return
        }

        port.write(data, (err) => {
            if (err) {
                console.error('[串口] 发送失败:', err.message)
                reject(err)
                return
            }
            console.log('[串口] 发送成功, 长度:', data.length)
            resolve()
        })
    })
}

/**
 * 注册数据接收回调
 * @param {function} callback - 接收数据的回调函数，参数为接收到的 Buffer
 */
function onReceiveData(callback) {
    if (!port) {
        console.error('[串口] 串口未初始化')
        return
    }

    port.removeAllListeners('data')
    port.on('data', (data) => {
        // data 是 Buffer，直接拼接并传给回调
        receiveBuffer = Buffer.concat([receiveBuffer, data])
        console.log('[串口] 收到数据, 长度:', data.length)
        if (typeof callback === 'function') {
            callback(data)
        }
    })
}

/**
 * 获取串口状态
 * @returns {object} 串口状态对象
 */
function getPortStatus() {
    if (!port) {
        return {
            isOpen: false,
            path: null,
            baudRate: null,
            message: '串口未初始化'
        }
    }

    return {
        isOpen: port.isOpen,
        path: port.path,
        baudRate: port.baudRate,
        bufferLength: receiveBuffer.length,
        message: port.isOpen ? '串口已打开' : '串口未打开'
    }
}

/**
 * 清空接收缓冲区
 */
function clearReceiveBuffer() {
    receiveBuffer = Buffer.alloc(0)
    console.log('[串口] 接收缓冲区已清空')
}

/**
 * 获取接收缓冲区内容
 * @returns {Buffer}
 */
function getReceiveBuffer() {
    return receiveBuffer
}

/**
 * 列出所有可用串口
 * @returns {Promise<Array>}
 */
async function listPorts() {
    try {
        const ports = await SerialPort.list()
        console.log('[串口] 可用串口列表:', ports)
        return ports
    } catch (err) {
        console.error('[串口] 列出串口失败:', err.message)
        throw err
    }
}

export {
    openSerialPort,
    closeSerialPort,
    sendData,
    onReceiveData,
    getPortStatus,
    clearReceiveBuffer,
    getReceiveBuffer,
    listPorts
}

