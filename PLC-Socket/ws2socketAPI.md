# ws2socketAPI

ws socket 双向桥接

## 地址

ws://127.0.0.1:1200

socket 服务器在 127.0.0.1:1100

## start 功能

接收 AutoStart 指令 反馈给 ws client

```json
{
    "cmd": "AutoStart",
    "data": []
}
```

接收 StepStart 指令 反馈给 ws client

```json
{
    "cmd": "StepStart",
    "data": []
}
```

## stop 功能

接收 Stop 指令 反馈给 ws client

```json
{
    "cmd": "Stop",
    "data": []
}
```

接收 EStop 指令 反馈给 ws client

```json
{
    "cmd": "EStop",
    "data": []
}
```

## load 功能

### 发送指令

ws 发送 load 指令

```json
{
    "cmd": "Load",
    "data": []
}
```

### 接收指令

接收 loadSuccess 指令 反馈给 ws client

```json
{
    "cmd": "LoadSuccess",
    "data": []
}
```

- loadNone 指令 反馈给 ws clients

```json
{
    "cmd": "LoadNone",
    "data": []
}
```

## offload 功能

ws 发送 offload 指令

```json
{
    "cmd": "Offload",
    "data": [diameter1, diameter2, length, result]
}
```

接收 offloadSuccess buffer 指令 反馈给 ws client

```json
{
    "cmd": "OffloadSuccess",
    "data": []
}
```

## 转发反馈

- 如果是ws到socket失败

```json
{
    "cmd": "EE",
    "data": []
}
```

- 如果socket到ws失败

返回 sendError buffer 到 socket client

- 如果socket到ws成功

返回 sendSuccess buffer 到 socket client

## 执行/拒绝指令

- 如果执行指令则发送

```json
{
    "cmd": "Accept",
    "data": []
}
```

- 如果拒绝指令则发送

```json
{
    "cmd": "Reject",
    "data": []
}
```
