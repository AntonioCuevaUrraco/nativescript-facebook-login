var _isInit = false;
var mCallbackManager;
var loginManager;
function init() {
    loginManager = new FBSDKLoginManager();
    loginManager.loginBehavior = 2;
    if (loginManager) {
        _isInit = true;
        return true;
    }
    else {
        return false;
    }
}
exports.init = init;
function registerCallback(successCallback, cancelCallback, failCallback) {
    if (_isInit) {
        mCallbackManager = function (result, error) {
            if (!result.isCancelled && result.token) {
                successCallback(result);
            }
            else if (result.isCancelled) {
                cancelCallback();
            }
            else {
                failCallback(error);
            }
        };
    }
}
exports.registerCallback = registerCallback;
function logInWithPublishPermissions(permissions) {
    if (_isInit) {
        loginManager.logInWithPublishPermissionsHandler(permissions, mCallbackManager);
    }
}
exports.logInWithPublishPermissions = logInWithPublishPermissions;
