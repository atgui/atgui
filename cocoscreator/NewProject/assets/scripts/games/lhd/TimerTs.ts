import UIController from "../../code/base/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TimerTs extends UIController {

    onLoad() {
        this.init(this.node, "");
        this.node.active=false;
    }

    private _timeSamp: number;
    private _time: number;

    private _t: NodeJS.Timer;

    public showTimer(t: number) {
        this.node.active=true;
        this._time = t;
        this._timeSamp = new Date().getTime();
        let timeLabel: cc.Label = this.view["timeSpriite/timeLabel"].getComponent(cc.Label);
        timeLabel.string = t + "";
        this._t = setInterval(() => {
            let totalTime = Math.floor((new Date().getTime() - this._timeSamp) / 1000);
            let timeValue = this._time - totalTime;
            if (timeValue < 0) {
                timeValue = 0;
            }
            timeLabel.string = timeValue + "";
        }, 1000);
    }


    onDestroy() {
        clearInterval(this._t);
    }

    // update (dt) {}
}
