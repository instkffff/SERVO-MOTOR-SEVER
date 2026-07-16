import { dataBack } from '../../tool/dataBack.js'

import { VFBack } from '../../tool/VFBack.js'

import { SetAccPulsHz } from '../SetAccPulsHz.js';
import { SetStopHz } from '../SetStopHz.js';
import { SetPuls } from '../SetPuls.js';
import { SetPulsHz } from '../SetPulsHz.js';
import { ZeroSwitch } from '../ZeroSwitch.js';
import { SpinStatus } from '../SpinStatus.js';
import { Spin } from '../Spin.js';


function compareData(dataBuffer, dataString) {
    if (dataBuffer.toString('hex') === dataString) {
        console.log('Data Match')
    } else {
        console.log('Data Not Match')
    }
}

const SetAccPulsHzFrame = SetAccPulsHz(0x0a, 100);
compareData(SetAccPulsHzFrame, '0a0600480064094c')

const SetStopHzFrame = SetStopHz(0x0a, 100);
compareData(SetStopHzFrame, '0a0600490064588c')

const SetPulsFrame = SetPuls(0x0a, 10000);
compareData(SetPulsFrame, '0a1000be00020400002710464f')

const SetPulsHzFrame = SetPulsHz(0x0a, 50);
compareData(SetPulsHzFrame, '0a10004600020400000032d344')

const ZeroSwitchFrame = ZeroSwitch(0x0a);
compareData(ZeroSwitchFrame, '0a03000900015573')

const SpinStatusFrame = SpinStatus(0x0a);
compareData(SpinStatusFrame, '0a03000000018571')

const SpinFrame = Spin(0x0a, 1);
compareData(SpinFrame, '0a0600530001b960')

/* 0A 06 00 48 00 64 09 4C  */
const SetAccPulsHzBack = Buffer.from([0x0a, 0x06, 0x00, 0x48, 0x00, 0x64, 0x09, 0x4C])
console.log(VFBack(SetAccPulsHzBack, dataBack.SetAccPulsHz))

/* 0A 06 00 49 00 64 58 8C  */
const SetStopHzBack = Buffer.from([0x0a, 0x06, 0x00, 0x49, 0x00, 0x64, 0x58, 0x8C])
console.log(VFBack(SetStopHzBack, dataBack.SetStopHz))

/* 0A 10 00 BE 00 02 20 97  */
const SetPulsBack = Buffer.from([0x0a, 0x10, 0x00, 0xbe, 0x00, 0x02, 0x20, 0x97])
console.log(VFBack(SetPulsBack, dataBack.SetPuls))

/* 0A 10 00 46 00 02 A1 66  */
const SetPulsHzBack = Buffer.from([0x0a, 0x10, 0x00, 0x46, 0x00, 0x02, 0xa1, 0x66])
console.log(VFBack(SetPulsHzBack, dataBack.SetPulsHz))

/* 0A 03 02 00 00 1D 85  */
const ZeroSwitchBack = Buffer.from([0x0a, 0x03, 0x02, 0x00, 0x00, 0x1d, 0x85])
console.log(VFBack(ZeroSwitchBack, dataBack.ZeroSwitch))

/* 0A 03 02 00 00 1D 85  */
const SpinStatusBack = Buffer.from([0x0a, 0x03, 0x02, 0x00, 0x00, 0x1d, 0x85])
console.log(VFBack(SpinStatusBack, dataBack.SpinStatus))

/* 0A 06 00 53 00 01 B9 60  */
const SpinBack = Buffer.from([0x0a, 0x06, 0x00, 0x53, 0x00, 0x01, 0xb9, 0x60])
console.log(VFBack(SpinBack, dataBack.Spin))
