# API格式

## 服务器地址

ws://localhost:2345

## 发送格式

```json
{
    "cmd": "Cal", //命令
    "id": "0x01", //从机ID
    "data": [参数],
}
```

## 接收格式

```json
{
    "id": "0x01", //从机ID
    "status": "success", //状态 success | error
    "data": [接收buffer转hex字符串],
}
```

## 繁忙回复

```json
{
    "status": "busy",
}
```

## 功能列表

### 1. SetAccPulsHz

用于设置伺服电机加速度频率，单位为Hz。

cmd: "SetAccPulsHz"
data: [加速度频率]

### 2. SetStopHz

用于设置伺服电机停止频率，单位为Hz。

cmd: "SetStopHz"
data: [停止频率]

### 3. SetPuls

用于设置伺服电机脉冲数量。

cmd: "SetPuls"
data: [脉冲数量]

### 4. ZeroSwitch

用于查看是否触发零点开关。

cmd: "ZeroSwitch"
data: []

需要解析返回数据

例如：

0A 03 02 00 [00] 1D 85

方括号中的字段

- 00: 未触发零点开关
- 01: 已触发零点开关

### 5. SpinStatus

用于查看伺服电机正在旋转方向。

cmd: "SpinStatus"
data: []

需要解析返回数据

例如：

0A 03 02 00 [01] DC 45

方括号中的字段

- 00: 停止
- 01: 正转
- 02: 反转

## 6. Spin

用于控制伺服电机旋转。

cmd: "Spin"
data: [旋转方向]

- 0: 停止
- 1: 正转
- 2: 反转

## 7. SetPulsHz

用于设置伺服电机脉冲频率，单位为Hz。

cmd: "SetPulsHz"
data: [脉冲频率]
