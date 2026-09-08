<template>
  <el-dialog
    v-model="visible"
    :title="props.title"
    width="900"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      v-if="visible"
      :model="form"
      label-width="auto"
      label-position="left"
      :rules="rules"
      ref="formRef"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="应用图标" prop="appIconPath">
            <AvatarUpload v-model="form.appIconPath" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="应用模式" prop="appType">
            <el-radio-group v-model="form.appType">
              <el-radio value="1">独立应用</el-radio>
              <el-radio value="0">模块应用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="应用类型" prop="type">
            <el-select v-model="form.type">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="应用名称" prop="appName">
            <el-input v-model="form.appName" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.appType == '1'">
          <el-form-item label="应用包名(Android)" prop="appApkPackage">
            <el-input v-model="form.appApkPackage" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.appType == '1'">
          <el-form-item label="apk地址" prop="appAPKFilePath">
            <el-input v-model="form.appAPKFilePath" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-else>
          <el-form-item label="模块地址" prop="appUrl">
            <el-input v-model="form.appUrl" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.appType == '1'">
          <el-form-item label="应用ID" prop="appId">
            <el-input v-model="form.appId" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              row="4"
              v-model="form.remark"
              autocomplete="off"
            />
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
import AvatarUpload from "@/components/avatar-upload/index.vue";
import { addAppList, updateAppList } from "@/api/appAdmin";
defineOptions({
  name: "UpdateFormApp",
});
const emits = defineEmits(["success"]);
const props = defineProps({
  title: {
    type: String,
    default: "编辑",
  },
});
const options = [
  { value: "1", label: "服务" },
  { value: "2", label: "工具" },
  { value: "3", label: "管理" },
];
const visible = ref(false);
const menuIdList = ref([]);
const loading = ref(false);
const formRef = ref(null);
const form = ref({
  id: 0, // 0 新增，非0编辑
  type: "",
  appType: "1",
  appIconPath: "",
  appName: "",
  appId: "",
  appApkPackage: "",
  appAPKFilePath: "",
  appUrl: "",
  remark: "",
});
const rules = computed(() => {
  return {
    appIconPath: [
      { required: true, message: "请选择应用图标", trigger: "change" },
    ],
    appName: [{ required: true, message: "请输入应用名称", trigger: "blur" }],
    type: [{ required: true, message: "请选择应用类型", trigger: "change" }],
    appType: [{ required: true, message: "请选择应用模式", trigger: "change" }],
    // appAPKFilePath: [{ required: true, message: "请输入apk地址", trigger: "blur" }],
    appApkPackage: [
      {
        required: props.title != "编辑",
        message: "请输入应用包名",
        trigger: "blur",
      },
    ],
    appAPKFilePath: [
      { required: true, message: "请输入apk地址", trigger: "change" },
    ],
    appUrl: [{ required: true, message: "请输入模块地址", trigger: "change" }],
    appId: [{ required: true, message: "请输入应用Id", trigger: "blur" }],
  };
});
const handleConfirm = async () => {
  await formRef.value.validate();
  try {
    loading.value = true;
    if (props.title == "编辑") {
      await updateAppList({ ...form.value });
    } else {
      await addAppList({ ...form.value, id: undefined });
    }
    emits("success");
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.log(">>>>>", error);
  }
};
const handleCancle = async () => {
  formRef.value.resetFields();
  visible.value = false;
};
const setForm = (data) => {
  console.log(">>>>data>", data);
  Object.assign(form.value, data);
};

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      form.value = {
        id: 0, // 0 新增，非0编辑
        type: "",
        appType: "1",
        appIconPath: "",
        appName: "",
        appId: "",
        appApkPackage: "",
        appAPKFilePath: "",
        appUrl: "",
        remark: "",
      };
    }
  },
);
defineExpose({ setForm, visible, handleCancle });
</script>
<style scoped lang="scss"></style>
