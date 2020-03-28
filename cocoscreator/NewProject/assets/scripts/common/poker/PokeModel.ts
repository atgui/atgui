export default class PokerModel {
    public CARD_TYPE: number = 0xF0;// = (value & 0xF0) >> 4
    public CARD_VALUE: number = 0x0F;// = (value & 0x0F)

    public id: number;

    public getValue() {
        return this.id & this.CARD_VALUE;
    }

    public getColor() {
        return (this.id & this.CARD_TYPE);
    }

    public setId(_id: number) {
        this.id = _id;
    }

}