import IDraw from "./IDraw";
import LhdRecordModel from "../models/LhdRecordModel";
import UIManager from "../../../code/base/UIManager";
import ResItem from "./ResItem";


export default class ResDraw implements IDraw {
    private _node: cc.ScrollView;
    constructor(node: cc.ScrollView) {
        this._node = node;
    }

    private _prefabs: Map<string, any> = new Map();
    private _endNode: cc.Node;

    async draw(row: number, col: number, result: LhdRecordModel, t: number) {
        let __self = this;
        return new Promise((r, j) => {
            console.log("TAGSS 画对应资源:", result, t);
            if (result.isHe > 0 && result.type > -1) {//是和
                //获取 node 最后一个节点,更新label
                // let nodeValue = this._node.content.children[this._node.content.childrenCount - 1]
                if (__self._endNode) {
                    let label = this._endNode.getChildByName("heLabel").getComponent(cc.Label);
                    label.string = result.isHe + "";
                    r();
                    return;
                }
            }
            let scrollView: cc.ScrollView = this._node;
            let resUrl = this._getItemRes(t);
            let v2 = this._getPosition(col, row, t);
            if (this._prefabs[resUrl]) {
                let itemNode: cc.Node = cc.instantiate(this._prefabs[resUrl]);
                scrollView.content.addChild(itemNode);
                __self._endNode = itemNode;
                itemNode.position = v2;
                let item: ResItem = itemNode.getComponent(ResItem);
                item.setResult(result.type, t);

                if (result.isHe > 0) {
                    let label = itemNode.getChildByName("heLabel").getComponent(cc.Label);
                    label.string = result.isHe + "";
                }
                r();
            } else {
                UIManager.loadPrefab(resUrl, function (res) {
                    this._prefabs[resUrl] = res;
                    let itemNode: cc.Node = cc.instantiate(res);
                    scrollView.content.addChild(itemNode);
                    itemNode.position = v2;
                    __self._endNode = itemNode;
                    let item: ResItem = itemNode.getComponent(ResItem);
                    item.setResult(result.type, t);
                    if (result.isHe > 0) {
                        let label = itemNode.getChildByName("heLabel").getComponent(cc.Label);
                        label.string = result.isHe + "";
                    }
                    r();
                }.bind(this), this);
            }
        });

    }


    private _getPosition(col: number, row: number, type: number): cc.Vec2 {
        let v2;
        switch (type) {
            case 0:
            case 1:
            case 2:
                v2 = new cc.Vec2((col * 19), (row * -17));
                break;
            case 3:
                break;
            case 4:
                v2 = new cc.Vec2((col * 39.5), (row * -33.5) - 20);
                break;
        }
        console.log("TAG::POS=", type, v2);
        return v2;
    }

    private _getItemRes(type: number): string {
        if (type == undefined) return "";
        let res = "";
        switch (type) {
            case 0:
            case 1:
            case 2:
                res = "xiaoluItem";
                break;
            case 3:
                break;
            case 4:
                res = "daluItem";
                break;
        }
        return "prefab/games/lhd/" + res;
    }

}