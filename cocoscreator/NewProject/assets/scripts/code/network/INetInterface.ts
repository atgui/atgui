
export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);
export type NetCallFunc = (cmd: number, data: any) => void;

// 回调对象
export interface CallbackObject {
    target: any,                // 回调对象，不为null时调用target.callback(xxx)
    callback: NetCallFunc,      // 回调函数
}

export interface ISocket {
    onConnected(event);               // 连接回调
    onMessage(msg: NetData);         // 消息回调
    onError(event);                 // 错误回调
    onClosed(event);               // 关闭回调

    connect(options: any): boolean;                  // 连接接口
    send(buffer: NetData);                  // 数据发送接口
    close(code?: number, reason?: string);  // 关闭接口

}

// 请求对象
export interface RequestObject {
    buffer: NetData,            // 请求的Buffer
    rspCmd: number,             // 等待响应指令
    rspObject: CallbackObject,  // 等待响应的回调对象
}

// 协议辅助接口
export interface IProtocolHelper {
    parse(msg: NetData): Object;
    getHeadlen(): number;                   // 返回包头长度
    getHearbeat(): NetData;                 // 返回一个心跳包
    getPackageLen(msg: NetData): number;    // 返回整个包的长度
    checkPackage(msg: NetData): boolean;    // 检查包数据是否合法
    getPackageId(msg: NetData): number;     // 返回包的id或协议类型
}

// 默认字符串协议对象
export class DefStringProtocol implements IProtocolHelper {
    private _dataJson: Object;

    parse(msg: NetData): any {
        let json = JSON.parse(msg.toString());
        this._dataJson = json;
    }
    getHeadlen(): number {
        return 0;
    }
    getHearbeat(): NetData {
        return JSON.stringify({ cmd: "0", msg: "心跳" });
    }
    getPackageLen(msg: NetData): number {
        return msg.toString().length;
    }
    checkPackage(msg: NetData): boolean {
        return true;
    }
    getPackageId(msg: NetData): number {
        let cmd = this._dataJson["cmd"];
        return cmd ? cmd : 0;
    }
}

// 网络提示接口
export interface INetworkTips {
    connectTips(isShow: boolean): void;
    reconnectTips(isShow: boolean): void;
    requestTips(isShow: boolean): void;
}

