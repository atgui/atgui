import UIController from "../code/base/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Piaofen extends UIController {

    onLoad() {
        this.init(this.node, "");
    }

    public setResult(gold: number) {
        let goldLabel: cc.Label = this.view["goldLabel"].getComponent(cc.Label);
        goldLabel.string = gold > 0 ? "+" + gold : gold + "";
    }

}
