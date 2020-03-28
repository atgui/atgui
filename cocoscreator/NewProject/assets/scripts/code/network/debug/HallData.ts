export default class HallData {
    public static games = [{
        status: 1, gameId: 10001,
        rooms: [
            { free: 0, playerCount: Math.floor(Math.random() * 1000) + 1, init: 1000, roomId: 1, level: 0 },
            { free: 1, playerCount: Math.floor(Math.random() * 1000) + 1, init: 2000, roomId: 2, level: 1 },
            { free: 2, playerCount: Math.floor(Math.random() * 1000) + 1, init: 3000, roomId: 3, level: 2 },
            { free: 3, playerCount: Math.floor(Math.random() * 1000) + 1, init: 4000, roomId: 4, level: 3 },
            { free: 4, playerCount: Math.floor(Math.random() * 1000) + 1, init: 5000, roomId: 5, level: 4 }
        ]
    }];
    public static actitys = [];

    public static curGame: { status: number, gameId: number };
    public static roomId: number = 0;

}