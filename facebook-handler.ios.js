function FacebookLoginHandler(successCallback, cancelCallback, failCallback) {
    var fbLoginMng = new FBSDKLoginManager();
    fbLoginMng.logInWithPublishPermissionsHandler(["publish_actions"], function (result, error) {
        if (!result.isCancelled && result.token) {
            successCallback(result.token.tokenString);
        }
        else if (result.isCancelled) {
            cancelCallback();
        }
        else {
            failCallback(error);
        }
    });
}
exports.FacebookLoginHandler = FacebookLoginHandler;
