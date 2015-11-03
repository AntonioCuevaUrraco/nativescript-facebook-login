var common = require("./animation-common");
var utils = require("utils/utils");
var color = require("color");
var trace = require("trace");
var types = require("utils/types");
global.moduleMerge(common, exports);
var floatType = java.lang.Float.class.getField("TYPE").get(null);
var argbEvaluator = new android.animation.ArgbEvaluator();
var Animation = (function (_super) {
    __extends(Animation, _super);
    function Animation(animationDefinitions, playSequentially) {
        _super.call(this, animationDefinitions, playSequentially);
        var that = this;
        this._animatorListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator) {
                that._onAndroidAnimationStart();
            },
            onAnimationRepeat: function (animator) {
                that._onAndroidAnimationRepeat();
            },
            onAnimationEnd: function (animator) {
                that._onAndroidAnimationEnd();
            },
            onAnimationCancel: function (animator) {
                that._onAndroidAnimationCancel();
            }
        });
    }
    Animation.prototype.play = function () {
        var animationFinishedPromise = _super.prototype.play.call(this);
        var i;
        var length;
        this._animators = new Array();
        this._propertyUpdateCallbacks = new Array();
        this._propertyResetCallbacks = new Array();
        i = 0;
        length = this._propertyAnimations.length;
        for (; i < length; i++) {
            this._createAnimators(this._propertyAnimations[i]);
        }
        this._nativeAnimatorsArray = java.lang.reflect.Array.newInstance(android.animation.Animator.class, this._animators.length);
        i = 0;
        length = this._animators.length;
        for (; i < length; i++) {
            this._nativeAnimatorsArray[i] = this._animators[i];
        }
        this._animatorSet = new android.animation.AnimatorSet();
        this._animatorSet.addListener(this._animatorListener);
        if (this._playSequentially) {
            this._animatorSet.playSequentially(this._nativeAnimatorsArray);
        }
        else {
            this._animatorSet.playTogether(this._nativeAnimatorsArray);
        }
        trace.write("Starting " + this._nativeAnimatorsArray.length + " animations " + (this._playSequentially ? "sequentially." : "together."), trace.categories.Animation);
        this._animatorSet.start();
        return animationFinishedPromise;
    };
    Animation.prototype.cancel = function () {
        _super.prototype.cancel.call(this);
        trace.write("Cancelling AnimatorSet.", trace.categories.Animation);
        this._animatorSet.cancel();
    };
    Animation.prototype._onAndroidAnimationStart = function () {
        trace.write("AndroidAnimation._onAndroidAnimationStart.", trace.categories.Animation);
    };
    Animation.prototype._onAndroidAnimationRepeat = function () {
        trace.write("AndroidAnimation._onAndroidAnimationRepeat.", trace.categories.Animation);
    };
    Animation.prototype._onAndroidAnimationEnd = function () {
        trace.write("AndroidAnimation._onAndroidAnimationEnd.", trace.categories.Animation);
        if (!this.isPlaying) {
            return;
        }
        var i = 0;
        var length = this._propertyUpdateCallbacks.length;
        for (; i < length; i++) {
            this._propertyUpdateCallbacks[i]();
        }
        this._resolveAnimationFinishedPromise();
    };
    Animation.prototype._onAndroidAnimationCancel = function () {
        trace.write("AndroidAnimation._onAndroidAnimationCancel.", trace.categories.Animation);
        var i = 0;
        var length = this._propertyResetCallbacks.length;
        for (; i < length; i++) {
            this._propertyResetCallbacks[i]();
        }
        this._rejectAnimationFinishedPromise();
    };
    Animation.prototype._createAnimators = function (propertyAnimation) {
        trace.write("Creating ObjectAnimator(s) for animation: " + common.Animation._getAnimationInfo(propertyAnimation) + "...", trace.categories.Animation);
        if (types.isNullOrUndefined(propertyAnimation.target)) {
            throw new Error("Animation target cannot be null or undefined!");
        }
        if (types.isNullOrUndefined(propertyAnimation.property)) {
            throw new Error("Animation property cannot be null or undefined!");
        }
        if (types.isNullOrUndefined(propertyAnimation.value)) {
            throw new Error("Animation value cannot be null or undefined!");
        }
        var nativeArray;
        var nativeView = propertyAnimation.target._nativeView;
        var animators = new Array();
        var propertyUpdateCallbacks = new Array();
        var propertyResetCallbacks = new Array();
        var animator;
        var originalValue;
        var density = utils.layout.getDisplayDensity();
        switch (propertyAnimation.property) {
            case common.Properties.opacity:
                originalValue = nativeView.getAlpha();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "alpha", nativeArray));
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.opacity = propertyAnimation.value; });
                propertyResetCallbacks.push(function () { nativeView.setAlpha(originalValue); });
                break;
            case common.Properties.backgroundColor:
                originalValue = nativeView.getBackground();
                nativeArray = java.lang.reflect.Array.newInstance(java.lang.Object.class, 2);
                nativeArray[0] = propertyAnimation.target.backgroundColor ? java.lang.Integer.valueOf(propertyAnimation.target.backgroundColor.argb) : java.lang.Integer.valueOf(-1);
                nativeArray[1] = java.lang.Integer.valueOf(propertyAnimation.value.argb);
                animator = android.animation.ValueAnimator.ofObject(argbEvaluator, nativeArray);
                animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
                    onAnimationUpdate: function (animator) {
                        var argb = animator.getAnimatedValue().intValue();
                        propertyAnimation.target.backgroundColor = new color.Color(argb);
                    }
                }));
                animators.push(animator);
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.backgroundColor = propertyAnimation.value; });
                propertyResetCallbacks.push(function () { nativeView.setBackground(originalValue); });
                break;
            case common.Properties.translate:
                originalValue = nativeView.getTranslationX();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.x * density;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "translationX", nativeArray));
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.translateX = propertyAnimation.value.x; });
                propertyResetCallbacks.push(function () { nativeView.setTranslationX(originalValue); });
                originalValue = nativeView.getTranslationY();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.y * density;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "translationY", nativeArray));
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.translateY = propertyAnimation.value.y; });
                propertyResetCallbacks.push(function () { nativeView.setTranslationY(originalValue); });
                break;
            case common.Properties.rotate:
                originalValue = nativeView.getRotation();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "rotation", nativeArray));
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.rotate = propertyAnimation.value; });
                propertyResetCallbacks.push(function () { nativeView.setRotation(originalValue); });
                break;
            case common.Properties.scale:
                originalValue = nativeView.getScaleX();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.x;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "scaleX", nativeArray));
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.scaleX = propertyAnimation.value.x; });
                propertyResetCallbacks.push(function () { nativeView.setScaleX(originalValue); });
                originalValue = nativeView.getScaleY();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.y;
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "scaleY", nativeArray));
                propertyUpdateCallbacks.push(function () { propertyAnimation.target.scaleY = propertyAnimation.value.y; });
                propertyResetCallbacks.push(function () { nativeView.setScaleY(originalValue); });
                break;
            default:
                throw new Error("Cannot animate " + propertyAnimation.property);
                break;
        }
        var i = 0;
        var length = animators.length;
        for (; i < length; i++) {
            if (propertyAnimation.duration !== undefined) {
                animators[i].setDuration(propertyAnimation.duration);
            }
            if (propertyAnimation.delay !== undefined) {
                animators[i].setStartDelay(propertyAnimation.delay);
            }
            if (propertyAnimation.iterations !== undefined) {
                if (propertyAnimation.iterations === Number.POSITIVE_INFINITY) {
                    animators[i].setRepeatCount(android.view.animation.Animation.INFINITE);
                }
                else {
                    animators[i].setRepeatCount(propertyAnimation.iterations - 1);
                }
            }
            if (propertyAnimation.curve !== undefined) {
                animators[i].setInterpolator(propertyAnimation.curve);
            }
            trace.write("ObjectAnimator created: " + animators[i], trace.categories.Animation);
        }
        this._animators = this._animators.concat(animators);
        this._propertyUpdateCallbacks = this._propertyUpdateCallbacks.concat(propertyUpdateCallbacks);
        this._propertyResetCallbacks = this._propertyResetCallbacks.concat(propertyResetCallbacks);
    };
    return Animation;
})(common.Animation);
exports.Animation = Animation;
