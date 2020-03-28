import { INetworkTips } from "./INetInterface";

export default class NetTips implements INetworkTips {
    private getLabel(): cc.Label {
        let label = null;
        let node = cc.director.getScene().getChildByName("@net_tip_label");
        if (node) {
            label = node.getComponent(cc.Label);
        } else {
            node = new cc.Node("@net_tip_label");
            label = node.addComponent(cc.Label);
            node.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        }
        return label;
    }

    connectTips(isShow: boolean): void {
        // if (isShow) {
        //     this.getLabel().string = "Connecting";
        //     this.getLabel().node.active = true;
        // } else {
        //     this.getLabel().node.active = false;
        // }
        console.log("Connecting...");
    }

    reconnectTips(isShow: boolean): void {
        // if (isShow) {
        //     this.getLabel().string = "Reconnecting";
        //     this.getLabel().node.active = true;
        // } else {
        //     this.getLabel().node.active = false;
        // }
        console.log("Reconnecting...");
    }

    requestTips(isShow: boolean): void {
        if (isShow) {
            this.getLabel().string = "";
            this.getLabel().node.active = true;
        } else {
            this.getLabel().node.active = false;
        }
        console.log("Requesting...");
    }
}