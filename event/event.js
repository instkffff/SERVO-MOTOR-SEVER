// 创建一个新的 EventEmitter 实例
function createEventEmitter() {
    let events = {}; // 移到这里，每个实例拥有独立的事件存储

    return {
        // 监听事件
        on: function (eventName, callback) {
            if (!events[eventName]) {
                events[eventName] = [];
            }
            events[eventName].push(callback);
            return this; // 支持链式调用
        },

        // 只监听一次事件
        once: function (eventName, callback) {
            const onceWrapper = (...args) => {
                this.off(eventName, onceWrapper);
                callback(...args);
            };
            return this.on(eventName, onceWrapper);
        },

        // 发射事件
        emit: function (eventName, ...args) {
            if (events[eventName]) {
                events[eventName].forEach(callback => callback(...args));
            }
            return this; // 支持链式调用
        },

        // 移除事件监听
        off: function (eventName, callback) {
            if (!events[eventName]) return this;

            if (!callback) {
                // 如果没有提供回调函数，则移除该事件的所有监听器
                delete events[eventName];
            } else {
                // 移除指定的回调函数
                events[eventName] = events[eventName].filter(cb => cb !== callback);
            }
            return this;
        },

        // 移除所有事件监听
        removeAllListeners: function () {
            events = {};
            return this;
        }
    };
}

export { createEventEmitter }
