export default class Utils {
    //判断object 中是否存在 key
    public static hasKey(object, key) {
        if (Utils.isUndefined(object[key])) return false;
        return true;
    }

    //判断是不是undefind
    public static isUndefined(value) {
        if (typeof value == "undefined") return true;
        return false;
    }

    //循环
    public static forEach(data, itemCallback) {
        if (Utils.isFunction(itemCallback) == false) {
            throw new Error("UnitTools.forEach itemCallback must be a function");
        }
        if (Utils.isArray(data) || Utils.isJson(data)) {
            for (var key in data) {
                itemCallback(key, data[key]);
            }
        }
    }

    public static genID() {
        var id = "";
        for (var i = 0; i < 8; i++) {
            id += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return id.toLowerCase();
    }


    public static isTimeOut(from, timeOut) {
        var delta = Date.now() - from;
        if (delta >= timeOut) return true;
    }

    public static getOrCreateArrayInJson(key, ob) {
        if (Utils.isJson(ob) === false) { return null };
        var value = ob[key];
        if (Utils.isArray(value) === false) {
            value = ob[key] = [];
        }
        return value;
    }

    public static removeArray(arr, removeArr) {
        if (!Utils.isArray(arr) || !Utils.isArray(removeArr)) return;
        Utils.forEach(removeArr, function (index, value) {
            var findIndex = Utils.getArrayValueIndex(arr, value);
            if (findIndex != -1) arr.splice(findIndex, 1);
        });
    }

    public static getArrayValueIndex(arr, value) {
        if (!Utils.isArray(arr)) return -1;
        var findIndex: any = -1;
        for (var index in arr) {
            var val = arr[index];
            if (value == val) {
                findIndex = index;
                break;
            }
        }
        return findIndex;
    }

    //删除
    public static remove(ob, key) {
        delete ob[key];
    }

    //判断是不是json
    public static isJson(value) {
        if (typeof value != "object") return false;
        return true;
    }

    //判断是不是集合
    public static isArray(value) {
        if (value instanceof Array) return true;
        return false;
    }
    //判断是不是方法
    public static isFunction(value) {
        if (typeof value != "function") return false;
        return true;
    }
}