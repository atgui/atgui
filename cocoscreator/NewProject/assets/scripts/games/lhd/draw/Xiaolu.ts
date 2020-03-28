import Draw from "./Draw";
import LhdRecordModel from "../models/LhdRecordModel";
import DrawModel from "./DrawModel";
import IDraw from "./IDraw";

export default class Xiaolu extends Draw {
    private _MAX_LINE = 6;
    private _model: DrawModel;
    constructor(draw: IDraw) {
        super();
        this._model = new DrawModel();
        this._model.draw = draw;
        this._model.row = 0;
        this._model.col = 0;
        this._model.startCol = 0;
        this._model.type = 1;
        this._model.minRow = this._MAX_LINE;

        super.init(this._model, this._dyzArray);
    }
    //type=2  红   0 蓝
    public _dyzArray: Array<Array<LhdRecordModel>> = new Array();

    //不依赖 大路那边的数据,保存一个大路的公共数据
    public async _drawDayanzai(daluArray: Array<Array<LhdRecordModel>>) {
        // console.log("TAG  大路数据:", daluArray);
        if (daluArray.length < 3) {
            return;
        }
        if (daluArray.length == 3 && daluArray[2].length < 2) {
            return;
        }
        //取最后一个
        let arrays = daluArray[daluArray.length - 1];
        let mod = new LhdRecordModel();
        if (arrays.length == 1) {//是第一行,看前面两列长度是否一样
            let len1 = daluArray[daluArray.length - 2].length;
            let len2 = daluArray[daluArray.length - 4] ? daluArray[daluArray.length - 4].length : 0;
            if (len1 == len2) {
                mod.type = 0;
            } else {
                mod.type = 2;
            }
        } else {//看前一列的同一行是否有值
            if (daluArray[daluArray.length - 3][arrays.length - 1]) {
                //红
                mod.type = 0;
            } else {
                mod.type = 2;
                //前面一个没有,判断当前列比上一列多出一个后就画红
                let len1 = daluArray[daluArray.length - 3].length;// ? daluArray[daluArray.length - 3].length : 0;
                if (arrays.length - len1 > 1) {
                    mod.type = 0;
                }
            }
        }
        await this.addLudan(mod);
    }
}