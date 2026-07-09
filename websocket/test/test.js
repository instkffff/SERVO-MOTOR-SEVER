import { createServer } from 'http';
import { createWebSocketAPI, emitResponse, getBusyState, bus } from '../API.js';

const server = createServer();
createWebSocketAPI(server);

// 监听发送事件 → 转发给底层硬件
bus.on('send', (data) => {
  console.log('发送到硬件:', data);
  // 模拟返回
  setTimeout(() => emitResponse({ status: 'success', data: [1, 2, 3] }), 5000);
});

server.listen(2345);