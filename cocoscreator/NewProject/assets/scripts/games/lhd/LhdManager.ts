import Server from "./server/Server";

export default class LhdManager {
    private static _instance: LhdManager;
    public static get instance(): LhdManager {
        if (!LhdManager._instance) {
            LhdManager._instance = new LhdManager();
        }
        return LhdManager._instance;
    }


    //0 龙  1 和  2 虎   2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    public record: Array<number> = [];

    public selfBets: Array<number> = [0, 0, 0];
    public totalBets: Array<number> = [0, 0, 0];
    public xuyaBets: Array<number>;
    public status: number = 0;

    public init() {
        this.xuyaBets = [];
        this.selfBets.forEach(value => {
            this.xuyaBets.push(value);
        });
        this.selfBets = [0, 0, 0];
        this.totalBets = [0, 0, 0];
    }


}