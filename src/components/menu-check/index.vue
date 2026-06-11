<template>
    <div style="width: 100%">
        <el-input v-model="filterText" style="width: 100%" placeholder="关键字过滤" />
        <el-tree ref="treeRef" style="width: 100%" :data="data" show-checkbox node-key="id"
            :default-checked-keys="checkedId" :filter-node-method="filterNode" :props="defaultProps" />
    </div>
</template>

<script setup>
import { getMenuList } from '@/api/menu'
import { deepTree, isLeaf } from '@/utils'
import { ref, watch, onMounted } from 'vue'
defineOptions({
    name: 'MenuCheck',
})
const defaultProps = {
    children: 'children',
    label: 'name',
}
const emits = defineEmits(['ok'])
const filterText = ref('')
const treeRef = ref(null)

const data = ref([])
const flatList = ref([])
const checkedId = ref([])
const refresh = async () => {
    const res = await getMenuList()
    flatList.value = res.data
    data.value = deepTree(res.data)
    emits('ok')
    console.log('>>>>>菜单数据', res);
}
watch(filterText, (val) => {
    // 触发filterNode方法
    treeRef.value.filter(val)
})
const filterNode = (value, data) => {
    // 返回true则显示该节点，返回false则隐藏该节点
    if (!value) return true
    return data.label.includes(value)
}
const get = () => {
    const key = treeRef.value.getCheckedKeys()
    const half = treeRef.value.getHalfCheckedKeys()
    return [...key, ...half]
    console.log('>>>>>', treeRef.value.getCheckedKeys());
    console.log('>>>>>', treeRef.value.getHalfCheckedKeys());
}
const set = (keys) => {
    // 过滤出有子集的留下无子集的节点
    keys = keys.filter(key => isLeaf(flatList.value, key))
    console.log('>keys>>>>', keys);
    treeRef.value.setCheckedKeys(keys)
}
onMounted(() => {
    refresh()
})
defineExpose({
    get, set
})
</script>
<style scoped lang='scss'>
.el-input {
    margin-bottom: 10px;
}
</style>