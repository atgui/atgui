export default function Action(actionId: number, type: Function) {
    return function (target: any, propertyName: string) {
        // 解析@Action标签,将ActionId与proto类型对应
        // Singleton.instance<ActionManager>(ActionManager).actionTypes[actionId] = type;
        console.log("TAG ", actionId, type, target, propertyName);
    }
}