<!-- markdown 组件 -->
<template>
  <div class="markdown-area">
    <el-input
      v-model="text"
      type="textarea"
      :autosize="{ minRows: 3, maxRows: 6 }"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import * as marked from "marked";
const emits = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const text = ref("");
const handleChange = (val) => {
  const markValue = marked.parse(val);
  console.log(">>>>markValue>", markValue);
  emits("update:modelValue", markValue);
};
watch(
  () => props.modelValue,
  (val) => {
    text.value = val;
  },
  { immediate: true },
);
</script>
<style scoped lang="scss">
.markdown-area {
  width: 100%;
  height: 200px;
}
</style>
