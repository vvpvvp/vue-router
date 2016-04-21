#vue-router-tiny

##A router for Vue.js

重写vue的router，使用Director作为底层框架。 

去除vue-router原生bug： 
- HTML5模式下，访问两次同样的地址，记录两次访问
- 配置/example/:id ,/example/1 跳转到/example/2 时不会重新渲染。  
- 支持url跳转进行函数处理


##Install
###npm install
```
npm install vue-router-tiny
```

###Download
```
git clone https://github.com/vvpvvp/vue-router
```

##option

- **history**: 是否为html5模式
- **rootUrl**: 为所有的url都添加root，全局添加前缀url
- **defaultUrl**: 默认的url，当访问的地址没有route配置时，自动跳转。
- **before**: 所有的url跳转之前执行，返回false则停止跳转。


##Use

**main.html**

```html
<!DOCTYPE html>
<html>

<head>
    <title>demo</title>
</head>

<body>
    <div id="body">
        <router-view></router-view>
    </div>
</body>

</html>

```


*js/router.js*

```javascript
import Router from '../plugin/vue-router';
import create from '../../components/create.vue';
import main from '../../components/main.vue';
import welcome from '../../components/welcome.vue';

var routes = {
    '/': {
        component: main,
        subRoutes: {
            '/create1/:id': {
                name: 'create1',
                component: create
            },
            '/create2/:id': {
                name: 'create2',
                before:function(){
                    console.log("welcome before");
                    // return false;//会让页面无法跳转/welcome
                },
                on:function(){
                    console.log("welcome on");
                },
                leave:function(){
                    console.log("welcome leave");
                },
                component: create,
                subRoutes:{
                    "/:title":function(param){
                        console.log(param.title);
                        console.log(param.id);
                    }
                }
            },
            '/welcome': {
                component: function(resolve){
                    require(["../../components/welcome.vue"],resolve);
                }
            },
            "/alert":function(){
                console.log("alert");
            },
            "/alert2":{
                on:function(){
                    $("#mate").addClass("show");
                },
                leave:function(){
                    $("#mate").removeClass("show");
                }
            }
        }
    }
};

let VueParam = {
    el: '#body'
};

Vue.use(Router);
var router = new Router({
    history:true,
    rootUrl:"/root",
    defaultUrl:"/root"
});


router.map(routes);
router.start(VueParam);

export default router;

```

*注意*：当配置了rootUrl时，无需将rootUrl添加至v-link中，包括调用go方法也无需添加。

*components/menu.vue*
```html
<template>
<div class="menu">
	<ul class="menuList">
        <li><a v-link.literal="/welcome">welcome</a></li>
        <li><a v-link="{name:'create1',params:{id:b},query:{query:1}}">create1{{a}}</a></li>
        <li><a v-link="{name:'create1',params:{id:b},query:{query:1}}">create1{{b}}</a></li>
        <li><a v-link="{name:'create2',params:{id:a},query:{query:1}}">create2</a></li>
        <li><a v-link.literal="/alert">alert</a></li>
	</ul>
</div>
</template>

```
*components/create.vue*
```html
<template>
<div>
	<button @click="go" class="button">welcome</button>
</div>
</template>
<script type="text/javascript">
import Router from '../js/router';
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
