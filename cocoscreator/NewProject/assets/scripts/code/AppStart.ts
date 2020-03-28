import { SocketNode } from "./network/SocketNode";
import DebugServer from "./network/debug/DebugServer";
import { DefStringProtocol } from "./network/INetInterface";
import NetTips from "./network/NetTips";
import SocketManager from "./network/SocketManager";
import Socket from "./network/Socket";

const { ccclass, property } = cc._decorator;


// 全局初始化
@ccclass
export default class AppStart extends cc.Component {
    isDebug: boolean = true;

    onLoad() {
        console.log("TAG Appstart...");
        let socketNode = new SocketNode();
        socketNode.init(this.isDebug ? new DebugServer() : new Socket(), new DefStringProtocol(), new NetTips());
        SocketManager.instance.setNetNode(socketNode);

        // socketNode.addResponeHandler(1000001, function (data) {
        //     console.log("TAG 收到服务器消息了:", data);
        // }.bind(this), this);

        SocketManager.instance.connect({ url: "ws://192.168.3.108:36502/ifc/user" });

        // let obj = new Object();
        // obj["cmd"] = 1000001;
        // obj["username"] = "atgui";
        // obj["password"] = "123456";
        // SocketManager.instance.send(JSON.stringify(obj));
    }
}