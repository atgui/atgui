import LhdRecordModel from "../models/LhdRecordModel";
import IDraw from "./IDraw";
import Dalu from "./Dalu";
import Dayanzai from "./Dayanzai";
import Xiaolu from "./Xiaolu";
import Jiayoulu from "./Jiayoulu";

export default class LhdGroup {
    constructor() {
    }

    private _dalu: Dalu;
    private _dayanzai: Dayanzai;
    private _xiaolu: Xiaolu;
    private _jiayoulu: Jiayoulu;

    private daluArray: Array<Array<LhdRecordModel>> = new Array();

    public setDraw(daluDraw: IDraw, dyzDraw: IDraw, xlDraw: IDraw, jylDraw: IDraw, row: number) {
        this._dalu = new Dalu(daluDraw);
        this._dayanzai = new Dayanzai(dyzDraw);
        this._xiaolu = new Xiaolu(xlDraw);
        this._jiayoulu = new Jiayoulu(jylDraw);
        return this;
    }

    public async setResult(type: number) {
        let mod = new LhdRecordModel();
        mod.type = type;
        return new Promise(async (r, j) => {
            await this._dalu.addLudan(mod);
            if (mod.type != 1) {
                let newMode = new LhdRecordModel();
                newMode.type = mod.type;
                //保存供其他用
                let arr = this.daluArray[this.daluArray.length - 1];
                if (!arr) {
                    this.daluArray[0] = [newMode];
                } else {
                    let nMod = arr[arr.length - 1];
                    if (nMod.type == mod.type) {
                        arr.push(newMode);
                    } else {
                        this.daluArray[this.daluArray.length] = [newMode];
                    }
                }
                //画大眼仔
                this._dayanzai._drawDayanzai(this.daluArray);
                this._xiaolu._drawDayanzai(this.daluArray);
                this._jiayoulu._drawDayanzai(this.daluArray);
            }
            r();
        });

    }

    private async  _testDraw(type: number) {

    }

}