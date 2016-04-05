'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    isObject: function isObject(input) {
        return Object.prototype.toString.call(input) === '[object Object]';
    },
    isArray: function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    },
    isDate: function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    },
    isNumber: function isNumber(input) {
        return input instanceof Number || Object.prototype.toString.call(input) === '[object Number]';
    },
    isString: function isString(input) {
        return input instanceof String || Object.prototype.toString.call(input) === '[object String]';
    },
    isFunction: function isFunction(input) {
        return typeof input == "function";
    },

    toObject: function toObject(list, idName, hasNum) {
        hasNum = hasNum === undefined ? false : hasNum;
        idName = idName === undefined ? "id" : idName;
        var listO = {};
        $.each(list, function (i, n) {
            listO[n[idName]] = n;
            if (hasNum) {
                listO[n[idName]].count = i;
            }
        });
        return listO;
    },
    isEqual: function isEqual(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        if (aProps.length != bProps.length) {
            return false;
        }

        var result = true;

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (this.isObject(a[propName])) {
                result = this.isEqual(a[propName], b[propName]);
                if (!result) return false;
            } else if (a[propName] != b[propName]) {
                return false;
            }
        }

        return true;
    }
};