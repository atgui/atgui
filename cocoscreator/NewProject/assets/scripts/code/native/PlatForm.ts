/**
 * 调用原生平台
 * Created by atgui on 2020/2/20
 */
export default class PlatForm {

    /**
     * 
     * @param className 类名全路径
     * @param methodName 方法名
     */
    public static androidWithNoArgs(className: string, methodName: string) {
        if (!cc.sys.isNative) {
            return;
        }
        //()V:表示该方法没有参数
        jsb.reflection.callStaticMethod(className, methodName, "()V");

        //(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
        //对应参数的java类型
        // PlatForm.androidNative("com/tongfei/umeng/UmengManager", "weixinShare", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, desc, imageUrl, webUrl);
    }

}