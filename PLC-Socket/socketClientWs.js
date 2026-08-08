import { WebSocketServer } from 'ws';
import net from 'net';
import { offload, offloadSuccess } from './protocol/offload.js';
import { load, loadSuccess, loadNone } from './protocol/load.js';
import { sendError } from './protocol/error.js';
import { crc8VF } from './tools/crc8VF.js';
import { AutoStart, StepStart, Stop, EStop } from './protocol/workflow.js';
import { sendSuccess } from './protocol/success.js';
import { PLC } from '../Setting.js';
import { accept, reject } from './protocol/AorR.js';

const WS_PORT = 1200;
const SOCKET_HOST = PLC.host;   // TCP 服务器地址
const SOCKET_PORT = PLC.port;   // TCP 服务器端口

// 存储当前的连接
let currentWs = null;
let currentSocket = null;
let reconnectTimer = null;

/**
 * 处理来自 Socket 的数据缓冲
 * @param {Buffer} buffer - 接收到的原始数据
 * @param {net.Socket} socket - 当前 Socket 连接
 */
function handleSocketData(buffer, socket) {
    if (!crc8VF(buffer)) {
        console.error('CRC8 Check Failed');
        socket.write(sendError);
        return;
    }

    if (!currentWs) {
        socket.write(sendError);
        return;
    }

    const result = parseSocketBuffer(buffer);
    if (result) {
        currentWs.send(JSON.stringify({ cmd: result.cmd, data: result.data }));
        socket.write(sendSuccess);
    } else {
        console.warn('Received unknown socket buffer');
        socket.write(sendError);
    }
}

/**
 * 解析 Socket 缓冲，返回匹配的命令对象
 * @param {Buffer} buffer
 * @returns {{ cmd: string, data: any[] } | null}
 */
function parseSocketBuffer(buffer) {
    const cases = [
        { pattern: loadSuccess, cmd: 'LoadSuccess', data: [] },
        { pattern: offloadSuccess, cmd: 'OffloadSuccess', data: [] },
        { pattern: AutoStart, cmd: 'AutoStart', data: [] },
        { pattern: StepStart, cmd: 'StepStart', data: [] },
        { pattern: Stop, cmd: 'Stop', data: [] },
        { pattern: EStop, cmd: 'EStop', data: [] },
        { pattern: loadNone, cmd: 'LoadNone', data: [] },
    ];

    for (const { pattern, cmd, data } of cases) {
        if (buffer.includes(pattern)) {
            return { cmd, data };
        }
    }

    return null;
}

/**
 * 处理来自 WebSocket 的消息
 * @param {Object} payload - 解析后的 JSON 消息
 * @param {WebSocket} ws - 当前 WebSocket 连接
 */
function handleWsMessage(payload, ws) {
    const { cmd, data } = payload;

    if (!currentSocket) {
        ws.send(JSON.stringify({ cmd: 'EE', data: [] }));
        return;
    }

    const result = routeWsCommand(cmd, data);
    if (result) {
        currentSocket.write(result);
    } else {
        console.warn(`Unknown WS command: ${cmd}`);
        ws.send(JSON.stringify({ cmd: 'EE', data: [] }));
    }
}

/**
 * 根据 WS 命令路由到对应的 Socket 写入操作
 * @param {string} cmd
 * @param {any[]} data
 * @returns {Buffer | undefined}
 */
function routeWsCommand(cmd, data) {
    switch (cmd) {
        case 'Load':
            return load;
        case 'Offload':
            return offload(data[0], data[1], data[2], data[3]);
        case 'Accept':
            return accept;
        case 'Reject':
            return reject;
        default:
            return undefined;
    }
}

/**
 * 创建并连接 TCP Client
 * @returns {net.Socket}
 */
function createTcpClient() {
    const socket = new net.Socket();

    socket.connect(SOCKET_PORT, SOCKET_HOST, () => {
        console.log(`TCP client connected to ${SOCKET_HOST}:${SOCKET_PORT}`);
        currentSocket = socket;
        // 清除重连定时器
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    });

    socket.on('data', (buffer) => {
        handleSocketData(buffer, socket);
    });

    socket.on('close', () => {
        console.log('TCP client disconnected');
        currentSocket = null;
        // 自动重连
        scheduleReconnect();
    });

    socket.on('error', (err) => {
        console.error('TCP client error:', err.message);
        currentSocket = null;
    });

    return socket;
}

/**
 * 延迟重连 TCP 服务器
 */
function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
        console.log('Attempting TCP reconnect...');
        reconnectTimer = null;
        currentSocket = createTcpClient();
    }, 3000); // 3 秒后重连
}

/**
 * 初始化并启动桥接服务器
 * @returns {Object} 返回服务器实例，方便后续关闭或管理
 */
function initClientBridge() {
    console.log('Initializing Bridge Server...');

    // --- WebSocket 服务器实现 ---
    const wss = new WebSocketServer({ port: WS_PORT });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        currentWs = ws;

        ws.on('message', (message) => {
            try {
                const payload = JSON.parse(message);
                handleWsMessage(payload, ws);
            } catch (e) {
                console.error('WS Message Error:', e);
                ws.send(JSON.stringify({ cmd: 'EE', data: [] }));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            currentWs = null;
        });
    });

    // --- TCP Client 连接 ---
    currentSocket = createTcpClient();

    console.log(`WebSocket server listening on ws://127.0.0.1:${WS_PORT}`);
    console.log(`TCP client connecting to ${SOCKET_HOST}:${SOCKET_PORT}`);

    return { wss, socket: currentSocket };
}

export { initClientBridge };