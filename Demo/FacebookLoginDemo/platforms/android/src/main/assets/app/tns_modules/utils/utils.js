var common = require("./utils-common");
var trace = require("trace");
global.moduleMerge(common, exports);
var layout;
(function (layout) {
    var density = -1;
    var metrics;
    var MODE_SHIFT = 30;
    var MODE_MASK = 0x3 << MODE_SHIFT;
    var sdkVersion = -1;
    var useOldMeasureSpec = false;
    function makeMeasureSpec(size, mode) {
        if (sdkVersion === -1) {
            sdkVersion = ad.getApplicationContext().getApplicationInfo().targetSdkVersion;
            useOldMeasureSpec = sdkVersion <= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1;
        }
        if (useOldMeasureSpec) {
            return size + mode;
        }
        return (size & ~MODE_MASK) | (mode & MODE_MASK);
    }
    layout.makeMeasureSpec = makeMeasureSpec;
    function getDisplayDensity() {
        if (density === -1) {
            density = getDisplayMetrics().density;
        }
        return density;
    }
    layout.getDisplayDensity = getDisplayDensity;
    function getDisplayMetrics() {
        if (!metrics) {
            metrics = ad.getApplicationContext().getResources().getDisplayMetrics();
        }
        return metrics;
    }
})(layout = exports.layout || (exports.layout = {}));
var ad;
(function (ad) {
    function getApplication() { return com.tns.NativeScriptApplication.getInstance(); }
    ad.getApplication = getApplication;
    function getApplicationContext() { return getApplication().getApplicationContext(); }
    ad.getApplicationContext = getApplicationContext;
    var collections;
    (function (collections) {
        function stringArrayToStringSet(str) {
            var hashSet = new java.util.HashSet();
            if ("undefined" !== typeof str) {
                for (var element in str) {
                    hashSet.add('' + str[element]);
                }
            }
            return hashSet;
        }
        collections.stringArrayToStringSet = stringArrayToStringSet;
        function stringSetToStringArray(stringSet) {
            var arr = [];
            if ("undefined" !== typeof stringSet) {
                var it = stringSet.iterator();
                while (it.hasNext()) {
                    var element = '' + it.next();
                    arr.push(element);
                }
            }
            return arr;
        }
        collections.stringSetToStringArray = stringSetToStringArray;
    })(collections = ad.collections || (ad.collections = {}));
    var resources;
    (function (resources_1) {
        var attr;
        var attrCache = new Map();
        function getDrawableId(name) {
            return getId(":drawable/" + name);
        }
        resources_1.getDrawableId = getDrawableId;
        function getStringId(name) {
            return getId(":string/" + name);
        }
        resources_1.getStringId = getStringId;
        function getId(name) {
            var resources = getApplicationContext().getResources();
            var packageName = getApplicationContext().getPackageName();
            var uri = packageName + name;
            return resources.getIdentifier(uri, null, null);
        }
        resources_1.getId = getId;
        function getPalleteColor(name, context) {
            if (attrCache.has(name)) {
                return attrCache.get(name);
            }
            var result = 0;
            try {
                if (!attr) {
                    attr = java.lang.Class.forName("android.support.v7.appcompat.R$attr");
                }
                var colorID = 0;
                var field = attr.getField(name);
                if (field) {
                    colorID = field.getInt(null);
                }
                if (colorID) {
                    var typedValue = new android.util.TypedValue();
                    context.getTheme().resolveAttribute(colorID, typedValue, true);
                    result = typedValue.data;
                }
            }
            catch (ex) {
                trace.write("Cannot get pallete color: " + name, trace.categories.Error, trace.messageType.error);
            }
            attrCache.set(name, result);
            return result;
        }
        resources_1.getPalleteColor = getPalleteColor;
    })(resources = ad.resources || (ad.resources = {}));
})(ad = exports.ad || (exports.ad = {}));
function GC() {
    gc();
}
exports.GC = GC;
function openUrl(location) {
    var context = ad.getApplicationContext();
    try {
        var intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(location.trim()));
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
    catch (e) {
        console.error("Error in OpenURL", e);
        return false;
    }
    return true;
}
exports.openUrl = openUrl;
