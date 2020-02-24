/**
 * HTTP
 * Created by atgui on 2020/2/20
 */
export default class HttpHelper {
    private static _instance: HttpHelper;
    public static get instance(): HttpHelper {
        if (!HttpHelper._instance) {
            HttpHelper._instance = new HttpHelper();
        }
        return HttpHelper._instance;
    }

    public post(url, params, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            cc.log('xhr.readyState=' + xhr.readyState + '  xhr.status=' + xhr.status);
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                var respone = xhr.responseText;
                callback(JSON.parse(respone));
            }
        }
        // var url_temp = url;//"http://192.168.3.108:8080/login?data=1";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(params));
    }

    //GET
    public get(url, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            cc.log('xhr.readyState=' + xhr.readyState + '  xhr.status=' + xhr.status);
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                var respone = xhr.responseText;
                callback(JSON.parse(respone));
            }
        };
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();
    }
}