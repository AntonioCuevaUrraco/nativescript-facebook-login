var frameCommon = require("./frame-common");
var trace = require("trace");
var observable = require("data/observable");
var utils = require("utils/utils");
var application = require("application");
global.moduleMerge(frameCommon, exports);
var TAG = "_fragmentTag";
var OWNER = "_owner";
var HIDDEN = "_hidden";
var INTENT_EXTRA = "com.tns.activity";
var ANDROID_FRAME = "android_frame";
var BACKSTACK_TAG = "_backstackTag";
var NAV_DEPTH = "_navDepth";
var CLEARING_HISTORY = "_clearingHistory";
var navDepth = -1;
var PageFragmentBody = (function (_super) {
    __extends(PageFragmentBody, _super);
    function PageFragmentBody(frame, entry) {
        _super.call(this);
        this.frame = frame;
        this.entry = entry;
        return global.__native(this);
    }
    PageFragmentBody.prototype.onAttach = function (activity) {
        _super.prototype.onAttach.call(this, activity);
        trace.write(this.toString() + ".onAttach();", trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onCreate = function (savedInstanceState) {
        _super.prototype.onCreate.call(this, savedInstanceState);
        trace.write(this.toString() + ".onCreate(); savedInstanceState: " + savedInstanceState, trace.categories.NativeLifecycle);
        _super.prototype.setHasOptionsMenu.call(this, true);
    };
    PageFragmentBody.prototype.onCreateView = function (inflater, container, savedInstanceState) {
        trace.write(this.toString() + ".onCreateView(); container: " + container + "; savedInstanceState: " + savedInstanceState, trace.categories.NativeLifecycle);
        if (this[CLEARING_HISTORY]) {
            trace.write(this.toString() + " wants to create a view, but we are currently clearing history. Returning null.", trace.categories.NativeLifecycle);
            return null;
        }
        var entry = this.entry;
        var page = entry.resolvedPage;
        if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
            _super.prototype.getFragmentManager.call(this).beginTransaction().hide(this).commit();
            page._onAttached(this.getActivity());
        }
        else {
            onFragmentShown(this);
        }
        trace.write(this.toString() + ".onCreateView(); nativeView: " + page._nativeView, trace.categories.NativeLifecycle);
        return page._nativeView;
    };
    PageFragmentBody.prototype.onHiddenChanged = function (hidden) {
        _super.prototype.onHiddenChanged.call(this, hidden);
        trace.write(this.toString() + ".onHiddenChanged(); hidden: " + hidden, trace.categories.NativeLifecycle);
        if (hidden) {
            onFragmentHidden(this);
        }
        else {
            onFragmentShown(this);
        }
    };
    PageFragmentBody.prototype.onActivityCreated = function (savedInstanceState) {
        _super.prototype.onActivityCreated.call(this, savedInstanceState);
        trace.write(this.toString() + ".onActivityCreated(); savedInstanceState: " + savedInstanceState, trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onSaveInstanceState = function (outState) {
        _super.prototype.onSaveInstanceState.call(this, outState);
        trace.write(this.toString() + ".onSaveInstanceState();", trace.categories.NativeLifecycle);
        if (this.isHidden()) {
            outState.putBoolean(HIDDEN, true);
        }
    };
    PageFragmentBody.prototype.onViewStateRestored = function (savedInstanceState) {
        _super.prototype.onViewStateRestored.call(this, savedInstanceState);
        trace.write(this.toString() + ".onViewStateRestored(); savedInstanceState: " + savedInstanceState, trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onStart = function () {
        _super.prototype.onStart.call(this);
        trace.write(this.toString() + ".onStart();", trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onResume = function () {
        _super.prototype.onResume.call(this);
        trace.write(this.toString() + ".onResume();", trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onPause = function () {
        _super.prototype.onPause.call(this);
        trace.write(this.toString() + ".onPause();", trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onStop = function () {
        _super.prototype.onStop.call(this);
        trace.write(this.toString() + ".onStop();", trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.onDestroyView = function () {
        _super.prototype.onDestroyView.call(this);
        trace.write(this.toString() + ".onDestroyView();", trace.categories.NativeLifecycle);
        onFragmentHidden(this);
    };
    PageFragmentBody.prototype.onDestroy = function () {
        _super.prototype.onDestroy.call(this);
        trace.write(this.toString() + ".onDestroy();", trace.categories.NativeLifecycle);
        utils.GC();
    };
    PageFragmentBody.prototype.onDetach = function () {
        _super.prototype.onDetach.call(this);
        trace.write(this.toString() + ".onDetach();", trace.categories.NativeLifecycle);
    };
    PageFragmentBody.prototype.toString = function () {
        return this.getTag() + "[" + this.entry.resolvedPage.id + "]";
    };
    return PageFragmentBody;
})(android.app.Fragment);
function onFragmentShown(fragment) {
    if (fragment[CLEARING_HISTORY]) {
        trace.write(fragment.toString() + " has been shown, but we are currently clearing history. Returning.", trace.categories.NativeLifecycle);
        return null;
    }
    var frame = fragment.frame;
    var entry = fragment.entry;
    var page = entry.resolvedPage;
    frame._currentEntry = entry;
    frame._addView(page);
    page.onNavigatedTo();
    frame._processNavigationQueue(page);
}
function onFragmentHidden(fragment) {
    if (fragment[CLEARING_HISTORY]) {
        trace.write(fragment.toString() + " has been hidden, but we are currently clearing history. Returning.", trace.categories.NativeLifecycle);
        return null;
    }
    var entry = fragment.entry;
    var page = entry.resolvedPage;
    if (page && page.frame) {
        var frame = page.frame;
        frame._removeView(page);
    }
}
var Frame = (function (_super) {
    __extends(Frame, _super);
    function Frame() {
        _super.call(this);
        this._isFirstNavigation = false;
        this._containerViewId = android.view.View.generateViewId();
        this._android = new AndroidFrame(this);
    }
    Object.defineProperty(Frame, "defaultAnimatedNavigation", {
        get: function () {
            return frameCommon.Frame.defaultAnimatedNavigation;
        },
        set: function (value) {
            frameCommon.Frame.defaultAnimatedNavigation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "containerViewId", {
        get: function () {
            return this._containerViewId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "_nativeView", {
        get: function () {
            return this._android.rootViewGroup;
        },
        enumerable: true,
        configurable: true
    });
    Frame.prototype._navigateCore = function (backstackEntry) {
        trace.write("_navigateCore; id: " + backstackEntry.resolvedPage.id + "; backstackVisible: " + this._isEntryBackstackVisible(backstackEntry) + "; clearHistory: " + backstackEntry.entry.clearHistory + ";", trace.categories.Navigation);
        var activity = this._android.activity;
        if (!activity) {
            var currentActivity = this._android.currentActivity;
            if (currentActivity) {
                startActivity(currentActivity, backstackEntry.entry);
            }
            this._delayedNavigationEntry = backstackEntry;
            return;
        }
        var manager = activity.getFragmentManager();
        if (backstackEntry.entry.clearHistory && !this._isFirstNavigation) {
            var backStackEntryCount = manager.getBackStackEntryCount();
            var i = backStackEntryCount - 1;
            var fragment;
            while (i >= 0) {
                fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
                trace.write(fragment.toString() + "[CLEARING_HISTORY] = true;", trace.categories.NativeLifecycle);
                fragment[CLEARING_HISTORY] = true;
            }
            if (this.currentPage) {
                fragment = manager.findFragmentByTag(this.currentPage[TAG]);
                if (fragment) {
                    fragment[CLEARING_HISTORY] = true;
                    trace.write(fragment.toString() + "[CLEARING_HISTORY] = true;", trace.categories.NativeLifecycle);
                }
            }
            if (backStackEntryCount) {
                var firstEntryName = manager.getBackStackEntryAt(0).getName();
                trace.write("manager.popBackStack(" + firstEntryName + ", android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);", trace.categories.NativeLifecycle);
                manager.popBackStack(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
            }
            this._currentEntry = null;
            navDepth = -1;
        }
        navDepth++;
        var fragmentTransaction = manager.beginTransaction();
        var newFragmentTag = "fragment" + navDepth;
        var newFragment = new PageFragmentBody(this, backstackEntry);
        backstackEntry[BACKSTACK_TAG] = newFragmentTag;
        backstackEntry[NAV_DEPTH] = navDepth;
        backstackEntry.resolvedPage[TAG] = newFragmentTag;
        trace.write("Frame<" + this._domId + ">.fragmentTransaction PUSH depth = " + navDepth, trace.categories.Navigation);
        if (this._isFirstNavigation) {
            fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);
            trace.write("fragmentTransaction.add(" + this.containerViewId + ", " + newFragment + ", " + newFragmentTag + ");", trace.categories.NativeLifecycle);
        }
        else {
            if (this.android.cachePagesOnNavigate && !backstackEntry.entry.clearHistory) {
                var currentFragmentTag = this.currentPage[TAG];
                var currentFragment = manager.findFragmentByTag(currentFragmentTag);
                if (currentFragment) {
                    fragmentTransaction.hide(currentFragment);
                    trace.write("fragmentTransaction.hide(" + currentFragment + ");", trace.categories.NativeLifecycle);
                }
                else {
                    trace.write("Could not find " + currentFragmentTag + " to hide", trace.categories.NativeLifecycle);
                }
                fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);
                trace.write("fragmentTransaction.add(" + this.containerViewId + ", " + newFragment + ", " + newFragmentTag + ");", trace.categories.NativeLifecycle);
            }
            else {
                fragmentTransaction.replace(this.containerViewId, newFragment, newFragmentTag);
                trace.write("fragmentTransaction.replace(" + this.containerViewId + ", " + newFragment + ", " + newFragmentTag + ");", trace.categories.NativeLifecycle);
            }
            if (this.backStack.length > 0 && this._currentEntry) {
                var backstackTag = this._currentEntry[BACKSTACK_TAG];
                fragmentTransaction.addToBackStack(backstackTag);
                trace.write("fragmentTransaction.addToBackStack(" + backstackTag + ");", trace.categories.NativeLifecycle);
            }
        }
        if (!this._isFirstNavigation) {
            var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
            if (this.android.cachePagesOnNavigate) {
                fragmentTransaction.setTransition(android.app.FragmentTransaction.TRANSIT_NONE);
            }
            else {
                var transition = animated ? android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN : android.app.FragmentTransaction.TRANSIT_NONE;
                fragmentTransaction.setTransition(transition);
            }
        }
        fragmentTransaction.commit();
        trace.write("fragmentTransaction.commit();", trace.categories.NativeLifecycle);
    };
    Frame.prototype._goBackCore = function (backstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];
        trace.write("Frame<" + this._domId + ">.fragmentTransaction POP depth = " + navDepth, trace.categories.Navigation);
        var manager = this._android.activity.getFragmentManager();
        if (manager.getBackStackEntryCount() > 0) {
            manager.popBackStack(backstackEntry[BACKSTACK_TAG], android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    };
    Frame.prototype._createUI = function () {
    };
    Frame.prototype._onActivityCreated = function (isRestart) {
        this._onAttached(this._android.activity);
        var backstackEntry = this.currentEntry || this._delayedNavigationEntry;
        if (isRestart) {
            this._onNavigatingTo(backstackEntry);
            this._onNavigatedTo(backstackEntry, false);
        }
        else {
            this._isFirstNavigation = true;
            this._navigateCore(backstackEntry);
            this._isFirstNavigation = false;
        }
        this._delayedNavigationEntry = undefined;
    };
    Frame.prototype._popFromFrameStack = function () {
        if (!this._isInFrameStack) {
            return;
        }
        _super.prototype._popFromFrameStack.call(this);
        if (this._android.hasOwnActivity) {
            this._android.activity.finish();
        }
    };
    Frame.prototype._clearAndroidReference = function () {
    };
    Frame.prototype._printNativeBackStack = function () {
        if (!this._android.activity) {
            return;
        }
        var manager = this._android.activity.getFragmentManager();
        var length = manager.getBackStackEntryCount();
        var i = length - 1;
        console.log("---------------------------");
        console.log("Fragment Manager Back Stack (" + length + ")");
        while (i >= 0) {
            var fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
            console.log("[ " + fragment.toString() + " ]");
        }
    };
    Frame.prototype._printFrameBackStack = function () {
        var length = this.backStack.length;
        var i = length - 1;
        console.log("---------------------------");
        console.log("Frame Back Stack (" + length + ")");
        while (i >= 0) {
            var backstackEntry = this.backStack[i--];
            console.log("[ " + backstackEntry.resolvedPage.id + " ]");
        }
    };
    Frame.prototype._getNavBarVisible = function (page) {
        return this._android.showActionBar;
    };
    return Frame;
})(frameCommon.Frame);
exports.Frame = Frame;
var NativeActivity = {
    get frame() {
        if (this.androidFrame) {
            return this.androidFrame.owner;
        }
        return null;
    },
    get androidFrame() {
        return this[ANDROID_FRAME];
    },
    onCreate: function (savedInstanceState) {
        trace.write("NativeScriptActivity.onCreate(); savedInstanceState: " + savedInstanceState, trace.categories.NativeLifecycle);
        var frameId = this.getIntent().getExtras().getInt(INTENT_EXTRA);
        for (var i = 0; i < framesCache.length; i++) {
            var aliveFrame = framesCache[i].get();
            if (aliveFrame && aliveFrame.frameId === frameId) {
                this[ANDROID_FRAME] = aliveFrame;
                break;
            }
        }
        if (!this.androidFrame) {
            throw new Error("Could not find AndroidFrame for Activity");
        }
        this.super.onCreate(savedInstanceState);
        this.androidFrame.setActivity(this);
        var root = new org.nativescript.widgets.ContentLayout(this);
        this.androidFrame.rootViewGroup = root;
        this.androidFrame.rootViewGroup.setId(this.frame.containerViewId);
        this.setContentView(this.androidFrame.rootViewGroup);
        var isRestart = !!savedInstanceState;
        this.frame._onActivityCreated(isRestart);
    },
    onActivityResult: function (requestCode, resultCode, data) {
        this.super.onActivityResult(requestCode, resultCode, data);
        trace.write("NativeScriptActivity.onActivityResult();", trace.categories.NativeLifecycle);
        var result = application.android.onActivityResult;
        if (result) {
            result(requestCode, resultCode, data);
        }
        application.android.notify({
            eventName: "activityResult",
            object: application.android,
            activity: this,
            requestCode: requestCode,
            resultCode: resultCode,
            intent: data
        });
    },
    onAttachFragment: function (fragment) {
        trace.write("NativeScriptActivity.onAttachFragment() : " + fragment.getTag(), trace.categories.NativeLifecycle);
        this.super.onAttachFragment(fragment);
        if (!fragment.entry) {
            findPageForFragment(fragment, this.frame);
        }
    },
    onStart: function () {
        this.super.onStart();
        trace.write("NativeScriptActivity.onStart();", trace.categories.NativeLifecycle);
        this.frame.onLoaded();
    },
    onStop: function () {
        this.super.onStop();
        trace.write("NativeScriptActivity.onStop();", trace.categories.NativeLifecycle);
        this.frame.onUnloaded();
    },
    onDestroy: function () {
        var frame = this.frame;
        frame._onDetached(true);
        for (var i = 0; i < frame.backStack.length; i++) {
            frame.backStack[i].resolvedPage._onDetached(true);
        }
        this.androidFrame.reset();
        this.super.onDestroy();
        trace.write("NativeScriptActivity.onDestroy();", trace.categories.NativeLifecycle);
    },
    onOptionsItemSelected: function (menuItem) {
        if (!this.androidFrame.hasListeners(frameCommon.Frame.androidOptionSelectedEvent)) {
            return false;
        }
        var data = {
            handled: false,
            eventName: frameCommon.Frame.androidOptionSelectedEvent,
            item: menuItem,
            object: this.androidFrame
        };
        this.androidFrame.notify(data);
        return data.handled;
    },
    onBackPressed: function () {
        trace.write("NativeScriptActivity.onBackPressed;", trace.categories.NativeLifecycle);
        var args = {
            eventName: "activityBackPressed",
            object: application.android,
            activity: this,
            cancel: false,
        };
        application.android.notify(args);
        if (args.cancel) {
            return;
        }
        if (!frameCommon.goBack()) {
            this.super.onBackPressed();
        }
    },
    onLowMemory: function () {
        gc();
        java.lang.System.gc();
        this.super.onLowMemory();
        application.notify({ eventName: application.lowMemoryEvent, object: this, android: this });
    },
    onTrimMemory: function (level) {
        gc();
        java.lang.System.gc();
        this.super.onTrimMemory(level);
    }
};
var framesCounter = 0;
var framesCache = new Array();
var AndroidFrame = (function (_super) {
    __extends(AndroidFrame, _super);
    function AndroidFrame(owner) {
        _super.call(this);
        this.hasOwnActivity = false;
        this.showActionBar = false;
        this._owner = owner;
        this.frameId = framesCounter++;
        framesCache.push(new WeakRef(this));
    }
    Object.defineProperty(AndroidFrame.prototype, "activity", {
        get: function () {
            if (this._activity) {
                return this._activity;
            }
            var currView = this._owner.parent;
            while (currView) {
                if (currView instanceof Frame) {
                    return currView.android.activity;
                }
                currView = currView.parent;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "actionBar", {
        get: function () {
            var activity = this.currentActivity;
            if (!activity) {
                return undefined;
            }
            var bar = activity.getActionBar();
            if (!bar) {
                return undefined;
            }
            return bar;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "currentActivity", {
        get: function () {
            var activity = this.activity;
            if (activity) {
                return activity;
            }
            var stack = frameCommon.stack(), length = stack.length, i = length - 1, frame;
            for (i; i >= 0; i--) {
                frame = stack[i];
                activity = frame.android.activity;
                if (activity) {
                    return activity;
                }
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "owner", {
        get: function () {
            return this._owner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "cachePagesOnNavigate", {
        get: function () {
            return this._cachePagesOnNavigate;
        },
        set: function (value) {
            if (this._cachePagesOnNavigate !== value) {
                if (this._owner.backStack.length > 0) {
                    throw new Error("Cannot set cachePagesOnNavigate if there are items in the back stack.");
                }
                this._cachePagesOnNavigate = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    AndroidFrame.prototype.onActivityRequested = function (intent) {
        if (this.activity) {
            throw new Error("Frame already attached to an Activity");
        }
        intent.putExtra(INTENT_EXTRA, this.frameId);
        this.hasOwnActivity = true;
        return this.createActivity(intent);
    };
    AndroidFrame.prototype.canGoBack = function () {
        if (!this._activity) {
            return false;
        }
        return this._activity.getIntent().getAction() !== android.content.Intent.ACTION_MAIN;
    };
    AndroidFrame.prototype.reset = function () {
        delete this.rootViewGroup[OWNER];
        this._activity = undefined;
        this.rootViewGroup = undefined;
    };
    AndroidFrame.prototype.setActivity = function (value) {
        this._activity = value;
    };
    AndroidFrame.prototype.createActivity = function (intent) {
        return NativeActivity;
    };
    return AndroidFrame;
})(observable.Observable);
function findPageForFragment(fragment, frame) {
    var fragmentTag = fragment.getTag();
    var page;
    var entry;
    trace.write("Attached fragment with no page: " + fragmentTag, trace.categories.NativeLifecycle);
    if (frame.currentPage && frame.currentPage[TAG] === fragmentTag) {
        page = frame.currentPage;
        entry = frame.currentEntry;
        trace.write("Current page matches fragment: " + fragmentTag, trace.categories.NativeLifecycle);
    }
    else {
        var backStack = frame.backStack;
        for (var i = 0; i < backStack.length; i++) {
            entry = backStack[i];
            if (backStack[i].resolvedPage[TAG] === fragmentTag) {
                entry = backStack[i];
                break;
            }
        }
        if (entry) {
            trace.write("Found entry:" + entry + " for fragment: " + fragmentTag, trace.categories.NativeLifecycle);
            page = entry.resolvedPage;
        }
    }
    if (page) {
        fragment.frame = frame;
        fragment.entry = entry;
        page[TAG] = fragmentTag;
    }
    else {
    }
}
function startActivity(activity, entry) {
    var intent = new android.content.Intent(activity, com.tns.NativeScriptActivity.class);
    intent.setAction(android.content.Intent.ACTION_DEFAULT);
    activity.startActivity(intent);
}
