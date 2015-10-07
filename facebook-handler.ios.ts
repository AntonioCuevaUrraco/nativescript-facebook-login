export function FacebookLoginHandler(successCallback: any, cancelCallback: any, failCallback: any) {
  var fbLoginMng: FBSDKLoginManager = new FBSDKLoginManager();
  fbLoginMng.logInWithPublishPermissionsHandler(["publish_actions"], function(result: FBSDKLoginManagerLoginResult, error: NSError) {
    //if user didnt cancel and we can get accessToken
    if (!result.isCancelled && result.token) {
      successCallback(result.token.tokenString);
    } else if (result.isCancelled) {
      cancelCallback();
    } else {
      failCallback(error);
    }
  });
}
