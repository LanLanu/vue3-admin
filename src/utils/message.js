import { ElMessage } from "element-plus";
/**
 * (推荐)局部引入- import message from '@/utils/message'
 * import message from '@/utils/message'
    message('普通提示')
    message.success('成功提示')
    message.error('失败信息')
    message.warning('警告')
    // 原生对象传参全部支持
    message({
    message: '自定义提示',
    duration: 3000,
    showClose: true
    })
 * 
 * 全局引入-main.js
 * import { createApp } from 'vue'
    import App from './App.vue'
    import message from '@/utils/message'
    const app = createApp(App)
    app.config.globalProperties.$message = message
    组件内可以直接使用 this.$message.success('xxx'),不推荐，vue3setup需要下面那样使用
    import { getCurrentInstance } from 'vue'
    const { proxy } = getCurrentInstance()
    proxy.$message.success('测试消息')
 */
// 全局变量，保存上一个消息实例（模块单例，全局唯一）
let lastMessageInstance = null;

/**
 * 单例消息弹窗
 * 同一时刻只会有一条消息，新消息自动销毁上一条
 * 完全兼容 ElMessage 原生所有参数，调用方式不变
 */
const singleMessage = function (...args) {
  // 如果存在上一条消息，先关闭
  if (lastMessageInstance) {
    lastMessageInstance.close();
  }
  // 创建新消息，保存实例
  lastMessageInstance = ElMessage(...args);
  return lastMessageInstance;
};

// 挂载原生类型方法：success/warning/info/error
["success", "warning", "info", "error"].forEach((type) => {
  singleMessage[type] = function (...args) {
    if (lastMessageInstance) {
      lastMessageInstance.close();
    }
    lastMessageInstance = ElMessage[type](...args);
    return lastMessageInstance;
  };
});

// 导出单例
export default singleMessage;
