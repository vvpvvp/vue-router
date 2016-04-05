"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _director = require("./director");

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vue = undefined,
    installed = false;
var defaultOption = {
    history: false
};

var getQueryStringArgs = function getQueryStringArgs(qs) {
    var qloc = qs.indexOf("?");
    if (qloc == -1 || qloc == qs.length - 1) {
        return {};
    };
    qs = qs.substring(qloc + 1);
    var args = {},
        items = qs.split("&"),
        len = items.length,
        name = null,
        value = null;
    for (var i = 0; i < len; i++) {
        var item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        args[name] = value;
    }
    return args;
};

var VueRouter = function () {
    function VueRouter(options) {
        _classCallCheck(this, VueRouter);

        if (!installed) {
            throw new Error('Please install the Router with Vue.use() before ' + 'creating an instance.');
        }
        var vueRouter = this;
        this.initDirective();
        this.removeComponents = true;
        this.routerParam = {};
        this.$route = {};
        this.routerNames = {};
        this.components = {};
        this.struct = {};
        this.options = {};
        Object.assign(this.options, defaultOption, options || {});
        this.options.html5history = this.options.history;
        this.options.notfound = function () {
            vueRouter.getRouter().setRoute("/");
        };
        // Object.freeze(this);
        return this;
    }

    _createClass(VueRouter, [{
        key: "start",
        value: function start(vueParam) {
            var vueRouter = this;
            this.vue = new Vue(vueParam);
            this.vue.$nextTick(function () {
                vueRouter.router.init("/");
            });
            return this;
        }
    }, {
        key: "map",
        value: function map(routes) {
            var vueRouter = this;

            vueRouter.dealRoutes({ routes: routes });
            vueRouter.router = (0, _director.Router)(vueRouter.routerParam).configure(vueRouter.options);

            Vue.mixin({
                created: function created() {
                    if (this.$parent) {
                        this.$route = this.$parent.$route;
                    } else {
                        this.$route = {};
                    }
                }
            });

            Vue.component('routerView', {
                data: function data() {
                    return {
                        currentView: ""
                    };
                },

                template: "<component :is=\"currentView\" v-ref:component></component>",
                components: vueRouter.components,
                events: {
                    'changeComponents': function changeComponents(listParam) {
                        var list = [].concat(_toConsumableArray(listParam));
                        if (vueRouter.removeComponents && list.length == 1 && this.currentView == list[0]) {
                            this.currentView = "";
                            this.$nextTick(function () {
                                vueRouter.changeChildren(this, list);
                            });
                        } else {
                            vueRouter.changeChildren(this, list);
                        }
                    },
                    'removeComponents': function removeComponents() {
                        this.$data.currentView = "";
                        return true;
                    }
                }
            });
            return this;
        }
    }, {
        key: "changeChildren",
        value: function changeChildren(route, list) {
            var vueRouter = this;
            if (list.length > 0) {
                var begin = list.pop();
                // route.$route = param;
                if (route.currentView != begin) {
                    route.currentView = begin;
                    route.$nextTick(function () {
                        vueRouter.changeComponents({ list: list, vm: route });
                    });
                } else {
                    vueRouter.changeComponents({ list: list, vm: route });
                }
            } else {
                return true;
            }
        }
    }, {
        key: "ParseUrl",
        value: function ParseUrl(value) {
            var url = undefined,
                vueRouter = this;
            if (_utils2.default.isObject(value)) {
                if (value.path) {
                    url = value.path;
                } else if (value.name) {
                    url = vueRouter.routerNames[value.name].url;
                }
                if (value.params) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = Object.entries(value.params)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _step$value = _slicedToArray(_step.value, 2);

                            var key = _step$value[0];
                            var val = _step$value[1];

                            url = url.replace(new RegExp("\:" + key + "", 'g'), val);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }

                if (value.query) {
                    url += "?" + $.param(value.query);
                }
            }

            if (_utils2.default.isString(value)) {
                url = value;
            }
            return url;
        }
    }, {
        key: "initDirective",
        value: function initDirective() {
            var vueRouter = this;
            Vue.directive('link', {
                params: ['url'],
                update: function update(value) {
                    var url = vueRouter.ParseUrl(value);
                    var el = this.el;
                    if (vueRouter.router.history) {
                        el.href = url;
                        el.addEventListener("click", function (event) {
                            event.preventDefault();
                            vueRouter.go(url);
                        });
                    } else {
                        el.href = "#" + url;
                    }
                }
            });
        }
    }, {
        key: "_getNowPath",
        value: function _getNowPath() {
            var _loc = window.location;
            return _loc.pathname + _loc.hash + _loc.search;
        }
    }, {
        key: "go",
        value: function go(value) {
            var vueRouter = this;
            var url = vueRouter.ParseUrl(value);
            if (vueRouter._getNowPath() != url) {
                vueRouter.router.setRoute(url);
            }
        }
    }, {
        key: "getRouter",
        value: function getRouter() {
            var vueRouter = this;
            if (vueRouter.router) {
                return vueRouter.router;
            } else {
                console.error("Router未配置!");
            }
        }
    }, {
        key: "dealRoutes",
        value: function dealRoutes(_ref) {
            var routes = _ref.routes;
            var _ref$parent_url = _ref.parent_url;
            var parent_url = _ref$parent_url === undefined ? "" : _ref$parent_url;
            var _ref$parent_ids = _ref.parent_ids;
            var parent_ids = _ref$parent_ids === undefined ? [] : _ref$parent_ids;

            var vueRouter = this;
            var count = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                var _loop = function _loop() {
                    var _step2$value = _slicedToArray(_step2.value, 2);

                    var i = _step2$value[0];
                    var route = _step2$value[1];

                    var _id = (parent_ids[0] || "VueRouter") + "_" + count++;
                    var url = (parent_url == "/" ? "" : parent_url) + i;
                    if (_utils2.default.isFunction(route)) {
                        (function () {
                            var list = [].concat(_toConsumableArray(parent_ids));
                            vueRouter.routerParam[url] = function () {
                                vueRouter.removeComponents = false;
                                vueRouter.changeComponents({ list: list, vm: vueRouter.vue, removeComponents: false });
                                route.apply(undefined, arguments);
                            };
                        })();
                    } else if (_utils2.default.isObject(route) && route.component) {
                        (function () {
                            var getParam = function getParam(url) {
                                var ps = [],
                                    patt = /\/\:(\w+)/g,
                                    result = undefined;
                                while ((result = patt.exec(url)) != null) {
                                    ps.push(result[1]);
                                }
                                return ps;
                            };

                            vueRouter.components[_id] = route.component;

                            var list = vueRouter.struct[_id] = [_id].concat(_toConsumableArray(parent_ids));

                            var params = getParam(url);
                            if (route.name) vueRouter.routerNames[route.name] = {
                                url: url,
                                params: params
                            };
                            vueRouter.routerParam[url] = function () {
                                var routeObject = {};
                                var urlParam = {},
                                    queryParam = {};
                                for (var _i = params.length - 1; _i >= 0; _i--) {
                                    if (arguments.length > _i) urlParam[params[_i]] = arguments[_i];
                                }
                                var _url = vueRouter._getNowPath();
                                vueRouter.$route.params = urlParam;
                                vueRouter.$route.url = _url;
                                vueRouter.$route.query = getQueryStringArgs(_url);

                                // vueRouter.vue.$route=vueRouter.$route;
                                if (_utils2.default.isEqual(vueRouter.vue.$route, vueRouter.$route)) {
                                    return true;
                                }
                                Object.assign(vueRouter.vue.$route, vueRouter.$route);
                                vueRouter.vue.$nextTick(function () {
                                    vueRouter.removeComponents = true;
                                    vueRouter.changeComponents({ list: list, vm: vueRouter.vue });
                                });
                            };

                            if (route.subRoutes) {
                                vueRouter.dealRoutes({ routes: route.subRoutes, parent_url: i, parent_ids: vueRouter.struct[_id] });
                            }
                        })();
                    }
                };

                for (var _iterator2 = Object.entries(routes)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: "changeComponents",
        value: function changeComponents(_ref2) {
            var list = _ref2.list;
            var vm = _ref2.vm;

            var vueRouter = this;
            if (list.length > 0) {
                vm.$broadcast("changeComponents", list);
            } else if (vueRouter.removeComponents) {
                vm.$broadcast("removeComponents");
            }
        }
    }]);

    return VueRouter;
}();

VueRouter.install = function (externalVue) {
    /* istanbul ignore if */
    if (installed) {
        warn('already installed.');
        return;
    }
    Vue = externalVue;
    installed = true;
};

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VueRouter);
}

exports.default = VueRouter;