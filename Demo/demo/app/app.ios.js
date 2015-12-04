var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var application = require("application");
application.mainModule = "main-page";
application.cssFile = "./app.css";
var MyDelegate = (function (_super) {
    __extends(MyDelegate, _super);
    function MyDelegate() {
        _super.apply(this, arguments);
    }
    MyDelegate.prototype.applicationDidFinishLaunchingWithOptions = function (application, launchOptions) {
        return FBSDKApplicationDelegate.sharedInstance().applicationDidFinishLaunchingWithOptions(application, launchOptions);
    };
    MyDelegate.prototype.applicationOpenURLSourceApplicationAnnotation = function (application, url, sourceApplication, annotation) {
        return FBSDKApplicationDelegate.sharedInstance().applicationOpenURLSourceApplicationAnnotation(application, url, sourceApplication, annotation);
    };
    MyDelegate.prototype.applicationDidBecomeActive = function (application) {
            FBSDKAppEvents.activateApp();
    };
    MyDelegate.ObjCProtocols = [UIApplicationDelegate];
    return MyDelegate;
})(UIResponder);
application.ios.delegate = MyDelegate;
application.start();