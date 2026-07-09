<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="props.title"
      width="700"
      destroy-on-close
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        :model="form"
        label-width="120px"
        label-position="right"
        :rules="rules"
        ref="formRef"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="节点类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :value="0">目录</el-radio>
                <el-radio :value="1">菜单</el-radio>
                <el-radio :value="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="节点名称" prop="name">
              <el-input
                v-model="form.name"
                autocomplete="off"
                placeholder="请输入节点名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级节点" prop="parentId">
              <el-tree-select
                clearable
                filterable
                v-model="form.parentId"
                :data="treeData"
                node-key="id"
                :props="defaultProps"
                :check-strictly="true"
                :render-after-expand="false"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.type != 2">
          <el-col :span="24">
            <el-form-item label="是否显示" prop="isShow">
              <el-switch
                v-model="form.isShow"
                :active-value="true"
                :inactive-value="false"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.type != 2">
          <el-col :span="24">
            <el-form-item prop="icon">
              <template #label>
                <div class="icon-label">
                  <span>节点图标</span>
                  <el-button
                    v-if="form.icon"
                    :icon="form.icon"
                    size="small"
                    circle
                  />
                </div>
              </template>
              <el-select
                :teleported="false"
                v-model="form.icon"
                placeholder="请选择图标"
                popper-class="icon-select-area"
                clearable
                filterable
              >
                <el-option
                  v-for="item in colors"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                  <div class="icon-selsect">
                    <el-icon>
                      <component :is="item"></component>
                    </el-icon>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="节点排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                :step="1"
                :min="1"
                :step-strictly="true"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="form.type == 1">
          <el-row>
            <el-col :span="24">
              <el-form-item label="节点路由" prop="router">
                <el-input
                  v-model="form.router"
                  autocomplete="off"
                  placeholder="请输入节点路由，如：/test"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="节点缓存" prop="keepAlive">
                <el-radio-group v-model="form.keepAlive">
                  <el-radio :value="true">开启</el-radio>
                  <el-radio :value="false">关闭</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="文件路径" prop="viewPath">
                <el-input
                  v-model="form.viewPath"
                  autocomplete="off"
                  placeholder="请输入文件路径，如：views/xxx"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <template v-if="form.type == 2">
          <el-row>
            <el-col :span="24">
              <el-form-item label="权限" prop="perms">
                <el-input
                  v-model="form.perms"
                  autocomplete="off"
                  placeholder="请输入权限"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
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
import { watch, ref, computed, nextTick, onMounted } from "vue";
import { addRole, updateRole } from "@/api/role";
import { deepTree } from "@/utils/index";
import { getMenuList, addMenu, updateMenu } from "@/api/menu";
import { ElMessage } from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
const emits = defineEmits(["success", "ok"]);
const props = defineProps({
  title: {
    type: String,
    default: "编辑",
  },
});
const visible = ref(false);
const defaultProps = { children: "children", label: "name" };
const treeData = ref([]);
const loading = ref(false);
const formRef = ref(null);
const colors = ref([]);
onMounted(() => {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    colors.value.push(key);
    // app.component(key, component);
  }
});

const form = ref({
  id: 0, // 0 新增，非0编辑
  name: "",
  type: 0,
  parentId: null,
  icon: null,
  orderNum: "",
  router: "",
  perms: "",
  keepAlive: true,
  isShow: true,
});
const rules = ref({
  type: [{ required: true, message: "请选择节点类型", trigger: "change" }],
  name: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
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
});

const handleConfirm = async () => {
  await formRef.value.validate();
  console.log(">>>>>form.value", form.value);
  try {
    loading.value = true;
    if (props.title == "编辑") {
      await updateMenu({ ...form.value });
    } else {
      await addMenu({ ...form.value, id: undefined });
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
  Object.assign(form.value, {
    ...data,
    parentId: Number(data.parentId) ? Number(data.parentId) : null,
    isShow: data.isShow ? true : false,
    keepAlive: data.isShow ? true : false,
    children: undefined,
  });
};

const refresh = async () => {
  const res = await getMenuList();
  treeData.value = deepTree(res.data.filter((item) => item.type != 2));
  props.title == "新增" ? "" : emits("ok");
};
watch(
  () => visible.value,
  (val) => {
    if (val) {
      if (props.title == "新增") {
        form.value = {
          id: 0, // 0 新增，非0编辑
          name: "",
          type: 0,
          parentId: null,
          icon: null,
          orderNum: "",
          router: "",
          perms: "",
          keepAlive: true,
          isShow: true,
        };
      }
      refresh();
    }
  },
);
defineExpose({ setForm, visible, handleCancle });
</script>
<style lang="scss">
.icon-selsect {
  width: 100%;
  /* background-color: antiquewhite; */
}
.icon-select-area {
  display: flex;
  flex-wrap: wrap;
  .el-scrollbar {
    width: 100%;
    .el-scrollbar__view {
      display: flex;
      flex-wrap: wrap;
    }
  }
}
</style>
<style scoped lang="scss">
.icon-label {
  display: flex;
  align-items: center;
  .el-button {
    margin-left: 6px;
  }
}
</style>
