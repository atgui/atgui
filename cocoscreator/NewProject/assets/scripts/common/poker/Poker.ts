import UIController from "../../code/base/UIController";
import PokerModel from "./PokeModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Poker extends UIController {

    private _pokerModel: PokerModel;

    onLoad() {
        this._pokerModel = new PokerModel();
        this.init(this.node, "");
    }

    //显示背景
    public showBg() {
        this.view["valueSprite"].active = false;
        this.view["colorSprite"].active = false;
        this.view["oSprite"].active = false;

        this.view["bg1"].active = true;
        this.node.scaleX = -0.5;
    }

    public async setValue(value: number) {
        this._pokerModel.setId(value);
        return new Promise((r, j) => {
            cc.tween(this.node).to(0.5, { scaleX: 0 }).call(() => {
                this.view["valueSprite"].active = true;
                this.view["colorSprite"].active = true;
                this.view["oSprite"].active = true;
                this.view["bg1"].active = false;
                let valueSprite: cc.Sprite = this.view["valueSprite"].getComponent(cc.Sprite);
                cc.loader.loadRes(this._getRes(), cc.SpriteFrame, (err, data) => {
                    if (err) return;
                    valueSprite.spriteFrame = data;
                });
                let colorSprite: cc.Sprite = this.view["colorSprite"].getComponent(cc.Sprite);
                cc.loader.loadRes(this._getColorRes(), cc.SpriteFrame, (err, data) => {
                    if (err) return;
                    colorSprite.spriteFrame = data;
                });

                let oSprite: cc.Sprite = this.view["oSprite"].getComponent(cc.Sprite);
                cc.loader.loadRes(this._getColorORes(), cc.SpriteFrame, (err, data) => {
                    if (err) return;
                    oSprite.spriteFrame = data;
                });
            }).to(0.5, { scaleX: 0.5 }).call(() => {
                r();
            }).start();
        });
    }

    //获取颜色值资源
    private _getRes() {
        let color = this._pokerModel.getColor();
        let value = this._pokerModel.getValue();
        let colorRes = value == 1 ? "A" : value == 11 ? "J" : value == 12 ? "Q" : value == 13 ? "K" : value + "";
        if (color == 16 || color == 48) {
            colorRes += "_1";
        }
        return "common/pokers/" + colorRes;
    }

    //获取右下角资源
    private _getColorRes(): string {
        let color = this._pokerModel.getColor();
        let colorRes = "";
        switch (color) {
            case 0:
                colorRes = "fangkuai";
                break;
            case 16:
                colorRes = "meihua";
                break;
            case 32:
                colorRes = "hongtao";
                break;
            case 48:
                colorRes = "heitao";
                break;
        }
        return "common/pokers/" + colorRes;
    }

    private _getColorORes() {
        if (this._pokerModel.getValue() > 10) {
            return "common/pokers/J_1_icon"
        } else {
            return this._getColorRes();
        }
    }

    onDestroy() {
        this._pokerModel = null;
    }
}
