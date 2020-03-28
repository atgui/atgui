
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingProgress extends cc.Component {

    @property(cc.ProgressBar)
    progress: cc.ProgressBar;

    /**
     *
     */
    constructor() {
        super();
        console.log("constructor...");
    }

    public setMax(max: number) {
        this.progress.totalLength = this.progress.node.width;
    }

    public setProgress(value: number) {
        console.log("TAGS 当前进度:", value);
        this.progress.progress = value;
    }

    onLoad() {
        // this.setProgress(0.3);
    }

    start() {
        
    }

    onDestroy() {
        console.log("TAG 销毁了...");
    }
    // update (dt) {}
}
