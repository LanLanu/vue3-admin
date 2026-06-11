// 选项配置  https://cn.vuejs.org/guide/reusability/custom-directives.html
/**
 * binding：一个对象，包含以下属性。
    value：传递给指令的值。例如在 v-my-directive="1 + 1" 中，值是 2。
    oldValue：之前的值，仅在 beforeUpdate 和 updated 中可用。无论值是否更改，它都可用。
    arg：传递给指令的参数 (如果有的话)。例如在 v-my-directive:foo 中，参数是 "foo"。
    modifiers：一个包含修饰符的对象 (如果有的话)。例如在 v-my-directive.foo.bar 中，修饰符对象是 { foo: true, bar: true }。
    instance：使用该指令的组件实例。
    dir：指令的定义对象。
    <div v-example:foo.bar="baz">
    {
        arg: 'foo',
        modifiers: { bar: true },
        value: `baz` 的值 ,
        oldValue:  上一次更新时 `baz` 的值
    }
 */
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  /**
   * 
   * @param {*} el 
   * @param {*} binding {name,value,oldValue,arg,modifiers}
   * @param {*} vnode 
   */
  mounted(el, binding, vnode) {
    console.log('>>>>el>',el);  
    console.log('>>>>binding>',binding);  
    console.log('>>>>vnode>',vnode);  
  },
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode) {}
}
// TODO 参考指令https://gitee.com/HalseySpicy/Geeker-Admin/tree/master/src/directives/modules
// 函数配置 --表示两个生命周期钩子函数mounted,updated都会执行
const focus = (el,binding,vnode,prevVnode) => {
    console.log('>>>>>el',el);  
    el.onclick = () => {
        console.log('>>>>>点击了');  
    }
    console.log('>>>>指令的参数值>',binding.value);  
}
// export default myDirective
export default focus