/**
 * 事件
 * Created by atgui on 2020/2/20
 */
export default class EventEmitter {
    public events: Map<string, Array<Event>> = new Map();

    //监听事件
    public on(type: string, callback: Function, taget: any) {
        if (!this.events[type]) this.events[type] = new Array<Event>();
        let event = new Event(taget, callback);
        this.events[type].push(event);
    }

    /**
     * 派发事件
     * @param type 事件名称
     */
    public emit(type: string, ...arg) {
        var args = Array.prototype.slice.call(arguments, 1, arguments.length);
        let arr: Array<Event> = this.events[type];
        console.log(args, arr);
        if (!arr) return;
        for (let i: number = 0; i < arr.length; i++) {
            var value: Event = arr[i];
            value.callback.apply(value.taget, args);
        }
    }

    /**
     * 删除所有该名称的事件方法
     * @param type 事件名称
     */
    public offAll(type: string) {
        if (this.events[type]) {
            let evt: Event = this.events[type];
            delete evt.taget;
            delete evt.callback;
        }
        delete this.events[type];
    }

    /**
     * 移除事件监听
     * @param type      事件名
     * @param callback  回调方法
     * @param taget     调用对象
     */
    public off(type: string, callback: Function, taget: any) {
        let arr: Array<Event> = this.events[type];
        if (!arr) return;
        let flag: boolean = true;
        let i: number = arr.length - 1;
        while (flag) {
            let event: Event = arr[i];
            if (event.callback === callback && taget === event.taget) {
                arr.splice(i, 1);
            }
            i--;
            if (i < 0) {
                flag = false;
            }
        }
        if (arr.length <= 0) {
            delete this.events[type];
        }
    }
    /**
     * 删除该对象上的所有事件
     * @param taget 要删除事件的对象
     */
    public offAllCaller(taget: any) {
        for (let key in this.events) {
            let evs = this.events[key];
            for (let i: number = evs.length - 1; i >= 0; i--) {
                let event: Event = evs[i];
                if (event.taget === taget) {
                    this.off(key, event.callback, event.taget);
                }
            }

        }
    }

}
class Event {
    constructor(taget: any, call: Function) {
        this.taget = taget;
        this.callback = call;
    }
    taget: any;
    callback: Function;
}