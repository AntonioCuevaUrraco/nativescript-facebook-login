var observable = require("data/observable");
var application = require("application");
var dialogsModule = require("ui/dialogs");
var alert = dialogsModule.alert;

var FacebookLoginHandler = require("nativescript-facebook-login");

var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel() {
        _super.call(this);
        this.token="";
        this.set("message", this.token);
    }
    HelloWorldModel.prototype.connectAction = function () {   
        
        var successCallback = function (result) {
        var token;
        if (application.android) {
            token = result.getAccessToken().getToken();
            alert("Token "+ token);
        }
        else if (application.ios) {
            token = result.token.tokenString;
            alert("Token "+ token);
        }
    };
    var cancelCallback = function () {
        alert("Login was cancelled");
    };
    var failCallback = function () {
        alert("Unexpected error: Cannot get access token");
    };
    FacebookLoginHandler.init();
    FacebookLoginHandler.registerCallback(successCallback, cancelCallback, failCallback);
    FacebookLoginHandler.logInWithPublishPermissions(["publish_actions"]);

    };
    return HelloWorldModel;
})(observable.Observable);
exports.HelloWorldModel = HelloWorldModel;
exports.mainViewModel = new HelloWorldModel();
