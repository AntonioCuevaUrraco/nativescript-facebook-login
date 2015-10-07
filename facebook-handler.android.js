var applicationModule = require("application");
var AndroidApplication = applicationModule.android;
function FacebookLoginHandler(successCallback, cancelCallback, failCallback) {
    com.facebook.FacebookSdk.sdkInitialize(AndroidApplication.context.getApplicationContext());
    var mCallbackManager = com.facebook.CallbackManager.Factory.create();
    var loginManager = com.facebook.login.LoginManager.getInstance();
    loginManager.registerCallback(mCallbackManager, new com.facebook.FacebookCallback({
        onSuccess: function (result) {
            successCallback(result.getAccessToken().getToken());
        },
        onCancel: function () {
            cancelCallback();
        },
        onError: function (e) {
            failCallback(e);
        }
    }));
    var act = AndroidApplication.startActivity ||
        AndroidApplication.foregroundActivity;
    act.onActivityResult = function (requestCode, resultCode, data) {
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
    };
    com.facebook.login.LoginManager.getInstance().logInWithPublishPermissions(act, java.util.Arrays.asList(["publish_actions"]));
}
exports.FacebookLoginHandler = FacebookLoginHandler;
