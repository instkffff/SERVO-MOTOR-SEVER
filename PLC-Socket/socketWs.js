import { WebSocketServer } from 'ws';
import net from 'net';
import { offload, offloadSuccess } from './protocol/offload.js';
import { load, loadSuccess } from './protocol/load.js';
import { sendError } from './protocol/error.js';
import { crc8VF } from './tools/crc8VF.js';

const WS_PORT = 1200;
const SOCKET_PORT = 1100;

// 存储当前的连接
let currentWs = null;
let currentSocket = null;

/**
 * 初始化并启动桥接服务器
 * @returns {Object} 返回服务器实例，方便后续关闭或管理
 */
function initBridge() {
    console.log('Initializing Bridge Server...');

    // --- WebSocket 服务器实现 ---
    const wss = new WebSocketServer({ port: WS_PORT });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        currentWs = ws;

        ws.on('message', (message) => {
            try {
                const payload = JSON.parse(message);
                const { cmd, data } = payload;

                if (!currentSocket) {
                    ws.send(JSON.stringify({ cmd: 'EE', data: [] }));
                    return;
                }

                switch (cmd) {
                    case 'Load':
                        // aa 01 00 da
                        currentSocket.write(load);
                        break;
                    case 'Offload':
                        currentSocket.write(offload(data[0], data[1], data[2], data[3]));
                        break;
                    default:
                        console.warn(`Unknown WS command: ${cmd}`);
                        ws.send(JSON.stringify({ cmd: 'EE', data: [] }));
                }
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

    // --- TCP Socket 服务器实现 ---
    const server = net.createServer((socket) => {
        console.log('Socket client connected');
        currentSocket = socket;

        socket.on('data', (buffer) => {
            if (!crc8VF(buffer)) {
                console.error('CRC8 Check Failed');
                socket.write(sendError);
                return;
            }

            if (!currentWs) {
                socket.write(sendError);
                return;
            }

            try {
                // 实际解析逻辑应在 protocol 文件夹中实现
                if (buffer.includes(loadSuccess)) {
                    currentWs.send(JSON.stringify({ cmd: 'LoadSuccess', data: [] }));
                } else if (buffer.includes(offloadSuccess)) {
                    currentWs.send(JSON.stringify({ cmd: 'OffloadSuccess', data: [] }));
                } else {
                    console.warn('Received unknown socket buffer');
                }
            } catch (e) {
                console.error('Socket Data Processing Error:', e);
                socket.write(sendError);
            }
        });

        socket.on('close', () => {
            console.log('Socket client disconnected');
            currentSocket = null;
        });

        socket.on('error', (err) => {
            console.error('Socket Error:', err);
        });
    });

    server.listen(SOCKET_PORT, () => {
        console.log(`WebSocket server listening on ws://127.0.0.1:${WS_PORT}`);
        console.log(`Socket server listening on 127.0.0.1:${SOCKET_PORT}`);
    });

    return { wss, server };
}


export { initBridge };

