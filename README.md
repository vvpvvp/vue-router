#vue-router-tiny

##A router for Vue.js

重写vue的router，使用Director作为底层框架。 

去除vue-router原生bug： 
- 点击两次记录两次访问，配置单一； 
- route同配置无法重加载问题，"/example/:id" url新的id无法重加载。  
- 支持函数处理的url跳转


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
- [Director](https://github.com/flatiron/director)
- [Vue](http://www.vuejs.org/)
