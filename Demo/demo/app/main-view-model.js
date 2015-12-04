var observable = require("data/observable");
var FacebookLoginHandler = require("nativescript-facebook-login");
var frameModule = require("ui/frame");
var topmost = frameModule.topmost;

var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel() {
        _super.call(this);
    }
    HelloWorldModel.prototype.tapAction = function () {


        var successCallback = function(result) {
            //Do something with the result, for example get the AccessToken
            var token;
            if (topmost().android){
              token = result.getAccessToken().getToken();
            }
            else if (topmost().ios){
              token = result.token.tokenString
            }
            alert(token);
        }

        var cancelCallback = function() {
            alert("Login was cancelled");
        }

        var failCallback = function(error) {
            var errorMessage = "Error with Facebook";
           //Try to get as much information as possible from error
           if (error) {
                if (topmost().ios) {
                    if (error.localizedDescription) {
                        errorMessage += ": " + error.localizedDescription;
                    }
                    else if (error.code) {
                        errorMessage += ": Code " + error.code;
                    }
                    else {
                        errorMessage += ": " + error;   
                    }
                }
                else if (topmost().android) {
                    if (error.getErrorMessage) {
                        errorMessage += ": " + error.getErrorMessage();
                    }
                    else if (error.getErrorCode) {
                        errorMessage += ": Code " + error.getErrorCode();
                    }
                    else {
                        errorMessage += ": " + error;   
                    }
                }
            }
            alert(errorMessage);
        }  
    
    //Here we select the login behaviour

    //Recomended system account with native fallback for iOS
    if (topmost().ios) {
        FacebookLoginHandler.init(2);
    }
    //Recomended default for android 
    else if (topmost().android) {
        FacebookLoginHandler.init();
    }
    //Register our callbacks
    FacebookLoginHandler.registerCallback(successCallback, cancelCallback, failCallback);
    //Start the login process
    FacebookLoginHandler.logInWithPublishPermissions(["publish_actions"]);      
    };
    return HelloWorldModel;
})(observable.Observable);
exports.HelloWorldModel = HelloWorldModel;
exports.mainViewModel = new HelloWorldModel();
