
export default class UIController extends cc.Component {

    public view: any = new Object();

    init(root: cc.Node, path) {

        for (let i: number = 0; i < root.childrenCount; i++) {
            this.view[path + root.children[i].name] = root.children[i];
            this.init(root.children[i], path + root.children[i].name + "/");
        }
    }

}