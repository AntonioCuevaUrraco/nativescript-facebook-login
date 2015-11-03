//NativeScript modules
import applicationModule = require("application");

var _isInit: boolean = false;

var mCallbackManager;
var loginManager;


export function init(): boolean { 
    //fb initialization
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

export function registerCallback(successCallback: any, cancelCallback: any, failCallback: any) {
    if (_isInit) {
      mCallbackManager= function(result: FBSDKLoginManagerLoginResult, error: NSError) {
        //if user didnt cancel and we can get accessToken
        if (!result.isCancelled && result.token) {
        //result.token.tokenString
          successCallback(result);
        } else if (result.isCancelled) {
          cancelCallback();
        } else {
          failCallback(error);
        }
      }
    }
  }

export function logInWithPublishPermissions(permissions: string[]) {
    if (_isInit) {
      loginManager.logInWithPublishPermissionsHandler(permissions, mCallbackManager);
    }
  }

 

