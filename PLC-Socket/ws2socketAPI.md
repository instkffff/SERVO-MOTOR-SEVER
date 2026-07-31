# ws2socketAPI

ws socket 双向桥接

## 地址

ws://127.0.0.1:1200

socket 服务器在 127.0.0.1:1100

## load 功能

ws 发送 load 指令

```json
{
    "cmd": "Load",
    "data": []
}
```

接收 loadSuccess buffer 指令 反馈给 ws client

```json
{
    "cmd": "LoadSuccess",
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

## 转发失败

如果是ws到socket失败

```json
{
    "cmd": "EE",
    "data": []
}
```

如果是socket到ws失败

返回 sendError buffer 到 socket client

## 接收到的socket数据使用 crc8VF(buffer) 校验 成功返回 true 失败返回 false
