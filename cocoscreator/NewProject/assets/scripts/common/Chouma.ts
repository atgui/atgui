import UIController from "../code/base/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Chouma extends UIController {


    onLoad() {
        this.init(this.node, "");
        let label: cc.Label = this.view["chipLabel"].getComponent(cc.Label);
        label.string = "";

        // this.node.on(cc.Node.EventType.TOUCH_END, function (e: cc.Event) {
        //     let cm: Chouma = e.target.getComponent(Chouma);
        //     console.log("TAG 点击筹码", cm.value);
        // }.bind(this), this);
    }

    public value: number = 0;

    public setResult(value: number) {
        this.value = value;
        let label: cc.Label = this.view["chipLabel"].getComponent(cc.Label);
        label.string = value + "";
    }

    start() {

    }

    // update (dt) {}
}
