export default class UserEntity {
    username: string;
    gold: number;
    headUrl: string;
    sex: number;

    createUser(user) {
        this.username = user["username"];
        this.gold = user["gold"];
        this.headUrl = user["headUrl"];
        this.sex = user['sex'];
    }

    public get selfGold(): string {
        return this.gold + "";
    }

}