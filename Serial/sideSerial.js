import { SerialPort } from 'serialport'

// 侧边串口实例（完全独立于主串口）
let sidePort = null
let sideReceiveBuffer = Buffer.alloc(0)

/**
 * 打开侧边串口
 */
function openSideSerialPort(path, options = {}) {
    return new Promise((resolve, reject) => {
        if (sidePort && sidePort.isOpen) {
            console.log('[侧边串口] 串口已打开，先关闭')
            closeSideSerialPort()
        }

        const config = {
            path,
            baudRate: options.baudRate || 9600,
            dataBits: options.dataBits || 8,
            stopBits: options.stopBits || 1,
            parity: options.parity || 'none',
            autoOpen: false
        }

        sidePort = new SerialPort(config)

        sidePort.open((err) => {
            if (err) {
                console.error('[侧边串口] 打开失败:', err.message)
                reject(err)
                return
            }
            console.log(`[侧边串口] 打开成功: ${path} @ ${config.baudRate}bps`)
            resolve()
        })

        sidePort.on('data', (data) => {
            sideReceiveBuffer = Buffer.concat([sideReceiveBuffer, data])
            // console.log('[侧边串口] 收到数据, 长度:', data.length)
        })

        sidePort.on('error', (err) => {
            console.error('[侧边串口] 错误:', err.message)
        })

        sidePort.on('close', () => {
            console.log('[侧边串口] 已关闭')
        })
    })
}

/**
 * 关闭侧边串口
 */
function closeSideSerialPort() {
    if (sidePort && sidePort.isOpen) {
        sidePort.close((err) => {
            if (err) {
                console.error('[侧边串口] 关闭失败:', err.message)
                return
            }
            console.log('[侧边串口] 已关闭')
        })
    } else {
        console.log('[侧边串口] 未打开，无需关闭')
    }
}

/**
 * 侧边串口发送数据
 */
function sendSideData(data) {
    return new Promise((resolve, reject) => {
        if (!sidePort || !sidePort.isOpen) {
            const errMsg = '侧边串口未打开，无法发送数据'
            console.error('[侧边串口]', errMsg)
            reject(new Error(errMsg))
            return
        }

        sidePort.write(data, (err) => {
            if (err) {
                console.error('[侧边串口] 发送失败:', err.message)
                reject(err)
                return
            }
            console.log('[侧边串口] 发送成功, 长度:', data.length)
            resolve()
        })
    })
}

/**
 * 注册侧边串口数据接收回调（单监听器模式）
 * @param {function} callback - 回调函数，参数为 Buffer
 */
function onSideReceiveData(callback) {
    if (!sidePort) {
        console.error('[侧边串口] 未初始化')
        return
    }

    sidePort.removeAllListeners('data')
    sidePort.on('data', (data) => {
        sideReceiveBuffer = Buffer.concat([sideReceiveBuffer, data])
        console.log('[侧边串口] 收到数据, 长度:', data.length)
        
        // 检查是否收够8个字节
        if (sideReceiveBuffer.length >= 8 && typeof callback === 'function') {
            // 取出前8个字节
            const packet = sideReceiveBuffer.subarray(0, 8)
            // 移除已取出的8个字节
            sideReceiveBuffer = sideReceiveBuffer.subarray(8)
            // 回调返回8字节数据包
            callback(packet)
        }
    })
}

/**
 * 获取侧边串口状态
 */
function getSidePortStatus() {
    if (!sidePort) {
        return {
            isOpen: false,
            path: null,
            baudRate: null,
            bufferLength: 0,
            message: '侧边串口未初始化'
        }
    }
    return {
        isOpen: sidePort.isOpen,
        path: sidePort.path,
        baudRate: sidePort.baudRate,
        bufferLength: sideReceiveBuffer.length,
        message: sidePort.isOpen ? '侧边串口已打开' : '侧边串口未打开'
    }
}

/**
 * 清空侧边串口接收缓冲区
 */
function clearSideReceiveBuffer() {
    sideReceiveBuffer = Buffer.alloc(0)
    console.log('[侧边串口] 接收缓冲区已清空')
}

/**
 * 获取侧边串口接收缓冲区
 */
function getSideReceiveBuffer() {
    return sideReceiveBuffer
}

export {
    openSideSerialPort,
    closeSideSerialPort,
    sendSideData,
    onSideReceiveData,
    getSidePortStatus,
    clearSideReceiveBuffer,
    getSideReceiveBuffer,
}