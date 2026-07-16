const dataBack = {
    Cal: '00060001',
    Mv: '00fc0002',
    MvSetting: '00f10003',
    Stop: '00fe9800',
    Zero: '009a0200',
    ZeroSetting: '004c0009',
    ZeroStatus: '020003',
    EStatus: ['020082', '020083', '020002', '020003'],
    
    /* 0A 03 02 00 01 DC 45  */
    SpinStatus: ['020000', '020001', '020002'],
    /* 0A 03 02 00 00 1D 85 */
    ZeroSwitch: ['020000', '020001'],
    SetAccPulsHz: {Length: 8},
    SetStopHz: {Length: 8},
    SetPuls: {Length: 8},
    SetPulsHz: {Length: 8},
    Spin: {Length: 8},
}

export { dataBack }
