import UIController from "../../code/base/UIController";
import UIManager from "../../code/base/UIManager";
import LhdGroup from "./draw/LhdGroup";
import ResDraw from "./draw/ResDraw";
import ResItem from "./draw/ResItem";
import LhdManager from "./LhdManager";
import LHDEvent from "./events/LHDEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LhdHistoryTs extends UIController {

    onLoad() {
        this.init(this.node, "");
        console.log("TAG VIEW=", this.view);
        this.view["closeButton"].on(cc.Node.EventType.TOUCH_END, function () {

            this.node.destroy();
        }.bind(this), this);
        this._initRecord();
    }

    private _lhdGroup: LhdGroup;

    public async _initRecord() {
        let daluScrollView = this.view["lhd_room/daluScrollView"].getComponent(cc.ScrollView);
        let xiaoluScrollView = this.view["lhd_room/xiaoluScrollView"].getComponent(cc.ScrollView);
        let dayanzaiScrollView = this.view["lhd_room/dayanzaiScrollView"].getComponent(cc.ScrollView);
        let jiayouluScrollView = this.view["lhd_room/jiayouluScrollView"].getComponent(cc.ScrollView);

        this._lhdGroup = new LhdGroup().setDraw(
            new ResDraw(daluScrollView),
            new ResDraw(dayanzaiScrollView),
            new ResDraw(xiaoluScrollView),
            new ResDraw(jiayouluScrollView),
            6);

        // server.on(LHDEvent.UPDATE_RECORD, this._updateRecord.bind(this), this);


        let records = LhdManager.instance.record;
        for (let i: number = 0; i < records.length; i++) {
            let type = records[i];
            await this._loadItem(type);
            await this._lhdGroup.setResult(type);
        }
    }

    private _updateRecord(type) {
        this._loadItem(type);
        this._lhdGroup.setResult(type);
    }

    private async _loadItem(id: number) {
        let rId: number = id;
        console.log("TAG:::IDDD:", rId);
        let scrollView: cc.ScrollView = this.view["lhd_room/zpScrollView"].getComponent(cc.ScrollView);
        return new Promise((r, j) => {
            UIManager.loadPrefab("prefab/games/lhd/zpItem", async function (res) {
                let itemNode = cc.instantiate(res);
                scrollView.content.addChild(itemNode);

                let zpItem: ResItem = itemNode.getComponent(ResItem);
                await zpItem.setResult(rId, 3);
                r();
            }.bind(this), this);
        });

    }

    onDestroy() {
        console.log("TAG 关闭");
        // LhdManager.instance.server.offAll(LHDEvent.UPDATE_RECORD);
    }

}