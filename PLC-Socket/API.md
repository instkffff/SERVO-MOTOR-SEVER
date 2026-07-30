# PLC-Socket API

## 通讯方式

TCP-SOCKET ASCII

## 上料API

### 上料ready

1000

### 上料完毕

plc返回 1100

## 下料API

### 下料ready

- 2000 检测结果正常
- 2001 欠缺打磨
- 2002 缺少配件

### 下料完毕

plc返回 2100
