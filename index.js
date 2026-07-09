import { initSerialApp } from './Serial/main.js'

import { createServer } from 'http';
import { createWebSocketAPI, emitResponse, getBusyState, bus } from './websocket/API.js';

const serial = await initSerialApp()

const server = createServer();
createWebSocketAPI(server);

server.listen(2345);