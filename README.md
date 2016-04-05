
# vue-router
##A router for Vue.js
综合配置众多后台服务的反向代理，可以集成不同的后台，可以让前端统一访问接口。  
并且通过配置mock返回的数据，统一开发流程。  
并且可以修改原本返回的数据，解决开发中的数据需求。  
##Install
###npm install
```
npm install vue-router-tiny
```

###Download
```
git clone https://github.com/vvpvvp/vue-router
```
##Use

*router.js*

```javascript
import Router from '../plugin/vue-router';
import create from '../../components/create.vue';
import main from '../../components/main.vue';
import welcome from '../../components/welcome.vue';

var routes = {
    '/': {
        component: main,
        subRoutes: {
            '/create/:id': {
                name: 'create',
                component: create
            },
            '/welcome': {
                component: function(resolve){
                    require(["../../components/welcome.vue"],resolve);
                }
            },
            "/alert":function(){
                Log("test");
            }
        }
    }
};

let VueParam = {
    el: '#body'
};

Vue.use(Router);
var router = new Router({
    history:false
});

router.map(routes);
router.start(VueParam);

export default router;

```

*menu.vue*
```html
<template>
<div class="menu">
	<ul class="menuList">
        <li><a v-link.literal="/welcome">首页</a></li>
        <li><a v-link="{name:'create',params:{id:b},query:{query:1}}">测试{{a}}</a></li>
        <li><a v-link="{name:'create',params:{id:a},query:{query:1}}">测试</a></li>
        <li><a v-link.literal="/alert">测试</a></li>
	</ul>
</div>
</template>

```
*create.vue*
```html
<template>
<div>
	<button @click="go" class="button">首页</button>
</div>
</template>
<script type="text/javascript">
import Router from '../js/common/router';
export default {
    data() {
        return {};
    },
    methods:{
    	go(){
            Router.go("/welcome");
    	}
    }
}
</script>

```


##Dependences
- [director](https://github.com/flatiron/director)
- [Vue](http://www.vuejs.org/)
