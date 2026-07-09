# API格式

## 发送格式

```json
{
    "cmd": "Cal",
    "id": "0x01",
    "data": [],
}
```

## 接收格式

```json
{
    "id": "0x01",
    "status": "success",
    "data": [],
}
```

## 繁忙回复

```json
{
    "status": "busy",
}
```

## 流程

1. 接收 websocket 消息
2. 将总线置忙
3. event.emit('send', data)
4. 拉起 event.on('receive', (data) => {
    console.log(data)
})
5. 将 data 发送至 websocket client
6. 将总线置闲
7. event.off('receive')
