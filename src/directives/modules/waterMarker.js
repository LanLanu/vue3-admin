/**
 * 水印指令  在全局注册main.js中app.directive("waterMarker",waterMarker)
 * 
 * v-waterMarker="'Bluecp'"
 * 
 * 需求：给整个页面添加背景水印。
  思路：
    1、使用 canvas 特性生成 base64 格式的图片文件，设置其字体大小，颜色等。
    2、将其设置为背景图片，从而实现页面或组件水印效果
  
  使用：设置水印文案
  <div v-waterMarker="'版权所有'"></div>
 */
const waterMarker = { 
    mounted(el, binding){
        const canvan = document.createElement('canvas');
        canvan.width = 100;
        canvan.height = 100;
        document.body.appendChild(canvan);
        // 2d对象
        const ctx = canvan.getContext('2d');
        ctx.rotate((-20 * Math.PI) / 180);
        ctx.font="20px Microsoft JhengHei"
        ctx.fillStyle="rgba(0,0,0,.2)";
        ctx.textAlign="left";
        ctx.fillText(binding.value, canvan.width / 10, canvan.height / 2);
        const img=canvan.toDataURL('image/png')
        el.style.backgroundImage=`url(${img})`
        canvan.remove();
        console.log('>>>>e11111l>',binding.value);
    }
}
export default waterMarker
