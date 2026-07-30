/* 
socket2ws 

socket 服务器在 127.0.0.1:1100
ws 服务器在 127.0.0.1:1200

服务器消息桥接
只允许一组桥接 唯一ws client 桥接唯一 socket client

*/

import net from 'net';
import { WebSocketServer } from 'ws';

let activeSocket = null;
let activeWsClient = null;

/**
 * 初始化 Socket 到 WebSocket 的桥接服务器
 * @param {Object} options 配置项
 * @param {string} options.socketPort TCP 端口，默认 1100
 * @param {string} options.wsPort WS 端口，默认 1200
 * @param {string} options.host 监听地址，默认 127.0.0.1
 */
function initBridge({ socketPort = 1100, wsPort = 1200, host = '127.0.0.1' } = {}) {
    console.log(`正在启动桥接服务: TCP(${host}:${socketPort}) <-> WS(${host}:${wsPort})`);

    // --- TCP Socket 服务器 ---
    const tcpServer = net.createServer((socket) => {
        console.log('TCP 客户端已连接');

        if (activeSocket) {
            console.log('已有 TCP 连接，断开旧连接...');
            activeSocket.destroy();
        }
        activeSocket = socket;

        socket.on('data', (data) => {
            if (activeWsClient && activeWsClient.readyState === 1) { // 1 === WebSocket.OPEN
                // 将 Buffer 转换为 ASCII 字符串
                const asciiData = data.toString('ascii');
                activeWsClient.send(asciiData);
            } else {
                // 如果 WS 客户端不在线，向 TCP 客户端返回错误
                socket.write('error');
            }
        });

        socket.on('close', () => {
            console.log('TCP 客户端断开连接');
            if (activeSocket === socket) activeSocket = null;
        });

        socket.on('error', (err) => {
            console.error('TCP Socket 错误:', err.message);
        });
    });

    tcpServer.listen(socketPort, host, () => {
        console.log(`TCP 服务器已就绪: ${host}:${socketPort}`);
    });

    // --- WebSocket 服务器 ---
    const wss = new WebSocketServer({ port: wsPort, host: host });

    wss.on('connection', (ws) => {
        console.log('WS 客户端已连接');

        if (activeWsClient) {
            console.log('已有 WS 连接，断开旧连接...');
            activeWsClient.close();
        }
        activeWsClient = ws;

        ws.on('message', (message) => {
            if (activeSocket && activeSocket.writable) {
                activeSocket.write(message);
            } else {
                // 如果 TCP 客户端不在线，向 WS 客户端返回错误
                ws.send('error');
            }
        });

        ws.on('close', () => {
            console.log('WS 客户端断开连接');
            if (activeWsClient === ws) activeWsClient = null;
        });

        ws.on('error', (err) => {
            console.error('WS 客户端错误:', err.message);
        });
    });

    console.log(`WS 服务器已就绪: ${host}:${wsPort}`);

    // 返回服务器实例，以便外部可以关闭它们
    return { tcpServer, wss };
}

export { initBridge };