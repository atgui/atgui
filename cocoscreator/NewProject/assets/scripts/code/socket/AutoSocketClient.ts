import SocketClient from "./SocketClient";
import EventEmitter from "../events/EventEmitter";

/**
 * SocketClient 封装
 * Created by atgui on 2020/2/20
 */
export default class AutoSocketClient {
    public client: SocketClient;
    public events: EventEmitter;
    public isReady: boolean;
    public proxy: any;
    public rpcService: any;
    public url: any;

    public heartBeatInterVal: any;

    constructor() {
        this.client = new SocketClient();
        this.client._enbleHeartBeat = false;
        this.events = new EventEmitter();
        this.isReady = false;
        this.proxy = null;
        this.rpcService = null;
        this.url = null;

        //添加从外面切换回来的事件
        // if (cc && cc.eventManager) {
        //     cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
        //         setTimeout(function () {
        //             self.checkHeartBeatAndReconnect(1000);
        //         }.bind(self), 50);
        //     }.bind(this));
        // }
    }

    public connect(url) {
        if (this.client != null) {
            try {
                this.client._clearSocket();//清除网络事件
            } catch (e) {

            }
        }
        this.url = url;
        this.client._enbleHeartBeat = false;
        this.client._isReconnected = false;
        this.client.addRpc(this.rpcService);
        this.client.startConnectUntilConnected(url);
        this.client.onClose((client) => {
            this.isReady = false;
            this.proxy = null;
            this.events.emit("onClose", client);
            this.client = new SocketClient();
            this.client._enbleHeartBeat = false;
            this.client._isReconnected = false;
            this.stopCheckHeartBeart();//停止心跳检测
            this.connect(this.url);
        });
        this.client._onReady(() => {
            // this.startCheckHeartBeat();//开始心跳检测
            this.isReady = true;
            this.proxy = this.client._proxy;
            this.events.emit("onReady", this.client);
            this.events.offAll("onReady");
        }, this);
    }

    public onClose(cb, taget) {
        //重新连接
        this.events.on("onClose", cb, taget);
    }

    public close() {
        this.client.close();
    }
    public onReady(cb, taget) {
        if (this.isReady) {
            this.client._onReady(cb, taget);
        } else {
            this.events.on("onReady", cb, taget);
        }
    }

    public onReadyState(cb) {
        this.client.onReadyState(cb);
    }

    private addRpc(service) {
        this.rpcService = service;
    }

    public off(cb) {
        this.events.offAllCaller(cb);
    }

    private checkHeartBeatAndReconnect(timeOut) {
        cc.log("进入开始检测阶段");
        var self = this;
        var isConnected = false;
        self.client._onReady(function () {
            self.client._proxy["heartBeat"](function (data) {
                if (data.ok) isConnected = true;
            })
        }, this);
        setTimeout(function () {
            if (isConnected == false && self.isReady == true) {
                self.isReady = false;
                //发送断开连接事件
                self.proxy = null;
                self.stopCheckHeartBeart();
                self.client._clearSocket();
                self.events.emit("onClose", self.client);
                self.client = new SocketClient();
                self.connect(self.url);
            }
        }, timeOut);
    }

    private startCheckHeartBeat() {
        var self = this;
        this.heartBeatInterVal = setInterval(function () {
            self.checkHeartBeatAndReconnect(10000);
        }, 11000);
    }

    private stopCheckHeartBeart() {
        clearInterval(this.heartBeatInterVal);
    }
}