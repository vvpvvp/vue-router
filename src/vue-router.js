import { Router }
from "./director";
import Utils from './utils';

let Vue, installed = false;
let defaultOption = {
    history: false
}

let getQueryStringArgs = (qs) => {
    let qloc = qs.indexOf("?");
    if (qloc == -1 || qloc == qs.length - 1) {
        return {};
    };
    qs = qs.substring(qloc + 1);
    let args = {},
        items = qs.split("&"),
        len = items.length,
        name = null,
        value = null;
    for (let i = 0; i < len; i++) {
        let item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        args[name] = value;
    }
    return args;
}

class VueRouter {
    constructor(options) {
        if (!installed) {
            throw new Error(
                'Please install the Router with Vue.use() before ' +
                'creating an instance.'
            )
        }
        let vueRouter = this;
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
        this.options.notfound = function() {
                vueRouter.getRouter().setRoute("/");
            }
            // Object.freeze(this);
        return this;
    };

    start(vueParam) {
        let vueRouter = this;
        this.vue = new Vue(vueParam);
        this.vue.$nextTick(function() {
            vueRouter.router.init("/");
        });
        return this;
    }

    map(routes) {
        let vueRouter = this;

        vueRouter.dealRoutes({ routes });
        vueRouter.router = Router(vueRouter.routerParam).configure(vueRouter.options);

        Vue.mixin({
            created: function() {
                if (this.$parent) {
                    this.$route = this.$parent.$route;
                } else {
                    this.$route = {};
                }
            }
        });

        Vue.component('routerView', {
            data() {
                return {
                    currentView: ""
                }
            },
            template: `<component :is="currentView" v-ref:component></component>`,
            components: vueRouter.components,
            events: {
                'changeComponents': function(listParam) {
                    let list = [...listParam];
                    if (vueRouter.removeComponents && list.length == 1 && this.currentView == list[0]) {
                        this.currentView = "";
                        this.$nextTick(function() {
                            vueRouter.changeChildren(this, list);
                        });
                    } else {
                        vueRouter.changeChildren(this, list);
                    }

                },
                'removeComponents': function() {
                    this.$data.currentView = "";
                    return true;
                }
            }
        });
        return this;
    }

    changeChildren(route, list) {
        let vueRouter = this;
        if (list.length > 0) {
            let begin = list.pop();
            // route.$route = param;
            if (route.currentView != begin) {
                route.currentView = begin;
                route.$nextTick(function() {
                    vueRouter.changeComponents({ list, vm: route });
                });
            } else {
                vueRouter.changeComponents({ list, vm: route });
            }
        } else {
            return true;
        }
    }

    ParseUrl(value) {
        let url, vueRouter = this;
        if (Utils.isObject(value)) {
            if (value.path) {
                url = value.path;
            } else if (value.name) {
                url = vueRouter.routerNames[value.name].url;
            }
            if (value.params) {
                for (let key of Object.keys(value.params)) {
                    url = url.replace(new RegExp("\:" + key + "", 'g'), value.params[key]);
                }
            }

            if (value.query) {
                url += "?" + $.param(value.query);
            }
        }

        if (Utils.isString(value)) {
            url = value;
        }
        return url;
    }

    initDirective() {
        let vueRouter = this;
        Vue.directive('link', {
            params: ['url'],
            update: function(value) {
                let url = vueRouter.ParseUrl(value);
                let el = this.el;
                if (vueRouter.router.history) {
                    el.href = url;
                    el.addEventListener("click", function(event) {
                        event.preventDefault();
                        vueRouter.go(url);
                    });
                } else {
                    el.href = "#" + url;
                }
            }
        });
    }

    _getNowPath() {
        let _loc = window.location;
        return _loc.pathname + _loc.hash + _loc.search;
    }

    go(value) {
        let vueRouter = this;
        let url = vueRouter.ParseUrl(value);
        if (vueRouter._getNowPath() != url) {
            vueRouter.router.setRoute(url);
        }
    }

    getRouter() {
        let vueRouter = this;
        if (vueRouter.router) {
            return vueRouter.router;
        } else {
            console.error("Router未配置!");
        }
    }

    dealRoutes({ routes, parent_url = "", parent_ids = [] }) {
        let vueRouter = this;
        let count = 0;
        for (let i of Object.keys(routes)) {
            let route = routes[i];
            let _id = (parent_ids[0] || "VueRouter") + "_" + count++;
            let url = (parent_url == "/" ? "" : parent_url) + i;
            if (Utils.isFunction(route)) {
                let list = [...parent_ids];
                vueRouter.routerParam[url] = function() {
                    vueRouter.removeComponents = false;
                    vueRouter.changeComponents({ list, vm: vueRouter.vue, removeComponents: false });
                    route(...arguments);
                };
            } else if (Utils.isObject(route) && route.component) {

                vueRouter.components[_id] = route.component;

                let list = vueRouter.struct[_id] = [_id, ...parent_ids];

                function getParam(url) {
                    let ps = [],
                        patt = /\/\:(\w+)/g,
                        result;
                    while ((result = patt.exec(url)) != null) {
                        ps.push(result[1]);
                    }
                    return ps;
                }
                let params = getParam(url);
                if (route.name) vueRouter.routerNames[route.name] = {
                    url: url,
                    params: params
                };
                vueRouter.routerParam[url] = function() {
                    let routeObject = {};
                    let urlParam = {},
                        queryParam = {};
                    for (let i = params.length - 1; i >= 0; i--) {
                        if (arguments.length > i) urlParam[params[i]] = arguments[i];
                    }
                    let _url = vueRouter._getNowPath();
                    vueRouter.$route.params = urlParam;
                    vueRouter.$route.url = _url;
                    vueRouter.$route.query = getQueryStringArgs(_url);

                    // vueRouter.vue.$route=vueRouter.$route;
                    if (Utils.isEqual(vueRouter.vue.$route, vueRouter.$route)) {
                        return true;
                    }
                    Object.assign(vueRouter.vue.$route, vueRouter.$route);
                    vueRouter.vue.$nextTick(() => {
                        vueRouter.removeComponents = true;
                        vueRouter.changeComponents({ list, vm: vueRouter.vue });
                    });
                }

                if (route.subRoutes) {
                    vueRouter.dealRoutes({ routes: route.subRoutes, parent_url: i, parent_ids: vueRouter.struct[_id] });
                }
            }
        }
    };

    changeComponents({ list, vm }) {
        let vueRouter = this;
        if (list.length > 0) {
            vm.$broadcast("changeComponents", list);
        } else if (vueRouter.removeComponents) {
            vm.$broadcast("removeComponents");
        }
    }
}

VueRouter.install = function(externalVue) {
    /* istanbul ignore if */
    if (installed) {
        warn('already installed.')
        return
    }
    Vue = externalVue;
    installed = true;
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VueRouter)
}

export default VueRouter;
