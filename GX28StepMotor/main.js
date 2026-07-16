import { Cal } from './Cal.js'
import { Mv } from './Mv.js'
import { MvSetting } from './MvSetting.js'
import { Stop } from './Stop.js'
import { Zero } from './Zero.js'
import { ZeroSetting } from './ZeroSetting.js'
import { ZeroStatus } from './ZeroStatus.js'
import { EStatus } from './EStatus.js'


/**
 * GX28函数处理不同命令并执行相应的操作
 * 
 * @param {string} cmd - 要执行的命令名称，如'Cal', 'Mv', 'Stop'等
 * @param {Array} params - 命令所需的参数数组
 * @returns {*} 根据不同命令返回相应的执行结果，如果命令无效或参数错误则返回null
 * 
 * @example
 * // 示例调用
 * GX28('Cal', [1]);    // 执行校准操作
 * GX28('Mv', [1, 2]); // 执行移动操作
 * 
 * @throws {Error} 当params不是数组时会抛出错误
 * @throws {Error} 当命令不存在时会抛出错误
 * @throws {Error} 当参数数量不符合要求时会抛出错误
 */
function GX28(cmd, params) {
    // 检查params是否为数组
    if (!Array.isArray(params)) {
        console.error('params must be an array');
        return null;
    }

    // 检查params数量是否足够
    const requiredParams = paramsNum[cmd];
    if (!requiredParams) {
        console.error(`Unknown command: ${cmd}`);
        return null;
    }

    if (params.length < 1 || params.length > requiredParams) {
        console.error(`Invalid number of parameters for ${cmd}. Expected 1 to ${requiredParams}, got ${params.length}`);
        return null;
    }

    // 根据cmd调用相应的函数
    switch (cmd) {
        case 'Cal':
            return Cal(params[0]);
            break;
        case 'Mv':
            return Mv(params[0], params[1]);
            break;
        case 'MvSetting':
            return MvSetting(params[0], params[1], params[2]);
            break;
        case 'Stop':
            return Stop(params[0]);
            break;
        case 'Zero':
            return Zero(params[0]);
            break;
        case 'ZeroSetting':
            return ZeroSetting(params[0], params[1], params[2], params[3], params[4], params[5]);
            break;
        case 'ZeroStatus':
            return ZeroStatus(params[0]);
            break;
        case 'EStatus':
            return EStatus(params[0]);
            break;
        default:
            console.error(`Unknown command: ${cmd}`);
    }
}

const paramsNum = {
    Cal: 1,
    Mv: 2,
    MvSetting: 3,
    Stop: 1,
    Zero: 1,
    ZeroSetting: 6,
    ZeroStatus: 1,
    EStatus: 1,
};

/* console.log( GX28('Cal', [0x01]) )
console.log( GX28('Mv', [0x01, 3000]) )
console.log( GX28('Mv', [0x01, 3000, "abc"]) )
console.log( GX28('Mvsd', [0x01, 3000]) ) */

export { GX28 }