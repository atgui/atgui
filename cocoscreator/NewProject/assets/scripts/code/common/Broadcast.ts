import ActionManager from "./ActionManager";
import HandlerModel from "./HandlerModel";

export default function Broadcast(actionId: number, cls: any) {
    return function (target: any, propertyName: string) {
        // 解析@Action标签,将ActionId与proto类型对应
        console.log(cls);
        console.log("TAG ", actionId, cls, target, propertyName);
        ActionManager.instance.actionTypes[actionId] = cls;

        console.log("TAG：",ActionManager.instance.actionTypes);

        if (!ActionManager.instance.handlers[actionId]) {
            ActionManager.instance.handlers[actionId] = new Array();
        }
        
        ActionManager.instance.handlers[actionId].push(new HandlerModel(actionId, cls, target, propertyName));
        // if(cls)
        //     Singleton.instance<ActionManager>(ActionManager).actionTypes[actionId]=cls;
        // if(!Singleton.instance<ActionManager>(ActionManager).actionHandlers[actionId])
        // Singleton.instance<ActionManager>(ActionManager).actionHandlers[actionId] = new Array();
        // Singleton.instance<ActionManager>(ActionManager).actionHandlers[actionId].push(Laya.Handler.create(target,target[propertyName],null,false));
    }
}