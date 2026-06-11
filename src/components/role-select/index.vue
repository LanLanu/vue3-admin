<template>
    <el-select :modelValue="modelValue" @update:modelValue="handleModelValue" multiple
        :multiple-limit="props.multipleLimit" placeholder="请选择" style="width: 100%">
        <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getRoleList } from '@/api/role';
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    multipleLimit: {
        type: Number,
        default: 2
    }
})
const emits = defineEmits(['update:modelValue', 'ok'])
const value1 = ref([])
const options = ref([])
const refresh = async () => {
    const res = await getRoleList()
    options.value = res.data
    console.log('>>>>res>', res);
}
const handleModelValue = (value) => {
    emits('update:modelValue', value)
}
onMounted(() => {
    refresh()
})
</script>
<style scoped lang='scss'></style>