import AutoSocketClient from "./AutoSocketClient";
import { runInThisContext } from "vm";

export default class SocketManager {
    private static _instance: SocketManager;
    public static get instance(): SocketManager {
        if (!this._instance) {
            this._instance = new SocketManager();
        }
        return this._instance;
    }

    constructor() {
        this._client = new AutoSocketClient();
    }
    private _client: AutoSocketClient;

    public get client(): AutoSocketClient {
        return this._client;
    }

    public connect(url: string) {
        this._client.connect(url);
    }

    public get proxy(): any {
        return this._client.proxy;
    }

    public onReady(cb, taget) {
        this._client.onReady(cb, taget);
    }


}