// 1. 用 canvas 画一小块斜着半透明文字瓦片，导出 base64 图片；
// 2. 创建一个 fixed 全屏 div 浮层，瓦片图片做背景平铺；
// 3. 浮层 z-index 拉到最顶层，开启`pointer‑events:none`让鼠标可以穿透；
// 4. 挂载到 body；增加 dom 监听防止被 F12 删除；组件销毁清理 dom。

// >
// > 拓展小知识：
// > 还有第二种水印实现：不使用 background，循环创建大量 dom 文本节点铺满屏幕。相比之下 canvas 瓦片方案 DOM 数量极少，性能更好。
// **水印如何处理页面滚动、弹窗 dialog 盖住水印的问题**。

// - z-index 固定 `9999` 浮在页面**最顶层**，pointer‑events:none 不影响点击；
// - 防止重复创建水印层，先判断是否已经存在水印 DOM；
// - 修正 canvas 文字坐标，防止文字画到画布外面；
// - 增加 MutationObserver，防止被 F12 删除；
// - layout 常驻场景：不要依赖 unmounted 删除。
const waterMarker = {
  mounted(el, binding) {
    const text = binding.value;
    if (!text) return;
    // 已经存在直接退出
    if (document.getElementById("__water_marker_layer")) return;

    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.textAlign = "left";
    ctx.fillText(text, 20, 130);
    const bgUrl = canvas.toDataURL("image/png");

    const waterDom = document.createElement("div");
    waterDom.id = "__water_marker_layer";
    waterDom.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
      background-image: url(${bgUrl});
      background-repeat: repeat;
    `;

    // =========关键顺序：先插入DOM，再开启监听！！=========
    document.body.appendChild(waterDom);
    el._waterDom = waterDom;

    // 防抖锁，防止observer疯狂重复执行
    let isRebuilding = false;
    const observer = new MutationObserver(() => {
      if (isRebuilding) return;
      if (!document.getElementById("__water_marker_layer")) {
        isRebuilding = true;
        observer.disconnect();
        // 延时重建，避免同步死循环
        setTimeout(() => {
          waterMarker.mounted(el, binding);
          isRebuilding = false;
        }, 100);
      }
    });
    // dom插入完成之后，再开始监听body变化
    observer.observe(document.body, { childList: true, subtree: true });
    el._observer = observer;
  },
  unmounted(el) {
    if (el._observer) {
      el._observer.disconnect();
      delete el._observer;
    }
    if (el._waterDom) {
      el._waterDom.remove();
      delete el._waterDom;
    }
  },
};

export default waterMarker;
