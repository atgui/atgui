import AutoSocketClient from "./AutoSocketClient";
import { runInThisContext } from "vm";

export default class ASocketManager {
    private static _instance: ASocketManager;
    public static get instance(): ASocketManager {
        if (!this._instance) {
            this._instance = new ASocketManager();
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