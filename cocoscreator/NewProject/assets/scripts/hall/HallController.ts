import Broadcast from "../code/common/Broadcast";
import ActionIds from "../code/common/ActionIds";
import EventManager from "../code/common/EventManager";
import GameEventIds from "../code/common/GameEventIds";

export default class HallController {

    @Broadcast(ActionIds.HallList, Object)
    onGetHallList(cmd: any) {
        console.log("TAG 大厅游戏列表ID:", cmd, this);
        let gameList1 = cmd.gameList;

        EventManager.instance.emit(GameEventIds.HallGameListSuccessEvent, gameList1);
    }
    
}