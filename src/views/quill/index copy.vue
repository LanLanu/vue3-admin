<template>
  <div class="quill-area">
    <div class="quill" :style="`height: ${props.height}`" ref="quillRef"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "100px",
  },
});
const emits = defineEmits(["update:modelValue"]);

const quillRef = ref(null);
let editor = null;
let editorReady = false;
// 标记是否是代码内部更新编辑器，用来跳过watch
let isInnerUpdate = false;

onMounted(() => {
  editor = new Quill(quillRef.value, {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
    },
  });

  // 监听用户输入
  editor.on("text-change", (delta, oldDelta, source) => {
    // 只处理用户手动输入，API修改不触发emit
    if (source !== "user") return;
    const html = editor.root.innerHTML;
    // 标记：接下来父组件更新modelValue是我们自己触发的，watch不要回写
    isInnerUpdate = true;
    emits("update:modelValue", html);
    // 微任务重置标记，避免下一次watch拦截外部更新
    setTimeout(() => {
      isInnerUpdate = false;
    }, 0);
  });

  editorReady = true;
  // 初始化回填初始值
  if (props.modelValue) {
    editor.clipboard.dangerouslyPasteHTML(props.modelValue);
  }
});

// 监听父组件外部传入的内容变化
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    // 条件过滤：未初始化 / 自己输入触发的更新 / 值没变，直接跳过
    if (!editor || !editorReady || isInnerUpdate || newVal === oldVal) return;
    // 只有父组件主动传新值时才覆盖编辑器
    editor.clipboard.dangerouslyPasteHTML(newVal);
  },
);
</script>

<style scoped lang="scss">
.quill-area {
  background-color: #fff;
  width: 100%;
  .quill {
    width: 100%;
  }
}
</style>
