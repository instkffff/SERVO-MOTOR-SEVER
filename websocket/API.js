import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

// 状态管理
let isBusy = false;
const bus = new EventEmitter();

/**
 * 创建 WebSocket API 服务
 */
function createWebSocketAPI(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('[WebSocket] 客户端已连接');

        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw.toString());

                // 总线繁忙 → 直接回复 busy
                if (isBusy) {
                    ws.send(JSON.stringify({ status: 'busy' }));
                    return;
                }

                // 总线置忙
                isBusy = true;

                const sendData = {
                    cmd: msg.cmd,
                    id: msg.id ?? `0x${Date.now().toString(16).slice(-2)}`,
                    data: msg.data ?? [],
                };

                // 监听接收事件 — status 也由 emit 传入
                const onReceive = (receiveData) => {
                    const status = receiveData.status;
                    const payload = receiveData.data;

                    ws.send(JSON.stringify({
                        id: sendData.id,
                        status,
                        data: payload,
                    }));
                    isBusy = false;
                    bus.off('receive', onReceive);
                };
                bus.on('receive', onReceive);

                // 触发发送事件（供外部监听，转发给硬件）
                bus.emit('send', sendData);

            } catch (err) {
                console.error('[WebSocket] 消息解析失败:', err);
                isBusy = false;
                ws.send(JSON.stringify({
                    status: 'error',
                    data: { message: '消息格式错误' },
                }));
            }
        });


        ws.on('close', () => {
            console.log('[WebSocket] 客户端已断开');
        });

        ws.on('error', (err) => {
            console.error('[WebSocket] 连接错误:', err);
        });
    });

    return wss;
}

/**
 * 供外部调用：注入底层响应数据
 */
function emitResponse(data) {
    bus.emit('receive', data);
}

/**
 * 获取当前总线状态
 */
function getBusyState() {
    return isBusy;
}

export { createWebSocketAPI, emitResponse, getBusyState, bus }