import LhdRecordModel from "../models/LhdRecordModel";

export default interface IDraw {
    /**
     * 画资源
     * @param row       行
     * @param col       列
     * @param result    资源数据
     * @param type      类型
     */
    draw(row: number, col: number, result: LhdRecordModel, t: number): void;
}