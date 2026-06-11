/**
 * Vue插件（Plugin）
 * 定义插件
 *  1. 定义插件对象
 *      {
 *         install(app) { // ....  }
 *      }
 *  2. 函数形式
 *      function install(app) { // ....  }
 * 
 * 使用插件  https://cn.vuejs.org/api/application.html#createapp
 * app.use(xx插件)
 *  1.app.component() 注册全局组件
 *  2. app.directive() 注册全局指令
 *  3.app.mixin() 注册全局混入  不推荐
 *  4.app.globalProperties 挂载全局属性   TODO vue2不一样
 *  5. app.provide() 创建 provide/inject
 * 
 * 
 */
// import focus from './modules/focus'
// import draggable from './modules/draggable'
// import waterMarker from './modules/waterMarker'
// import auth from './modules/auth'
// 动态导入模块
const modules = import.meta.glob('./modules/*.js',{eager:true,import:'default'}); // 相当于 import auth from './modules/auth' 导出auth
// console.log('>>>>>auth',auth);  
const directives = {
    install(app){
        // 遍历模块
        for (const key in modules) {
            // console.log('>>>>>key',key);  // ./modules/focus.js  ...
            const arr = key.split('/'); // ['./modules', 'focus.js']
            const name = arr[arr.length - 1].split('.')[0] // =>focus.js=>focus
            app.directive(name,modules[key]);
        }
        // app.directive('focus',focus);
        // app.directive('draggable',draggable);
        // app.directive('waterMarker',waterMarker);
        // app.directive('auth',auth);
    }
}
export default directives