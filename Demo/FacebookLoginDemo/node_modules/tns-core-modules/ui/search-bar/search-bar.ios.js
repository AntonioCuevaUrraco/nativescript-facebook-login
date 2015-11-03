var common = require("./search-bar-common");
var color = require("color");
var types = require("utils/types");
function onTextPropertyChanged(data) {
    var bar = data.object;
    bar.ios.text = data.newValue;
}
common.SearchBar.textProperty.metadata.onSetNativeValue = onTextPropertyChanged;
function onTextFieldBackgroundColorPropertyChanged(data) {
    var bar = data.object;
    if (data.newValue instanceof color.Color) {
        var tf = bar._textField;
        if (tf) {
            tf.backgroundColor = data.newValue.ios;
        }
    }
}
common.SearchBar.textFieldBackgroundColorProperty.metadata.onSetNativeValue = onTextFieldBackgroundColorPropertyChanged;
function onTextFieldHintColorPropertyChanged(data) {
    try {
    }
    catch (Err) {
    }
}
common.SearchBar.textFieldHintColorProperty.metadata.onSetNativeValue = onTextFieldHintColorPropertyChanged;
function onHintPropertyChanged(data) {
    var bar = data.object;
    if (!bar.ios) {
        return;
    }
    var newValue = data.newValue;
    if (types.isString(newValue)) {
        bar.ios.placeholder = newValue;
    }
}
common.SearchBar.hintProperty.metadata.onSetNativeValue = onHintPropertyChanged;
global.moduleMerge(common, exports);
var UISearchBarDelegateImpl = (function (_super) {
    __extends(UISearchBarDelegateImpl, _super);
    function UISearchBarDelegateImpl() {
        _super.apply(this, arguments);
    }
    UISearchBarDelegateImpl.new = function () {
        return _super.new.call(this);
    };
    UISearchBarDelegateImpl.prototype.initWithOwner = function (owner) {
        this._owner = owner;
        return this;
    };
    UISearchBarDelegateImpl.prototype.searchBarTextDidChange = function (searchBar, searchText) {
        this._owner._onPropertyChangedFromNative(common.SearchBar.textProperty, searchText);
        if (searchText === "" && this._searchText !== searchText) {
            this._owner._emit(common.SearchBar.clearEvent);
        }
        this._searchText = searchText;
    };
    UISearchBarDelegateImpl.prototype.searchBarCancelButtonClicked = function (searchBar) {
        searchBar.resignFirstResponder();
        this._owner._emit(common.SearchBar.clearEvent);
    };
    UISearchBarDelegateImpl.prototype.searchBarSearchButtonClicked = function (searchBar) {
        searchBar.resignFirstResponder();
        this._owner._emit(common.SearchBar.submitEvent);
    };
    UISearchBarDelegateImpl.ObjCProtocols = [UISearchBarDelegate];
    return UISearchBarDelegateImpl;
})(NSObject);
var SearchBar = (function (_super) {
    __extends(SearchBar, _super);
    function SearchBar() {
        _super.call(this);
        this._ios = new UISearchBar();
        this._delegate = UISearchBarDelegateImpl.new().initWithOwner(this);
    }
    SearchBar.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._ios.delegate = this._delegate;
        this._textField = SearchBar.findTextField(this.ios);
    };
    SearchBar.prototype.onUnloaded = function () {
        this._ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(SearchBar.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    SearchBar.findTextField = function (view) {
        for (var i_1 = 0, l = view.subviews.count; i_1 < l; i_1++) {
            var v = view.subviews[i_1];
            if (v instanceof UITextField) {
                return v;
            }
            else if (v.subviews.count > 0) {
                return SearchBar.findTextField(v);
            }
        }
        return undefined;
    };
    return SearchBar;
})(common.SearchBar);
exports.SearchBar = SearchBar;
