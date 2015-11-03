var xml = require("xml");
var KNOWNTEMPLATES = "knownTemplates";
var TemplateBuilder = (function () {
    function TemplateBuilder(templateProperty) {
        this._items = new Array();
        this._templateProperty = templateProperty;
        this._nestingLevel = 0;
    }
    Object.defineProperty(TemplateBuilder.prototype, "elementName", {
        get: function () {
            return this._templateProperty.elementName;
        },
        enumerable: true,
        configurable: true
    });
    TemplateBuilder.prototype.handleElement = function (args) {
        if (args.eventType === xml.ParserEventType.StartElement) {
            this.addStartElement(args.prefix, args.namespace, args.elementName, args.attributes);
        }
        else if (args.eventType === xml.ParserEventType.EndElement) {
            this.addEndElement(args.prefix, args.elementName);
        }
        if (this.hasFinished()) {
            this.build();
            return true;
        }
        else {
            return false;
        }
    };
    TemplateBuilder.prototype.addStartElement = function (prefix, namespace, elementName, attributes) {
        this._nestingLevel++;
        this._items.push("<" +
            getElementNameWithPrefix(prefix, elementName) +
            (namespace ? " " + getNamespace(prefix, namespace) : "") +
            (attributes ? " " + getAttributesAsString(attributes) : "") +
            ">");
    };
    TemplateBuilder.prototype.addEndElement = function (prefix, elementName) {
        this._nestingLevel--;
        if (!this.hasFinished()) {
            this._items.push("</" + getElementNameWithPrefix(prefix, elementName) + ">");
        }
    };
    TemplateBuilder.prototype.hasFinished = function () {
        return this._nestingLevel < 0;
    };
    TemplateBuilder.prototype.build = function () {
        if (this._templateProperty.name in this._templateProperty.parent.component) {
            this._templateProperty.parent.component[this._templateProperty.name] = this._items.join("");
        }
    };
    return TemplateBuilder;
})();
exports.TemplateBuilder = TemplateBuilder;
function isKnownTemplate(name, exports) {
    return KNOWNTEMPLATES in exports && exports[KNOWNTEMPLATES] && name in exports[KNOWNTEMPLATES];
}
exports.isKnownTemplate = isKnownTemplate;
function getAttributesAsString(attributes) {
    var result = [];
    for (var item in attributes) {
        result.push(item + '="' + attributes[item] + '"');
    }
    return result.join(" ");
}
function getElementNameWithPrefix(prefix, elementName) {
    return (prefix ? prefix + ":" : "") + elementName;
}
function getNamespace(prefix, namespace) {
    return 'xmlns:' + prefix + '="' + namespace + '"';
}
