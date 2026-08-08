const setting = {
    COM: 'COM1',
    BAUDRATE: 115200,
    TIMEOUT: 1000,
    DATA: 8,
    PARITY: 'none',
    STOP: 1
}

const side = {
    COM: 'COM10',
    BAUDRATE: 9600,
    TIMEOUT: 1000,
    DATA: 8,
    PARITY: 'none',
    STOP: 1
}

/* const PLC = {
    type: 'server',
    host: '192.168.0.21',
    port: 2090
} */

const PLC = {
    type: 'server',
    host: 'localhost',
    port: 2090
}

export { setting, side, PLC }
