export default class HandlerModel {
    constructor(aId: number, cls: any, tag: any, pName: any) {
        this.actionId = aId;
        this.cls = cls;
        this.target = tag;
        this.propertyName = pName;
        this.target[pName].bind(this.target);
    }
    actionId: number;
    cls: any;
    target: any;
    propertyName: any;
}