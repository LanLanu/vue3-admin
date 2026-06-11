<template>
  <div>
    <el-dialog v-model="visible" :title="props.title" width="700" destroy-on-close :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-form v-if="visible" :model="form" label-width="70px" label-position="left" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标识" prop="label">
              <el-input v-model="form.label" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="权限" prop="menuIdList">
              <!-- <el-input v-model="form.menuIdList" autocomplete="off" /> -->
              <MenuCheck ref="menuCheckRef" @ok="handleOk" />
            </el-form-item>
          </el-col>
        </el-row :gutter="20">
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancle" :loading="loading">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { watch, ref, computed, nextTick } from "vue";
import MenuCheck from "@/components/menu-check/index.vue";
import { addRole, updateRole } from "@/api/role";
const emits = defineEmits(['success'])
const props = defineProps({
  title: {
    type: String,
    default: "编辑",
  },
});
const visible = ref(false);
const menuIdList = ref([])
const loading = ref(false);
const formRef = ref(null)
const menuCheckRef = ref(null)
const form = ref({
  id: 0, // 0 新增，非0编辑
  name: "",
  label: "",
  remark: "",
  menuIdList: [],
});
const rules = ref({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  label: [
    { required: true, message: '请输入标识', trigger: 'blur' },
  ],
  // remark: [
  //   { required: true, message: '请输入备注', trigger: 'blur' },
  // ],
  // menuIdList: [
  //   {
  //     required: true,
  //     message: '请选择权限',
  //     trigger: 'change',
  //   },
  // ],
})

const handleConfirm = async () => {
  await formRef.value.validate()
  try {
    loading.value = true
    let menuIdList = menuCheckRef.value.get()
    menuIdList = menuIdList ? menuIdList : []
    console.log('>>menuIdList>>', menuIdList);
    if (props.title == '编辑') {
      await updateRole({ ...form.value, menuIdList })
    } else {
      await addRole({ ...form.value, id: undefined, menuIdList })
    }
    emits('success')
    loading.value = false
  } catch (error) {
    loading.value = false
    console.log('>>>>>', error);
  }
}
const handleCancle = async () => {
  formRef.value.resetFields()
  visible.value = false
}
const setForm = (data) => {
  Object.assign(form.value, data)
  console.log('>>>>>data.menuIdList', data.menuIdList);
}
const handleOk = () => {
  if (form.value.menuIdList) {
    menuCheckRef.value.set([...form.value.menuIdList])

  }
}
watch(() => visible.value, (val) => {
  if (!val) {
    form.value = {
      id: 0, // 0 新增，非0编辑
      name: "",
      label: "",
      remark: "",
      menuIdList: [],
    }
  }
})
defineExpose({ setForm, visible, handleCancle })
</script>
<style scoped lang="scss"></style>
