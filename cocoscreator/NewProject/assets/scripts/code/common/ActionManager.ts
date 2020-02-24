import HandlerModel from "./HandlerModel";

export default class ActionManager {
    private static _instance: ActionManager;
    public static get instance(): ActionManager {
        if (!this._instance) {
            this._instance = new ActionManager();
        }
        return this._instance;
    }

    public handlers: Map<number, Array<HandlerModel>> = new Map();
    public actions: Map<number, Array<HandlerModel>> = new Map();
    public actionTypes: any = new Object();

    public invokeMethod(actionId: number, res: any) {
        let handlers: Array<HandlerModel> = this.handlers[actionId];
        if (!handlers) return;

        for (let i = 0; i < handlers.length; i++) {
            // 默认绑定得原型对象,将caller指定到当前对象
            console.log("TAG 返回：", handlers[i]);
            handlers[i].target[handlers[i].propertyName].call(handlers[i].target, res.data);
            // let caller =handlers[i].target.node.getComponent(handlers[i].target.constructor);
            // let caller = Laya.stage.getComponent(handlers[i].caller.constructor);
            // if(!caller) continue;
            // handlers[i].method.apply(caller,[response]);
        }
    }

    public invokeMethodError(actionId: number, res: any) {
        let handlers: Array<HandlerModel> = this.handlers[actionId];
        if (!handlers) return;

        for (let i = 0; i < handlers.length; i++) {
            // 默认绑定得原型对象,将caller指定到当前对象            
            handlers[i].target[handlers[i].propertyName].apply(handlers[i].target, [res.data]);
            // let caller = Laya.stage.getComponent(handlers[i].caller.constructor);
            // if(!caller) continue;
            // handlers[i].method.apply(caller,[response]);
        }
    }
}