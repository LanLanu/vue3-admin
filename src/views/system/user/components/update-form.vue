<template>
  <el-dialog v-model="visible" :title="props.title" width="800" destroy-on-close :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form v-if="visible" :model="form" label-width="80px" label-position="left" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="头像" prop="headImg">
            <AvatarUpload v-model="form.headImg" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="form.phone" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="昵称" prop="nickName">
            <el-input v-model="form.nickName" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色" prop="roleIdList">
            <RoleSelect v-model="form.roleIdList" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" row="4" v-model="form.remark" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">开启</el-radio>
              <el-radio :value="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
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
</template>

<script setup>
import { watch, ref, computed, nextTick } from "vue";
import AvatarUpload from "@/components/avatar-upload/index.vue"
import { addUser, updateUser } from "@/api/user";
import RoleSelect from "@/components/role-select/index.vue";
defineOptions({
  name: "UpdateForm"
})
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
const form = ref({
  id: 0, // 0 新增，非0编辑
  name: "",
  username: "",
  nickName: "",
  roleName: "",
  email: "",
  phone: "",
  status: 1,
  headImg: "",
  remark: "",
  roleIdList: [],
});
const rules = computed(() => {
  return {
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
    ],
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
    ],
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
      { required: props.title != '编辑', message: '请输入密码', trigger: 'blur' },
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
    ],
    email: [
      { type: "email", message: '请输入正确的邮箱' },
    ],
    roleIdList: [
      {
        required: true,
        message: '请选择角色',
        trigger: 'change',
      },
    ],
  }
})
const handleConfirm = async () => {
  await formRef.value.validate()
  try {
    loading.value = true
    if (props.title == '编辑') {
      await updateUser({ ...form.value, })
    } else {
      await addUser({ ...form.value, id: undefined })
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
  console.log('>>>>data>', data);
  Object.assign(form.value, data)
  form.value.roleIdList = data.roleIdList ? data.roleIdList.split(',').map(item => Number(item)) : []
}

watch(() => visible.value, (val) => {
  if (!val) {
    form.value = {
      id: 0, // 0 新增，非0编辑
      name: "",
      username: "",
      nickName: "",
      roleName: "",
      email: "",
      phone: "",
      status: 1,
      headImg: "",
      remark: "",
      roleIdList: [],
    }
  }
})
defineExpose({ setForm, visible, handleCancle })
</script>
<style scoped lang="scss"></style>
