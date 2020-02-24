var MessagePack = require("msgpack-lite");
var Buffer = require("buffer/").Buffer;
import EventEmitter from "../events/EventEmitter";
import Utils from "../../common/Utils";

/**
 * WS 封装
 * Created by atgui on 2020/2/20
 */
export default class SocketClient {
    public _client = null;
    public _url = null;
    public _rpc = {};
    public _proxy = {};//clientProxy
    public _proxyDes = null;
    public _serverCb = {};
    public _isReady = false;
    public _readyCb = [];
    public _describe = null;
    public _events = new EventEmitter();
    public _cbTimeOut = 100000;//默认15秒就算超时了，然后通知回调函数{ok:false}
    public _cbInterval = null;
    public _isReconnected = true;
    public _haveConnectd = false;//已经连接过了
    public _heartBeatInterval = null;//心跳检测周期
    public _enbleHeartBeat = true;//是否开启心跳检测

    public get proxy() {
        return this._proxy;
    }
    public set proxy(value) {
        this._proxy = value;
    }

    public connect(url) {
        var self = this;
        this._url = url;
        this._client = new WebSocket(this._url);
        this._client.binaryType = "arraybuffer";
        this._client.onopen = function (evt) {
            self._sendDescribe(self._client);
            self._events.emit("onConnect", self);
        }
        this._client.onmessage = function (evt) {
            self._handleMessage(self._client, evt.data);
        }
        this._client.onclose = function (evt) {
            self._stopCbTimeOut();
            if (self._isReady == true) {
                self._events.emit("onClose", self);
            }
            setTimeout(function () {
                if (self._isReconnected == true) {
                    self.connect(self._url);
                }
            }, 1000);
            self._clearSocket();
        }
        this._client.onerror = function (evt) {
            setTimeout(function () {
                if (self._isReconnected == true) {
                    self.connect(self._url);
                }
            }, 1000);
            self._clearSocket();
        }
    }

    public _handleMessage(client, message) {
        var data = this._parseDataToJson(message);

        var type = data.type;
        switch (type) {
            case 1://describe
                this._handleDescribe(client, data.data);
                break;
            case 2://call function
                this._runActionWithRawMessage(client, data.data);
                break;
            case 3://callback
                this._handleCb(client, data.data);
                break;
        }
    }

    //关闭ws
    public _clearSocket() {
        if (!this._client) return;
        this._client.onopen = null;
        this._client.onmessage = null;
        this._client.onclose = null;
        this._client.onerror = null;
        this._client = null;
        clearInterval(this._heartBeatInterval);
    }

    public onClose(callback) {
        this._events.on("onClose", callback, this);
    }

    public _handleCb(client, data) {
        var cbID = data.cbID;
        var cbData = data.cbData;
        if (Utils.hasKey(this._serverCb, cbID)) {
            try {
                this._serverCb[cbID].cb(cbData);
                Utils.remove(this._serverCb, cbID);//delete call back
            }
            catch (e) {
                cc.log(e.stack);
                Utils.remove(this._serverCb, cbID);//delete call back
            }

        }
    }

    public _runActionWithRawMessage(client, data) {
        var an = data.an;
        var args = data.args;
        var callbackID = data.cbID;
        this._runAction(client, an, args, callbackID);
    }

    public _runAction(client, actionName, args, callbackID) {
        var self = this;
        if (Utils.hasKey(this._rpc, actionName) == false) {
            throw new Error("server call function " + actionName + " is not defined");
        }
        args.push(function (cbData) {
            if (callbackID == 0) return;//cbID is 0 means no client no callback
            self._sendCallbackData(client, cbData, callbackID);
        });
        this._rpc[actionName].apply(this, args);
    }

    public _sendCallbackData(client, rawData, callbackID) {
        var sendData: any = {};
        sendData.type = 3;
        sendData.data = {};
        sendData.data.cbData = rawData;
        sendData.data.cbID = callbackID;
        this._sendRawData(client, sendData);
    }

    public _handleDescribe(client, data) {
        var self = this;
        var des = data.des;
        this._proxyDes = des;
        Utils.forEach(des, function (key, value) {
            self._proxy[key] = self._runServerAction.bind(self, key);
        });
        this._startCbTimeOut();
        this._isReady = true;
        this._haveConnectd = true;
        if (this._enbleHeartBeat) {
            cc.log("居然开启心跳包了");
            this._startHeartCheck();//心跳包检测
        }
        this._events.emit("onReady", this);
        this._events.offAll("onReady");
    }


    public _runServerAction(an) {
        var length = arguments.length;
        var cb = arguments[length - 1];
        var cbID = Utils.isFunction(cb) ? Utils.genID() : 0;
        if (cbID == 0 && !this._checkRunActionArgNums(an, length - 1)) {
            cc.log("server func " + "no callback need " + this._getServerFuncArgNum(an) + " args");
            return
        }
        else if (cbID != 0 && !this._checkRunActionArgNums(an, length - 2)) {
            cc.log("server func " + an + " need " + this._getServerFuncArgNum(an) + " args");
            return;
        }
        var sendData: any = {};
        var cb = arguments[length - 1];
        sendData.cbID = cbID;
        sendData.args = Array.prototype.slice.call(arguments, 1, length - 1);//length - 1 + ~cbID
        sendData.an = arguments[0];

        if (sendData.cbID != 0) {
            this._serverCb[sendData.cbID] = { cb: cb, time: new Date().getTime() };
        }
        this._sendActionData(this._client, sendData);
    }

