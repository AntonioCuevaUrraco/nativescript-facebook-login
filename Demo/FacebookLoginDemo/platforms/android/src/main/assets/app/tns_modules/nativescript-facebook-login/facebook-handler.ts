//NativeScript modules
import applicationModule = require("application");

var _isInit: boolean = false;
var _AndroidApplication = applicationModule.android;
var _act: android.app.Activity;

var mCallbackManager;
var loginManager;

export function init(): boolean{
  //fb initialization
    com.facebook.FacebookSdk.sdkInitialize(_AndroidApplication.context.getApplicationContext());
    mCallbackManager = com.facebook.CallbackManager.Factory.create();
    loginManager = com.facebook.login.LoginManager.getInstance();

    if (mCallbackManager && loginManager) {
    _isInit = true;
    return true;
    }
    else {
    return false;
    }
}

export function registerCallback(successCallback: any, cancelCallback: any, failCallback: any) {

    if(_isInit){
      var act = _AndroidApplication.foregroundActivity;
      _act = act; 

      loginManager.registerCallback(mCallbackManager, new com.facebook.FacebookCallback({

        onSuccess: function(result) {
          successCallback(result);
        },
        onCancel: function() {
          cancelCallback();

        },
        onError: function(e) {
          failCallback(e);
        }

      }));

      //Overriding Activity onActivityResult method to send it to the callbackManager
      act.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
      }
    }
  }

export function logInWithPublishPermissions(permissions: string[]) {

    if (_isInit) {
      var javaPermissions = java.util.Arrays.asList(permissions);
      //Start the login process
      com.facebook.login.LoginManager.getInstance().logInWithPublishPermissions(_act, javaPermissions);
    }
  }

 

