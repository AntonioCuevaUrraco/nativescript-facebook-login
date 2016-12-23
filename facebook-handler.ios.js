var _isInit = false;
var mCallbackManager;
var loginManager;
function init(loginBehavior) {
    loginManager = FBSDKLoginManager.alloc().init();
    if (loginManager) {
        loginManager.logOut();
        if (loginBehavior) {
            loginManager.loginBehavior = loginBehavior;
        }
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
            if (error) {
                failCallback(error);
                return;
            }
            if (!result) {
                failCallback("Null error");
                return;
            }
            if (result.isCancelled) {
                cancelCallback();
                return;
            }
            if (result.token) {
                successCallback(result);
            }
            else {
                failCallback("Could not acquire an access token");
                return;
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
function logInWithReadPermissions(permissions) {
    if (_isInit) {
        loginManager.logInWithReadPermissionsHandler(permissions, mCallbackManager);
    }
}
exports.logInWithReadPermissions = logInWithReadPermissions;