    public _sendActionData(client, rawData) {
        var sendData: any = {};
        sendData.type = 2;
        sendData.data = rawData;
        this._sendRawData(client, sendData);
    }
    public _sendDescribe(client) {
        var names = this._getDescribeList();
        var sendData: any = {};
        sendData.type = 1;
        sendData.data = { des: names };
        this._sendRawData(client, sendData);
    }

    public _sendRawData(client, data) {
        client.send(this._jsonDataToSend(data));
    }


    public _getDescribeList = function () {
        if (this.describe == null) this.describe = {};
        else {
            return this.describe;
        }
        var self = this;
        Utils.forEach(this.rpc, function (key, value) {
            self.describe[key] = { args: value.length - 1 };
        });
        return this.describe;
    }

    public _stopCbTimeOut() {
        //所有等待回调的函数，都通知为false，因为断开连接了
        Utils.forEach(this._serverCb, function (key, value) {
            try {
                value.cb({ ok: false });
                cc.log("连接关闭了，但是还没调用!");
            } catch (e) {

            }
        });
        clearInterval(this._cbInterval);
    }

    public _startCbTimeOut() {
        var self = this;
        this._cbInterval = setInterval(function () {
            var rmA = [];
            Utils.forEach(self._serverCb, function (key, value) {
                if (Utils.isTimeOut(value.time, self._cbTimeOut)) {
                    rmA.push(key);
                }
            });
            if (rmA.length == 0) return;
            Utils.forEach(rmA, function (key, value) {
                try {
                    self._serverCb[value].cb({ ok: false })
                    cc.log("调用超时!");
                } catch (e) {

                }
                Utils.remove(self._serverCb, value);
            });
        }, this._cbTimeOut);
    }

    public _startHeartCheck() {
        var self = this;
        this._heartBeatInterval = setInterval(function () {
            if (self._haveConnectd == false) return;
            if (self._isReady == false) return;//如果isReady为false的话，刚开始连接，或者是已经断开连接了
            self._onReady(function (client) {
                //发送心跳包
                client.proxy.heartBeat(function (data) {
                    if (!data.ok) {
                        cc.log("没有收到心跳包！判定断线");
                        clearInterval(self._heartBeatInterval);
                        self._clearSocket();
                        self._isReady = false;
                        //发送断开连接事件
                        self.connect(self._url);
                        self._events.emit("onClose", self);
                    }
                })
            }, this);
        }, 11000);
    }

    public _onReady(callback, taget) {
        if (this._isReady == false || this._client.readyState != 1) {
            this._isReady = false;
            this._events.on("onReady", callback, taget);
            return;
        }
        else {
            callback(this);
        }
    }

    public addRpc(rpcJson) {
        var self = this;
        if (Utils.isJson(rpcJson)) {
            Utils.forEach(rpcJson, function (funcName, func) {
                self._rpc[funcName] = func;
            });
        } else {
            throw new Error("addRpc the arg must be a json");
        }
    }

    public startConnectUntilConnected(url) {//开始连接直到连接成功，只有在第一次连接的时候生效
        var self = this;
        this._url = url;
        this._client = new WebSocket(this._url);
        this._client.binaryType = "arraybuffer";
        this._client.onopen = function (evt) {
            self._sendDescribe(self._client);
            self._events.emit("onConnect", self);
        }
        this._client.onmessage = function (evt) {
            self._handleMessage(self._client, evt.data);
        }
        this._client.onclose = function (evt) {
            self._stopCbTimeOut();
            if (self._isReady == true) {//如果刚开始 连接
                self._events.emit("onClose", self);
                self._isReady = false;
            }
            setTimeout(function () {
                if (self._haveConnectd == false) {
                    self.startConnectUntilConnected(self._url);
                }
            }, 1000);
            self._clearSocket();
        }
        this._client.onerror = function (evt) {
            setTimeout(function () {
                if (self._haveConnectd == false) {
                    self.startConnectUntilConnected(self._url);
                }
            }, 1000);
            self._clearSocket();
        }
    }

    public onReadyState(cb) {
        if (this._isReady == false || this._client.readyState != 1) {
            cb(false);
        }
        else {
            cb(true);
        }
    }

    public close() {
        this._client.close();
    }

    public _getServerFuncArgNum(an) {
        return this._proxyDes[an].args;
    }

    public _checkRunActionArgNums(an, argNums) {
        if (this._proxyDes[an].args != argNums) return false;
        return true;
    }

    //字串转json
    public _parseDataToJson(str) {
        var unit8Array = Buffer.from(str);
        return MessagePack.decode(unit8Array);
        // return JSON.parse(str);
    }

    //json 转字串
    public _jsonDataToSend(data) {
        return MessagePack.encode(data);
        // return JSON.stringify(data);
    }

}