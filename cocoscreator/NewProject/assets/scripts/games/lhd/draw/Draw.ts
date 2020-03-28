import LhdRecordModel from "../models/LhdRecordModel";
import DrawModel from "./DrawModel";

export default class Draw {
    private _drawModel: DrawModel;
    private _daluArray: Array<Array<LhdRecordModel>>;

    constructor() {

    }

    public init(drawModel: DrawModel, data: Array<Array<LhdRecordModel>>) {
        this._drawModel = drawModel;
        this._daluArray = data;
    }

    public async addLudan(recordMod: LhdRecordModel) {
        return new Promise(async (r, j) => {
            if (!this._daluArray[0]) this._daluArray[0] = new Array();
            if (this._daluArray[0].length <= 0) {//第一个
                this._daluArray[0][0] = recordMod;
                this._drawModel.col = 0;
                this._drawModel.row = 0;
                if (recordMod.type == 1) {
                    this._daluArray[0][0].isHe++;
                }
                await this._drawModel.draw.draw(0, 0, recordMod, this._drawModel.type);
                r();
                return;
            }
            //取最后一个
            let mod = this._daluArray[this._drawModel.col][this._drawModel.row];
            if (recordMod.type == 1) {//和
                mod.isHe++;
                await this._drawModel.draw.draw(this._drawModel.row, this._drawModel.col, mod, this._drawModel.type);
                r();
                return;
            }
            else if (mod.type == 1) {
                mod.type = recordMod.type;
                await this._drawModel.draw.draw(this._drawModel.row, this._drawModel.col, mod, this._drawModel.type);
                r();
                return;
            }
            if (mod.type == recordMod.type) {
                //判断是否还有下一个或者大于了最大的行数
                let col = this._drawModel.col;
                let upMod = null;
                if (col > -1) {
                    upMod = this._daluArray[col][this._drawModel.row + 1];
                }
                if (upMod) {//下一行有数据
                    let newCol = col + 1;
                    console.log("TAG 有数据了...", newCol, this._drawModel.row + 1);
                    if (!this._daluArray[newCol]) this._daluArray[newCol] = new Array();
                    this._drawModel.col = newCol;
                    this._daluArray[newCol][this._drawModel.row] = recordMod;
                    this._drawModel.minRow = this._drawModel.row;
                    await this._drawModel.draw.draw(this._drawModel.row, newCol, recordMod, this._drawModel.type);
                    r();
                } else {
                    if (this._drawModel.row + 1 >= this._drawModel.minRow) {
                        this._drawModel.col++;
                        if (!this._daluArray[this._drawModel.col]) this._daluArray[this._drawModel.col] = new Array();
                        this._daluArray[this._drawModel.col][this._drawModel.row] = recordMod;
                        await this._drawModel.draw.draw(this._drawModel.row, this._drawModel.col, recordMod, this._drawModel.type);
                        r();
                        return;
                    }
                    this._drawModel.row++;
                    this._daluArray[this._drawModel.col][this._drawModel.row] = recordMod;
                    await this._drawModel.draw.draw(this._drawModel.row, this._drawModel.col, recordMod, this._drawModel.type);
                    r();
                }
            } else {
                this._drawModel.startCol++;
                this._drawModel.minRow = 6;
                if (!this._daluArray[this._drawModel.startCol]) this._daluArray[this._drawModel.startCol] = new Array();
                this._daluArray[this._drawModel.startCol][0] = recordMod;
                this._drawModel.row = 0;
                this._drawModel.col = this._drawModel.startCol;
                await this._drawModel.draw.draw(0, this._drawModel.col, recordMod, this._drawModel.type);
                r();
            }
        });

    }
}