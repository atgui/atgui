import IDraw from "./IDraw";
import LhdRecordModel from "../models/LhdRecordModel";
import Draw from "./Draw";
import DrawModel from "./DrawModel";

export default class Dalu extends Draw {

    private _MAX_LINE = 6;
    // private _daluDraw: IDraw;
    private _model: DrawModel;
    constructor(draw: IDraw) {
        super();
        this._model = new DrawModel();
        this._model.draw = draw;
        this._model.row = 0;
        this._model.col = 0;
        this._model.startCol = 0;
        this._model.type = 4;
        this._model.minRow = this._MAX_LINE;

        super.init(this._model, this._daluArray1);
    }

    private _daluArray1: Array<Array<LhdRecordModel>> = new Array();
    //数组的长度是列,二维数组中的第二数组是行
    async _drawDalu(recordMod: LhdRecordModel) {
        await this.addLudan(recordMod);
    }

}