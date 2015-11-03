var types = require("utils/types");
var proxy = require("ui/core/proxy");
var style = require("../styling/style");
var styling = require("ui/styling");
var visualStateConstants = require("ui/styling/visual-state-constants");
var trace = require("trace");
var dependencyObservable = require("ui/core/dependency-observable");
var gestures = require("ui/gestures");
var bindable = require("ui/core/bindable");
var styleScope = require("../styling/style-scope");
var enums = require("ui/enums");
var utils = require("utils/utils");
var animationModule = require("ui/animation");
var special_properties_1 = require("ui/builder/special-properties");
special_properties_1.registerSpecialProperty("class", function (instance, propertyValue) {
    instance.className = propertyValue;
});
function getEventOrGestureName(name) {
    return name.indexOf("on") === 0 ? name.substr(2, name.length - 2) : name;
}
function isEventOrGesture(name, view) {
    if (types.isString(name)) {
        var eventOrGestureName = getEventOrGestureName(name);
        var evt = eventOrGestureName + "Event";
        return view.constructor && evt in view.constructor ||
            gestures.fromString(eventOrGestureName.toLowerCase()) !== undefined;
    }
    return false;
}
exports.isEventOrGesture = isEventOrGesture;
function getViewById(view, id) {
    if (!view) {
        return undefined;
    }
    if (view.id === id) {
        return view;
    }
    var retVal;
    var descendantsCallback = function (child) {
        if (child.id === id) {
            retVal = child;
            return false;
        }
        return true;
    };
    eachDescendant(view, descendantsCallback);
    return retVal;
}
exports.getViewById = getViewById;
function eachDescendant(view, callback) {
    if (!callback || !view) {
        return;
    }
    var continueIteration;
    var localCallback = function (child) {
        continueIteration = callback(child);
        if (continueIteration) {
            child._eachChildView(localCallback);
        }
        return continueIteration;
    };
    view._eachChildView(localCallback);
}
exports.eachDescendant = eachDescendant;
function getAncestor(view, criterion) {
    var matcher = null;
    if (typeof criterion === "string") {
        matcher = function (view) { return view.typeName === criterion; };
    }
    else {
        matcher = function (view) { return view instanceof criterion; };
    }
    for (var parent_1 = view.parent; parent_1 != null; parent_1 = parent_1.parent) {
        if (matcher(parent_1)) {
            return parent_1;
        }
    }
    return null;
}
exports.getAncestor = getAncestor;
var viewIdCounter = 0;
function onCssClassPropertyChanged(data) {
    var view = data.object;
    if (types.isString(data.newValue)) {
        view._cssClasses = data.newValue.split(" ");
    }
    else {
        view._cssClasses.length = 0;
    }
}
var idProperty = new dependencyObservable.Property("id", "View", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle));
var cssClassProperty = new dependencyObservable.Property("cssClass", "View", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged));
var classNameProperty = new dependencyObservable.Property("className", "View", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged));
var translateXProperty = new dependencyObservable.Property("translateX", "View", new proxy.PropertyMetadata(0));
var translateYProperty = new dependencyObservable.Property("translateY", "View", new proxy.PropertyMetadata(0));
var scaleXProperty = new dependencyObservable.Property("scaleX", "View", new proxy.PropertyMetadata(1));
var scaleYProperty = new dependencyObservable.Property("scaleY", "View", new proxy.PropertyMetadata(1));
var rotateProperty = new dependencyObservable.Property("rotate", "View", new proxy.PropertyMetadata(0));
var isEnabledProperty = new dependencyObservable.Property("isEnabled", "View", new proxy.PropertyMetadata(true));
var isUserInteractionEnabledProperty = new dependencyObservable.Property("isUserInteractionEnabled", "View", new proxy.PropertyMetadata(true));
var View = (function (_super) {
    __extends(View, _super);
    function View(options) {
        _super.call(this);
        this._isVisibleCache = true;
        this._measuredWidth = Number.NaN;
        this._measuredHeight = Number.NaN;
        this._oldWidthMeasureSpec = Number.NaN;
        this._oldHeightMeasureSpec = Number.NaN;
        this._oldLeft = 0;
        this._oldTop = 0;
        this._oldRight = 0;
        this._oldBottom = 0;
        this._isLayoutValid = false;
        this._isAddedToNativeVisualTree = false;
        this._cssClasses = [];
        this._gestureObservers = {};
        this._options = options;
        this._style = new style.Style(this);
        this._domId = viewIdCounter++;
        this._visualState = visualStateConstants.Normal;
    }
    View.prototype.getGestureObservers = function (type) {
        return this._gestureObservers[type];
    };
    View.prototype.observe = function (type, callback, thisArg) {
        if (!this._gestureObservers[type]) {
            this._gestureObservers[type] = [];
        }
        this._gestureObservers[type].push(gestures.observe(this, type, callback, thisArg));
    };
    View.prototype.addEventListener = function (arg, callback, thisArg) {
        if (types.isString(arg)) {
            arg = getEventOrGestureName(arg);
            var gesture = gestures.fromString(arg);
            if (gesture && !this._isEvent(arg)) {
                this.observe(gesture, callback, thisArg);
            }
            else {
                var events = arg.split(",");
                if (events.length > 0) {
                    for (var i_1 = 0; i_1 < events.length; i_1++) {
                        var evt = events[i_1].trim();
                        var gst = gestures.fromString(evt);
                        if (gst && !this._isEvent(arg)) {
                            this.observe(gst, callback, thisArg);
                        }
                        else {
                            _super.prototype.addEventListener.call(this, evt, callback, thisArg);
                        }
                    }
                }
                else {
                    _super.prototype.addEventListener.call(this, arg, callback, thisArg);
                }
            }
        }
        else if (types.isNumber(arg)) {
            this.observe(arg, callback, thisArg);
        }
    };
    View.prototype.removeEventListener = function (arg, callback, thisArg) {
        if (types.isString(arg)) {
            var gesture = gestures.fromString(arg);
            if (gesture && !this._isEvent(arg)) {
                this._disconnectGestureObservers(gesture);
            }
            else {
                var events = arg.split(",");
                if (events.length > 0) {
                    for (var i_2 = 0; i_2 < events.length; i_2++) {
                        var evt = events[i_2].trim();
                        var gst = gestures.fromString(evt);
                        if (gst && !this._isEvent(arg)) {
                            this._disconnectGestureObservers(gst);
                        }
                        else {
                            _super.prototype.removeEventListener.call(this, evt, callback, thisArg);
                        }
                    }
                }
                else {
                    _super.prototype.removeEventListener.call(this, arg, callback, thisArg);
                }
            }
        }
        else if (types.isNumber(arg)) {
            this._disconnectGestureObservers(arg);
        }
    };
    View.prototype._isEvent = function (name) {
        return this.constructor && name + "Event" in this.constructor;
    };
    View.prototype._disconnectGestureObservers = function (type) {
        var observers = this.getGestureObservers(type);
        for (var i_3 = 0; i_3 < observers.length; i_3++) {
            observers[i_3].disconnect();
        }
    };
    View.prototype.getViewById = function (id) {
        return getViewById(this, id);
    };
    Object.defineProperty(View.prototype, "borderRadius", {
        get: function () {
            return this.style.borderRadius;
        },
        set: function (value) {
            this.style.borderRadius = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "borderWidth", {
        get: function () {
            return this.style.borderWidth;
        },
        set: function (value) {
            this.style.borderWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "borderColor", {
        get: function () {
            return this.style.borderColor;
        },
        set: function (value) {
            this.style.borderColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "color", {
        get: function () {
            return this.style.color;
        },
        set: function (value) {
            this.style.color = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "backgroundColor", {
        get: function () {
            return this.style.backgroundColor;
        },
        set: function (value) {
            this.style.backgroundColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "backgroundImage", {
        get: function () {
            return this.style.backgroundImage;
        },
        set: function (value) {
            this.style.backgroundImage = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "minWidth", {
        get: function () {
            return this.style.minWidth;
        },
        set: function (value) {
            this.style.minWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "minHeight", {
        get: function () {
            return this.style.minHeight;
        },
        set: function (value) {
            this.style.minHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "width", {
        get: function () {
            return this.style.width;
        },
        set: function (value) {
            this.style.width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "height", {
        get: function () {
            return this.style.height;
        },
        set: function (value) {
            this.style.height = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "margin", {
        get: function () {
            return this.style.margin;
        },
        set: function (value) {
            this.style.margin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "marginLeft", {
        get: function () {
            return this.style.marginLeft;
        },
        set: function (value) {
            this.style.marginLeft = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "marginTop", {
        get: function () {
            return this.style.marginTop;
        },
        set: function (value) {
            this.style.marginTop = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "marginRight", {
        get: function () {
            return this.style.marginRight;
        },
        set: function (value) {
            this.style.marginRight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "marginBottom", {
        get: function () {
            return this.style.marginBottom;
        },
        set: function (value) {
            this.style.marginBottom = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "horizontalAlignment", {
        get: function () {
            return this.style.horizontalAlignment;
        },
        set: function (value) {
            this.style.horizontalAlignment = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "verticalAlignment", {
        get: function () {
            return this.style.verticalAlignment;
        },
        set: function (value) {
            this.style.verticalAlignment = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "visibility", {
        get: function () {
            return this.style.visibility;
        },
        set: function (value) {
            this.style.visibility = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "opacity", {
        get: function () {
            return this.style.opacity;
        },
        set: function (value) {
            this.style.opacity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "translateX", {
        get: function () {
            return this._getValue(View.translateXProperty);
        },
        set: function (value) {
            this._setValue(View.translateXProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "translateY", {
        get: function () {
            return this._getValue(View.translateYProperty);
        },
        set: function (value) {
            this._setValue(View.translateYProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "scaleX", {
        get: function () {
            return this._getValue(View.scaleXProperty);
        },
        set: function (value) {
            this._setValue(View.scaleXProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "scaleY", {
        get: function () {
            return this._getValue(View.scaleYProperty);
        },
        set: function (value) {
            this._setValue(View.scaleYProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "rotate", {
        get: function () {
            return this._getValue(View.rotateProperty);
        },
        set: function (value) {
            this._setValue(View.rotateProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "isEnabled", {
        get: function () {
            return this._getValue(View.isEnabledProperty);
        },
        set: function (value) {
            this._setValue(View.isEnabledProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "page", {
        get: function () {
            if (this.parent) {
                return this.parent.page;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "isUserInteractionEnabled", {
        get: function () {
            return this._getValue(View.isUserInteractionEnabledProperty);
        },
        set: function (value) {
            this._setValue(View.isUserInteractionEnabledProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "id", {
        get: function () {
            return this._getValue(View.idProperty);
        },
        set: function (value) {
            this._setValue(View.idProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "cssClass", {
        get: function () {
            return this._getValue(View.cssClassProperty);
        },
        set: function (value) {
            this._setValue(View.cssClassProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "className", {
        get: function () {
            return this._getValue(View.cssClassProperty);
        },
        set: function (value) {
            this._setValue(View.cssClassProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "style", {
        get: function () {
            return this._style;
        },
        set: function (value) {
            throw new Error("View.style property is read-only.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "isLayoutValid", {
        get: function () {
            return this._isLayoutValid;
        },
        set: function (value) {
            throw new Error("isLayoutValid is read-only property.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "visualState", {
        get: function () {
            return this._visualState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "cssType", {
        get: function () {
            return this.typeName.toLowerCase();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "isLoaded", {
        get: function () {
            return this._isLoaded;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.onLoaded = function () {
        this._isLoaded = true;
        this._loadEachChildView();
        this._applyStyleFromScope();
        this._emit("loaded");
    };
    View.prototype._loadEachChildView = function () {
        if (this._childrenCount > 0) {
            var eachChild = function (child) {
                child.onLoaded();
                return true;
            };
            this._eachChildView(eachChild);
        }
    };
    View.prototype.onUnloaded = function () {
        this._unloadEachChildView();
        this._isLoaded = false;
        this._emit("unloaded");
    };
    View.prototype._unloadEachChildView = function () {
        if (this._childrenCount > 0) {
            var eachChild = function (child) {
                child.onUnloaded();
                return true;
            };
            this._eachChildView(eachChild);
        }
    };
    View.prototype._onPropertyChanged = function (property, oldValue, newValue) {
        _super.prototype._onPropertyChanged.call(this, property, oldValue, newValue);
        if (this._childrenCount > 0) {
            var shouldUpdateInheritableProps = ((property.metadata && property.metadata.inheritable) &&
                !(property instanceof styling.Property));
            var that = this;
            if (shouldUpdateInheritableProps) {
                var notifyEachChild = function (child) {
                    child._setValue(property, that._getValue(property), dependencyObservable.ValueSource.Inherited);
                    return true;
                };
                this._updatingInheritedProperties = true;
                this._eachChildView(notifyEachChild);
                this._updatingInheritedProperties = false;
            }
        }
        this._checkMetadataOnPropertyChanged(property.metadata);
    };
    View.prototype._isInheritedChange = function () {
        if (this._updatingInheritedProperties) {
            return true;
        }
        var parentView;
        parentView = (this.parent);
        while (parentView) {
            if (parentView._updatingInheritedProperties) {
                return true;
            }
            parentView = (parentView.parent);
        }
        return false;
    };
    View.prototype._checkMetadataOnPropertyChanged = function (metadata) {
        if (metadata.affectsLayout) {
            this.requestLayout();
        }
        if (metadata.affectsStyle) {
            this.style._resetCssValues();
            this._applyStyleFromScope();
        }
    };
    View.prototype.measure = function (widthMeasureSpec, heightMeasureSpec) {
        this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
    };
    View.prototype.layout = function (left, top, right, bottom) {
        this._setCurrentLayoutBounds(left, top, right, bottom);
    };
    View.prototype.getMeasuredWidth = function () {
        return this._measuredWidth & utils.layout.MEASURED_SIZE_MASK;
    };
    View.prototype.getMeasuredHeight = function () {
        return this._measuredHeight & utils.layout.MEASURED_SIZE_MASK;
    };
    View.prototype.setMeasuredDimension = function (measuredWidth, measuredHeight) {
        this._measuredWidth = measuredWidth;
        this._measuredHeight = measuredHeight;
        trace.write(this + " :setMeasuredDimension: " + measuredWidth + ", " + measuredHeight, trace.categories.Layout);
    };
    View.prototype.requestLayout = function () {
        this._isLayoutValid = false;
    };
    View.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
    };
    View.prototype.onLayout = function (left, top, right, bottom) {
    };
    View.prototype.layoutNativeView = function (left, top, right, bottom) {
    };
    View.resolveSizeAndState = function (size, specSize, specMode, childMeasuredState) {
        var result = size;
        switch (specMode) {
            case utils.layout.UNSPECIFIED:
                result = size;
                break;
            case utils.layout.AT_MOST:
                if (specSize < size) {
                    result = Math.round(specSize + 0.499) | utils.layout.MEASURED_STATE_TOO_SMALL;
                }
                break;
            case utils.layout.EXACTLY:
                result = specSize;
                break;
        }
        return Math.round(result + 0.499) | (childMeasuredState & utils.layout.MEASURED_STATE_MASK);
    };
    View.layoutChild = function (parent, child, left, top, right, bottom) {
        if (!child || !child._isVisible) {
            return;
        }
        var density = utils.layout.getDisplayDensity();
        var childTop;
        var childLeft;
        var childWidth = child.getMeasuredWidth();
        var childHeight = child.getMeasuredHeight();
        var vAlignment;
        if (!isNaN(child.height) && child.verticalAlignment === enums.VerticalAlignment.stretch) {
            vAlignment = enums.VerticalAlignment.center;
        }
        else {
            vAlignment = child.verticalAlignment;
        }
        switch (vAlignment) {
            case enums.VerticalAlignment.top:
                childTop = top + child.marginTop * density;
                break;
            case enums.VerticalAlignment.center:
                childTop = top + (bottom - top - childHeight + (child.marginTop - child.marginBottom) * density) / 2;
                break;
            case enums.VerticalAlignment.bottom:
                childTop = bottom - childHeight - (child.marginBottom * density);
                break;
            case enums.VerticalAlignment.stretch:
            default:
                childTop = top + child.marginTop * density;
                childHeight = bottom - top - (child.marginTop + child.marginBottom) * density;
                break;
        }
        var hAlignment;
        if (!isNaN(child.width) && child.horizontalAlignment === enums.HorizontalAlignment.stretch) {
            hAlignment = enums.HorizontalAlignment.center;
        }
        else {
            hAlignment = child.horizontalAlignment;
        }
        switch (hAlignment) {
            case enums.HorizontalAlignment.left:
                childLeft = left + child.marginLeft * density;
                break;
            case enums.HorizontalAlignment.center:
                childLeft = left + (right - left - childWidth + (child.marginLeft - child.marginRight) * density) / 2;
                break;
            case enums.HorizontalAlignment.right:
                childLeft = right - childWidth - child.marginRight * density;
                break;
            case enums.HorizontalAlignment.stretch:
            default:
                childLeft = left + child.marginLeft * density;
                childWidth = right - left - (child.marginLeft + child.marginRight) * density;
                break;
        }
        var childRight = Math.round(childLeft + childWidth);
        var childBottom = Math.round(childTop + childHeight);
        childLeft = Math.round(childLeft);
        childTop = Math.round(childTop);
        trace.write(parent + " :layoutChild: " + child + " " + childLeft + ", " + childTop + ", " + childRight + ", " + childBottom, trace.categories.Layout);
        child.layout(childLeft, childTop, childRight, childBottom);
    };
    View.measureChild = function (parent, child, widthMeasureSpec, heightMeasureSpec) {
        var measureWidth = 0;
        var measureHeight = 0;
        if (child && child._isVisible) {
            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);
            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
            trace.write(parent + " :measureChild: " + child + " " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);
            var childWidthMeasureSpec = View.getMeasureSpec(child, width, widthMode, true);
            var childHeightMeasureSpec = View.getMeasureSpec(child, height, heightMode, false);
            child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
            measureWidth = child.getMeasuredWidth();
            measureHeight = child.getMeasuredHeight();
            var density = utils.layout.getDisplayDensity();
            measureWidth = Math.round(measureWidth + (child.marginLeft + child.marginRight) * density);
            measureHeight = Math.round(measureHeight + (child.marginTop + child.marginBottom) * density);
        }
        return { measuredWidth: measureWidth, measuredHeight: measureHeight };
    };
    View.getMeasureSpec = function (view, parentLength, parentSpecMode, horizontal) {
        var density = utils.layout.getDisplayDensity();
        var margins = horizontal ? view.marginLeft + view.marginRight : view.marginTop + view.marginBottom;
        margins = Math.floor(margins * density);
        var resultSize = 0;
        var resultMode = 0;
        var measureLength = Math.max(0, parentLength - margins);
        var childLength = Math.floor((horizontal ? view.width : view.height) * density);
        if (!isNaN(childLength)) {
            if (parentSpecMode !== utils.layout.UNSPECIFIED) {
                resultSize = Math.min(parentLength, childLength);
            }
            else {
                resultSize = childLength;
            }
            resultMode = utils.layout.EXACTLY;
        }
        else {
            switch (parentSpecMode) {
                case utils.layout.EXACTLY:
                    resultSize = measureLength;
                    var stretched = horizontal ? view.horizontalAlignment === enums.HorizontalAlignment.stretch : view.verticalAlignment === enums.VerticalAlignment.stretch;
                    resultMode = stretched ? utils.layout.EXACTLY : utils.layout.AT_MOST;
                    break;
                case utils.layout.AT_MOST:
                    resultSize = measureLength;
                    resultMode = utils.layout.AT_MOST;
                    break;
                case utils.layout.UNSPECIFIED:
                    resultSize = 0;
                    resultMode = utils.layout.UNSPECIFIED;
                    break;
            }
        }
        return utils.layout.makeMeasureSpec(resultSize, resultMode);
    };
    View.prototype._setCurrentMeasureSpecs = function (widthMeasureSpec, heightMeasureSpec) {
        var changed = this._oldWidthMeasureSpec !== widthMeasureSpec || this._oldHeightMeasureSpec !== heightMeasureSpec;
        this._oldWidthMeasureSpec = widthMeasureSpec;
        this._oldHeightMeasureSpec = heightMeasureSpec;
        return changed;
    };
    View.prototype._getCurrentLayoutBounds = function () {
        return { left: this._oldLeft, top: this._oldTop, right: this._oldRight, bottom: this._oldBottom };
    };
    View.prototype._setCurrentLayoutBounds = function (left, top, right, bottom) {
        this._isLayoutValid = true;
        var changed = this._oldLeft !== left || this._oldTop !== top || this._oldRight !== right || this._oldBottom !== bottom;
        this._oldLeft = left;
        this._oldTop = top;
        this._oldRight = right;
        this._oldBottom = bottom;
        return changed;
    };
    View.prototype._applyStyleFromScope = function () {
        var rootPage = this.page;
        if (!rootPage || !rootPage.isLoaded) {
            return;
        }
        var scope = rootPage._getStyleScope();
        scope.applySelectors(this);
    };
    View.prototype._applyInlineStyle = function (inlineStyle) {
        if (types.isString(inlineStyle)) {
            try {
                this.style._beginUpdate();
                styleScope.applyInlineSyle(this, inlineStyle);
            }
            finally {
                this.style._endUpdate();
            }
        }
    };
    View.prototype._onAttached = function (context) {
    };
    View.prototype._onDetached = function (force) {
    };
    View.prototype._createUI = function () {
    };
    View.prototype._onContextChanged = function () {
    };
    Object.defineProperty(View.prototype, "_childrenCount", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype._eachChildView = function (callback) {
    };
    View.prototype._addView = function (view, atIndex) {
        if (!view) {
            throw new Error("Expecting a valid View instance.");
        }
        if (view._parent) {
            throw new Error("View already has a parent. View: " + view + " Parent: " + view._parent);
        }
        view._parent = this;
        this._addViewCore(view, atIndex);
        trace.write("called _addView on view " + this._domId + " for a child " + view._domId, trace.categories.ViewHierarchy);
    };
    View.prototype._addViewCore = function (view, atIndex) {
        this._propagateInheritableProperties(view);
        view.style._inheritStyleProperties();
        if (!view._isAddedToNativeVisualTree) {
            view._isAddedToNativeVisualTree = this._addViewToNativeVisualTree(view, atIndex);
        }
        if (this._isLoaded) {
            view.onLoaded();
        }
    };
    View.prototype._propagateInheritableProperties = function (view) {
        view._inheritProperties(this);
    };
    View.prototype._inheritProperties = function (parentView) {
        var that = this;
        var inheritablePropertySetCallback = function (property) {
            if (property instanceof styling.Property) {
                return true;
            }
            if (property.metadata && property.metadata.inheritable) {
                var baseValue = parentView._getValue(property);
                if (baseValue) {
                    that._setValue(property, baseValue, dependencyObservable.ValueSource.Inherited);
                }
            }
            return true;
        };
        parentView._eachSetProperty(inheritablePropertySetCallback);
    };
    View.prototype._removeView = function (view) {
        if (view._parent !== this) {
            throw new Error("View not added to this instance. View: " + view + " CurrentParent: " + view._parent + " ExpectedParent: " + this);
        }
        this._removeViewCore(view);
        view._parent = undefined;
        trace.write("called _removeView on view " + this._domId + " for a child " + view._domId, trace.categories.ViewHierarchy);
    };
    View.prototype._removeViewCore = function (view) {
        this._removeViewFromNativeVisualTree(view);
        if (view.isLoaded) {
            view.onUnloaded();
        }
        view._setValue(bindable.Bindable.bindingContextProperty, undefined, dependencyObservable.ValueSource.Inherited);
        var inheritablePropertiesSetCallback = function (property) {
            if (property instanceof styling.Property) {
                return true;
            }
            if (property.metadata && property.metadata.inheritable) {
                view._resetValue(property, dependencyObservable.ValueSource.Inherited);
            }
            return true;
        };
        view._eachSetProperty(inheritablePropertiesSetCallback);
    };
    View.prototype._addViewToNativeVisualTree = function (view, atIndex) {
        if (view._isAddedToNativeVisualTree) {
            throw new Error("Child already added to the native visual tree.");
        }
        return true;
    };
    View.prototype._removeViewFromNativeVisualTree = function (view) {
        view._isAddedToNativeVisualTree = false;
    };
    View.prototype._syncNativeProperties = function () {
        _super.prototype._syncNativeProperties.call(this);
        this.style._syncNativeProperties();
    };
    View.prototype._goToVisualState = function (state) {
        trace.write(this + " going to state: " + state, trace.categories.Style);
        if (state === this._visualState || this._requestedVisualState === state) {
            return;
        }
        var vsm = require("ui/styling/visual-state");
        this._visualState = vsm.goToState(this, state);
        this._requestedVisualState = state;
    };
    View.prototype._applyXmlAttribute = function (attribute, value) {
        if (attribute === "style") {
            this._applyInlineStyle(value);
            return true;
        }
        return false;
    };
    View.prototype.setInlineStyle = function (style) {
        if (!types.isString(style)) {
            throw new Error("Parameter should be valid CSS string!");
        }
        this._applyInlineStyle(style);
    };
    View.prototype._updateLayout = function () {
    };
    Object.defineProperty(View.prototype, "_nativeView", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(View.prototype, "_isVisible", {
        get: function () {
            return this._isVisibleCache;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.focus = function () {
        return undefined;
    };
    View.prototype.animate = function (animation) {
        return this.createAnimation(animation).play();
    };
    View.prototype.createAnimation = function (animation) {
        var that = this;
        animation.target = that;
        return new animationModule.Animation([animation]);
    };
    View.loadedEvent = "loaded";
    View.unloadedEvent = "unloaded";
    View.idProperty = idProperty;
    View.cssClassProperty = cssClassProperty;
    View.classNameProperty = classNameProperty;
    View.translateXProperty = translateXProperty;
    View.translateYProperty = translateYProperty;
    View.scaleXProperty = scaleXProperty;
    View.scaleYProperty = scaleYProperty;
    View.rotateProperty = rotateProperty;
    View.isEnabledProperty = isEnabledProperty;
    View.isUserInteractionEnabledProperty = isUserInteractionEnabledProperty;
    return View;
})(proxy.ProxyObject);
exports.View = View;
