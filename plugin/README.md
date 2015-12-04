# nativescript-facebook-login
A NativeScript module providing Facebook login for Android and iOS.
The plugin is using the version 4.7.0 for iOS and the version 4.6.0 for Android 
## Prerequisites
NativeScript 1.3.0 for Android and iOS since we are using cocoapods and .aar libraries
## Plugin architecture
```
.
├── app  <----------------run npm install from here
│   ├── node_modules
│   │   └── nativescript-facebook-login <-- The install will place the module's code here
│   │       ├──platforms
│   │       │  ├──android
│   │       │  │  └─libs
│   │       │  │    └─facebook-release.aar <-- This is the SDK for android as a .aar library
│   │       │  └──ios
│   │       │     └─Podfile <-- This is the SDK for iOS as a cocoapods dependency 
│   │       ├──facebook-handler.android.js
│   │       ├──facebook-handler.ios.js 
│   │       ├──LICENSE
│   │       ├──README
│   │       └──package.json
│   ├── package.json <-- The install will register "nativescript-facebook-login as a dependency here
│   └── tns_modules
│       └── ...
└── 
```

## Installation
tns plugin add nativescript-facebook-login

### iOS
For ios you need to add this to your app.ios to initialize the SDK
```ts
var application = require("application");

class MyDelegate extends UIResponder implements UIApplicationDelegate {
  public static ObjCProtocols = [UIApplicationDelegate];

  applicationDidFinishLaunchingWithOptions(application: UIApplication, launchOptions: NSDictionary): boolean {
   return FBSDKApplicationDelegate.sharedInstance().applicationDidFinishLaunchingWithOptions(application, launchOptions);
  }
  
  applicationOpenURLSourceApplicationAnnotation(application, url, sourceApplication, annotation) {
    return FBSDKApplicationDelegate.sharedInstance().applicationOpenURLSourceApplicationAnnotation(application, url, sourceApplication, annotation);
  }
  
  applicationDidBecomeActive(application: UIApplication): void {
      FBSDKAppEvents.activateApp();
  }

  applicationWillTerminate(application: UIApplication): void {
    //Do something you want here
  }

  applicationDidEnterBackground(application: UIApplication): void {
    //Do something you want here
  }
}

application.ios.delegate = MyDelegate;
application.start();

```

Add to your Info.plist(the one inside platforms/ios/yourApp) the Facebook App ID credentials 
```xml

<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLSchemes</key>
			<array>
        <string>fb{your-app-id}</string>
			</array>
		</dict>
	</array>
	<key>CFBundleVersion</key>
	<string>1.0</string>
	<key>FacebookAppID</key>
  <string>{your-app-id}</string>
	<key>FacebookDisplayName</key>
	<string>FacebookLoginDemo</string>
	<key>LSApplicationQueriesSchemes</key>
	<array>
		<string>fbauth2</string>
		<string>fbapi</string>
		<string>fb-messenger-api</string>
		<string>fbshareextension</string>
	</array>
```
For more information you can consult the official Facebook page for iOS
https://developers.facebook.com/docs/ios

### Android
Add to your AndroidManifest.xml (the one inside platforms/android/src/main) the Facebook App ID credentials
```xml
<uses-permission android:name="android.permission.INTERNET"/>
application android:label="@string/app_name" ...>
    ...
    <meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/>
    <activity android:name="com.facebook.FacebookActivity"
          android:configChanges=
                 "keyboard|keyboardHidden|screenLayout|screenSize|orientation"
          android:theme="@android:style/Theme.Translucent.NoTitleBar"
          android:label="@string/app_name" />
</application>
```
Add to your Strings (platforms/android/src/main/res/values/strings.xml) your facebook app id
```xml
<string name="facebook_app_id">your-app-id</string>
```

For more information you can consult the official Facebook page for Android
https://developers.facebook.com/docs/android
### Common to iOS and Android

Require the plugin whenever you want to use it
```ts
var FacebookLoginHandler = require("nativescript-facebook-login");
```
Create the callbacks to handle the result of the login
```ts
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
```

And finally you can start the login process like this
```ts
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
```

## Known issues
Sometimes the .aar library with the sdk for android don't get linked to the platform after installing the plugin. This end up in the error:    
TypeError: Cannot read property 'FacebookSdk' of undefined
File: "/data/data/com.ladeezfirstmedia.ThisOrThat/files/app/tns_modules/nativescript-facebook-login/facebook-handler.js line: 9 column:16   

You can try to sync the platform
tns livesync android

You can try cleaning the platform.
-remove the plugin
-remove the platform
-add the plugin
-add the platform in that order 

You can try to add manually the dependency
change the build.gradle (platforms/android/build.gradle) like this:
```
dependencies {
	....
        ....
    compile "com.android.support:support-v4:$suppotVer"
    compile "com.android.support:appcompat-v7:$suppotVer"

    //Facebook sdk
    compile 'com.facebook.android:facebook-android-sdk:4.6.0'
     	....
        ....
    
}
```
## Frequently asked questions

### Why Xcode is not building my iOS platform?

After installing the plugin CocoaPods creates a .xcworkspace file, use this one to open the project in Xcode instead of the .xcodeproj
