import { Cal } from '../Cal.js'
import { Mv } from '../Mv.js'
import { MvSetting } from '../MvSetting.js'
import { Stop } from '../Stop.js'
import { Zero } from '../Zero.js'
import { ZeroSetting } from '../ZeroSetting.js'
import { ZeroStatus } from '../ZeroStatus.js'

import { dataBack } from '../../tool/dataBack.js'

import { VFBack } from '../../tool/VFBack.js'


function compareData(dataBuffer, dataString) {
    if (dataBuffer.toString('hex') === dataString) {
        console.log('Data Match')
    } else {
        console.log('Data Not Match')
    }
}

const CalFrame = Cal(0x01);
compareData(CalFrame, '010600060001a80b')

const MvFrame = Mv(0x01, 1000)
compareData(MvFrame, '011000fc000204000003e8fc00')

const MvSettingFrame = MvSetting(0x01, 200, 1200); 
compareData(MvSettingFrame, '011000f100030600c804b001005211')

const StopFrame = Stop(0x01); 
compareData(StopFrame, '010600fe980083fa')

const ZeroFrame = Zero(0x01)
compareData(ZeroFrame, '0106009a0200a885')

const zeroSettFrame = ZeroSetting(0x01, 100, 10000, 300, 800, 60); 
compareData(zeroSettFrame, '0110004c000912ae000201006400002710012c0320003c00009907')

const ZeroStatusFrame = ZeroStatus(0x01)
compareData(ZeroStatusFrame, '0103003b0001f5c7')

const CalBack = Buffer.from([0x01, 0x06, 0x00, 0x06, 0x00, 0x01, 0xA8, 0x0B])
console.log(VFBack(CalBack, dataBack.Cal))

const MvBack = Buffer.from([0x01, 0x10, 0x00, 0xFC, 0x00, 0x02, 0x81, 0xF8])
console.log(VFBack(MvBack, dataBack.Mv))

const MvSettingBack = Buffer.from([0x01, 0x10, 0x00, 0xF1, 0x00, 0x03, 0xD1, 0xFB])
console.log(VFBack(MvSettingBack, dataBack.MvSetting))

const StopBack = Buffer.from([0x01, 0x06, 0x00, 0xFE, 0x98, 0x00, 0x83, 0xFA])
console.log(VFBack(StopBack, dataBack.Stop))

const ZeroBack = Buffer.from([0x01, 0x06, 0x00, 0x9A, 0x02, 0x00, 0xA8, 0x85])
console.log(VFBack(ZeroBack, dataBack.Zero))

const ZeroSettingBack = Buffer.from([0x01, 0x10, 0x00, 0x4C, 0x00, 0x09, 0xC1, 0xD8])
console.log(VFBack(ZeroSettingBack, dataBack.ZeroSetting))

const ZeroStatusBack = Buffer.from([0x01, 0x03, 0x02, 0x00, 0x03, 0xF8, 0x45])
console.log(VFBack(ZeroStatusBack, dataBack.ZeroStatus))

const EStatusBack = Buffer.from([0x01, 0x03, 0x02, 0x00, 0x83, 0xF9, 0xE5])
console.log(VFBack(EStatusBack, dataBack.EStatus))