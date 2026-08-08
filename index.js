import { initSerialApp } from './Serial/main.js'

import { createServer } from 'http';
import { createWebSocketAPI, emitResponse, getBusyState, bus } from './websocket/API.js';

import { initBridge } from './PLC-Socket/socketWs.js';

import { initClientBridge } from './PLC-Socket/socketClientWs.js';

import { PLC } from './Setting.js';



const serial = await initSerialApp()
serial.setTimeout(1000)

const server = createServer();
createWebSocketAPI(server);

server.listen(2345);

if ( PLC.type === 'server' ){
    initClientBridge();
} else if ( PLC.type === 'client'){
    initBridge();
}