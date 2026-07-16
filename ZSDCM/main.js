import { SetAccPulsHz } from './SetAccPulsHz.js';
import { SetStopHz } from './SetStopHz.js';
import { SetPuls } from './SetPuls.js';
import { SetPulsHz } from './SetPulsHz.js';
import { ZeroSwitch } from './ZeroSwitch.js';
import { SpinStatus } from './SpinStatus.js';
import { Spin } from './Spin.js';

const paramsNum = {
    SetAccPulsHz: 2,
    SetStopHz: 2,
    SetPuls: 2,
    SetPulsHz: 2,
    ZeroSwitch: 1,
    SpinStatus: 1,
    Spin: 2,
};

/**
 * ZSDCM 函数处理不同命令并执行相应的操作
 * 
 * @param {string} cmd - 要执行的命令名称
 * @param {Array} params - 命令所需的参数数组
 * @returns {*} 执行结果
 */
function ZSDCM(cmd, params) {
    // 检查 params 是否为数组
    if (!Array.isArray(params)) {
        console.error('params must be an array');
        return null;
    }

    // 检查命令是否存在
    const requiredParams = paramsNum[cmd];
    if (!requiredParams) {
        console.error(`Unknown command: ${cmd}`);
        return null;
    }

    // 检查参数数量是否在合法范围内 (1 到 requiredParams)
    if (params.length < 1 || params.length > requiredParams) {
        console.error(`Invalid number of parameters for ${cmd}. Expected 1 to ${requiredParams}, got ${params.length}`);
        return null;
    }

    // 根据 cmd 调用相应的函数
    switch (cmd) {
        case 'SetAccPulsHz':
            return SetAccPulsHz(params[0], params[1]);
        case 'SetStopHz':
            return SetStopHz(params[0], params[1]);
        case 'SetPuls':
            return SetPuls(params[0], params[1]);
        case 'SetPulsHz':
            return SetPulsHz(params[0], params[1]);
        case 'ZeroSwitch':
            return ZeroSwitch(params[0]);
        case 'SpinStatus':
            return SpinStatus(params[0]);
        case 'Spin':
            return Spin(params[0], params[1]);
        default:
            console.error(`Unknown command: ${cmd}`);
            return null;
    }
}

/* console.log( ZSDCM('SetAccPulsHz', [0x0a, 100]) )
console.log( ZSDCM('SetStopHz', [0x0a, 100]) )
console.log( ZSDCM('SetPuls', [0x0a, 10000]) )
console.log( ZSDCM('Spin', [0x0a, 1]) ) */

export { ZSDCM };