import UIController from "../../../code/base/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResItem extends UIController {

    onLoad() {
        this.init(this.node, "");
    }

    /**
     * 
     * @param id    0:红  1:和  2:蓝
     * @param type  类型:0>大眼仔    1>小路     2>甲由路    3>珠盘路    4>大路
     */
    public async setResult(id: number, type: number = 0) {
        let icon: cc.Sprite = this.view["lhd_hu"].getComponent(cc.Sprite);
        let res = "";
        switch (type) {
            case 0:
                res = id === 0 ? "lhd_circle_red" : "lhd_circle_blue"
                break;
            case 1:
                res = id === 0 ? "hongdian" : "landian"
                break;
            case 2:
                res = id === 0 ? "lhd_Slash_red" : "lhd_Slash_blue"
                break;
            case 3:
                res = id === 0 ? "lhd_long" : id === 1 ? "lhd_he" : "lhd_hu";
                break;
            case 4:
                res = id === 0 ? "lhd_bigCircle+red" : "lhd_bigCircle+blue";
                break;
        }
        if (res) {
            res = "games/lhd/history/" + res;
            console.log("TAG:::RES=::", res);
            cc.loader.loadRes(res, cc.SpriteFrame, function (err, data) {
                // if (err) {
                //     // r();
                //     return;
                // }
                icon.spriteFrame = data;
                // r();
            }.bind(this));
        }
    }

    start() {

    }

    // update (dt) {}
}
