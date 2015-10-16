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
applicationDidFinishLaunchingWithOptions(application: UIApplication, launchOptions: NSDictionary): boolean {
    // Init Facebook SDK login
    FBSDKApplicationDelegate.sharedInstance().applicationDidFinishLaunchingWithOptions(application, launchOptions);
    return true;
  }
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
    ...
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

## Known issues

For iOS the switching between apps (yourAPP and safary or yourApp and fbApp) can cause that the result of the login process return always cancel.
To solve that you can modify the sdk to try to log in first using the systemAccount if available and fall to Webview , that are the two login behaviours that works well.   
You can also replace the class FBSDKLoginManager.m in platforms/ios/Pods/FBSDKLoginKit/FBSDKLoginKit/FBSDKLoginKit/.. with the one in issues/FBSDKLoginManager.m that is modified already


