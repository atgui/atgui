import UserEntity from "../models/UserEntity";

export default class UserManager {
    private static _instance: UserManager;
    public static get instance(): UserManager {
        if (!UserManager._instance) {
            UserManager._instance = new UserManager();
        }
        return UserManager._instance;
    }

    self: UserEntity = new UserEntity();
    
}