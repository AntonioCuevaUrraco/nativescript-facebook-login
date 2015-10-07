//NativeScript modules
import applicationModule = require("application");

//File variables
var AndroidApplication = applicationModule.android;

export function FacebookLoginHandler(successCallback: any, cancelCallback: any, failCallback: any) {
  //@todo Try to do it at the begginin of the APP instead
  //fb initialization
  com.facebook.FacebookSdk.sdkInitialize(AndroidApplication.context.getApplicationContext());

  //fb objects
  var mCallbackManager = com.facebook.CallbackManager.Factory.create();

  var loginManager: com.facebook.login.LoginManager = com.facebook.login.LoginManager.getInstance();

  loginManager.registerCallback(mCallbackManager, new com.facebook.FacebookCallback({

    onSuccess: function(result) {
      successCallback(result.getAccessToken().getToken());
    },
    onCancel: function() {
      cancelCallback();

    },
    onError: function(e) {
      failCallback(e);
    }

  }));

  var act: android.app.Activity = AndroidApplication.startActivity ||
    AndroidApplication.foregroundActivity;

  //Overriding Activity onActivityResult method to send it to the callbackManager
  act.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
      mCallbackManager.onActivityResult(requestCode, resultCode, data);
  }

  //Start the login process
  com.facebook.login.LoginManager.getInstance().logInWithPublishPermissions(act, java.util.Arrays.asList(["publish_actions"]));

}
