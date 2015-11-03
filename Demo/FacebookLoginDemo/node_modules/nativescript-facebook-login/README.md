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
<key>FacebookAppID</key>
<string>{your-app-id}</string>
<key>FacebookDisplayName</key>
<string>{your-app-name}</string>
```
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
}
var cancelCallback = function() {
    alert("Login was cancelled");
  }
  
var failCallback = function() {
    alert("Unexpected error: Cannot get access token");
  }  
```
And finally you can start the login process like this
```ts
  FacebookLoginHandler.init();
  FacebookLoginHandler.registerCallback(successCallback, cancelCallback, failCallback);
  //Ask for the permissions you want to use
  FacebookLoginHandler.logInWithPublishPermissions(["publish_actions"]);
```

## Frequently asked questions

### Why Xcode is not building my iOS platform?

After installing the plugin CocoaPods creates a .xcworkspace file, use this one to open the project in Xcode instead of the .xcodeproj
