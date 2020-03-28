import UIManager from "../code/base/UIManager";
import UIController from "../code/base/UIController";
import Chouma from "./Chouma";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChipList extends UIController {


    onLoad() {
        this.init(this.node, "");
        console.log("TAG CHIP_LIST:::", this.view);
    }

    public curValue: number = 0;

    public async setResult(values: Array<number>) {
        let cmPrefab: cc.Prefab;
        this.curValue = values[0];
        UIManager.loadPrefab("prefab/common/chouma", function (res) {
            cmPrefab = res;
            for (let i: number = 0; i < values.length; i++) {
                let cmNode = cc.instantiate(cmPrefab);
                this.node.addChild(cmNode);

                let chouma: Chouma = cmNode.getComponent(Chouma);
                chouma.setResult(values[i]);

                cmNode.on(cc.Node.EventType.TOUCH_END, function (e: cc.Event) {
                    let cm: Chouma = e.target.getComponent(Chouma);
                    console.log("TAG 点击筹码", cm.value);
                    this.curValue = cm.value;
                }.bind(this), this);
            }
        }.bind(this), this);
    }

    start() {

    }

    // update (dt) {}
}
