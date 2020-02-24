import SpineManager from "../code/manager/SpineManager";
import SocketManager from "../code/socket/SocketManager";
import { Socket } from "dgram";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HallTs extends cc.Component {

    // @property(cc.ScrollView)
    // scrollView: cc.ScrollView;

    // @property(cc.Prefab)
    // item: cc.Prefab;

    onLoad() {
        // EventManager.instance.on(GameEventIds.HallGameListSuccessEvent, this, this.onGetHallList);
        // console.log(this);
        // this.scrollView = this.getComponent(cc.ScrollView);
        // console.log("Load:",this.scrollView,this.item);
        console.log("Hall onLoad...");
        SocketManager.instance.onReady(function () {
            console.log("TAG onReady。。。");
            SocketManager.instance.proxy.gameList(function (data) {
                console.log("TAG HALL:", data);
            }.bind(this));
        }.bind(this), this);
    }

    // onGetHallList(cmd: any) {
    //     // console.log("TAG 大厅游戏列表ID:", cmd, EventManager.instance.event);
    //     for (let i: number = 0; i < 10; i++) {
    //         let item: cc.Node = cc.instantiate(this.item);
    //         item['data'] = i;
    //         item.on(cc.Node.EventType.TOUCH_START, function (event) {
    //             console.log(event);
    //         }.bind(this), this);
    //         this.scrollView.content.addChild(item);
    //         let nodeNew = new cc.Node();
    //         item.addChild(nodeNew);
    //         SpineManager.instance.loadSpine("hall/spines/DT_3Dbuyu", nodeNew);
    //     }
    //     this.scrollView.scrollToLeft();
    // }

    start() {
    }

    // update (dt) {}
}
