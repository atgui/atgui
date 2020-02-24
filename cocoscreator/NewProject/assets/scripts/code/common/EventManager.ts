import GameEvent from "./GameEvent";

export default class EventManager {

    public static instance: EventManager = new EventManager();

    private _event: Map<string, Array<Event>> = new Map();

    public get event() {
        return this._event;
    }

    constructor() {
        this._event = new Map();
    }

    public on(type: string, caller: any, func: Function) {
        if (!this._event[type]) {
            this._event[type] = new Array();
        }
        let evt: GameEvent = new GameEvent();
        evt.func = func;
        evt.taget = caller;
        evt.type = type;
        this._event[type].push(evt);
    }

    public emit(type: string, args?: any) {
        let events = this._event[type];
        if (events) {
            for (let i: number = 0; i < events.length; i++) {
                let event: GameEvent = events[i];
                event.func.apply(event.taget, [args]);
            }
        }
    }

    public off(type: string, taget: any) {
        let events: Array<GameEvent> = this._event[type];
        if (events) {
            let flag = true;
            let i = events.length - 1;
            while (flag) {
                let event: GameEvent = events[i];
                if (event.taget == taget) {
                    console.log("TAG 删除事件:", type)
                    this._event[type].splice(i, 1);
                }
                i--;
                flag = i >= 0;
            }
            delete this._event[type];
        }
    }

    public offAllCaller(taget: any) {
        for (let key in this._event) {
            this.off(key, taget);
        }
    }

}
