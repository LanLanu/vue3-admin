<template>
  <div class="role-area">
    <div class="role-area-header">
      <el-button type="primary" plain size="default" @click="refresh"
        >刷新</el-button
      >
      <el-button type="primary" size="default" @click="handleAdd"
        >新增</el-button
      >
      <el-button
        type="danger"
        size="default"
        :disabled="!checkList.length"
        @click="handleBatchDel"
        >批量删除</el-button
      >
    </div>
    <div class="role-area-table">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        row-key="id"
        style="width: 100%"
        default-expand-all
        height="460"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" min-width="90" />
        <el-table-column prop="type" label="类型" min-width="60">
          <template #default="{ row }">
            <el-tag>{{ getType(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="router" label="路由地址" min-width="110" />
        <el-table-column prop="viewPath" label="组件地址" min-width="110">
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="90">
          <template #default="row">{{
            dayjs(row.createTime).format("YYYY-MM-DD")
          }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="90">
          <template #default="row">{{
            dayjs(row.updateTime).format("YYYY-MM-DD")
          }}</template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" align="center" width="180">
          <template #default="{ row }">
            <el-button
              type="primary"
              plain
              size="small"
              @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button type="danger" plain size="small" @click="handleDel(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="role-area-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[1000, 2000, 3000, 4000]"
        :size="size"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <updateFormDialog
      @success="handleSuccess"
      @ok="handleOk"
      ref="updateFormRef"
      :title="title"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from "vue";
import { deepTree } from "@/utils/index";
import dayjs from "dayjs";
import updateFormDialog from "./components/updateForm.vue";
import { getMenuPage, deleteMenu } from "@/api/menu";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/modules/user.js";
const userStore = useUserStore();
defineOptions({
  name: "MenuList",
});
const tableData = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(1000);
const size = ref("default");
const background = ref(false);
const currentRow = ref({});
const updateFormRef = ref(null);
const total = ref(0);
const checkList = ref([]);
const title = ref("编辑");
const refresh = async () => {
  loading.value = true;
  try {
    const res = await getMenuPage({
      page: currentPage.value,
      size: pageSize.value,
    });
    tableData.value = deepTree(res.data.list);
    total.value = res.data.pagination.total;
    console.log(">>>>res>", res);
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};
const getType = (type) => {
  const options = [
    { value: 0, label: "目录" },
    { value: 1, label: "菜单" },
    { value: 2, label: "按钮" },
  ];
  const obj = options.find((item) => item.value == type);
  if (obj) return obj.label;
  return "";
};
const handleSizeChange = (val) => {
  refresh();
};
const handleCurrentChange = (val) => {
  refresh();
};
const handleSelectionChange = (val) => {
  // multipleSelection.value = val
  console.log(">>>>>多选", val);
  checkList.value = val;
};
const handleSuccess = () => {
  refresh();
  userStore.getPerson();
  ElMessage.success("操作成功");
  updateFormRef.value.handleCancle();
};
const handleOk = () => {
  updateFormRef.value.setForm(currentRow.value);
};
const handleEdit = (row) => {
  console.log(">>>>row>", row);
  currentRow.value = row;
  title.value = "编辑";
  updateFormRef.value.visible = true;
};

const handleDel = async (row) => {
  ElMessageBox.alert("确定删除吗？", "温馨提示", {
    confirmButtonText: "OK",
    callback: async (action) => {
      if (action === "confirm") {
        await deleteMenu({ ids: [row.id] });
        ElMessage.success("删除成功");
        refresh();
        userStore.getPerson();
      }
    },
  });
  // title.value = '新增'
  // updateFormRef.value.setForm({ row })
  // updateFormRef.value.visible = true
};
const handleBatchDel = async () => {
  if (!checkList.value.length) return ElMessage.warning("请选择要删除的数据！");
  ElMessageBox.alert("确定删除吗？", "提示", {
    confirmButtonText: "确定",
    callback: async (action) => {
      if (action === "confirm") {
        await deleteMenu({ ids: checkList.value.map((item) => item.id) });
        ElMessage.success("删除成功");
        refresh();
        userStore.getPerson();
      }
    },
  });
};
const handleAdd = () => {
  title.value = "新增";
  updateFormRef.value.visible = true;
  updateFormRef.value.setForm({ id: 0 });
};
onMounted(() => {
  refresh();
});
</script>
<style scoped lang="scss">
.role-area {
  background-color: #fff;

  .role-area-header {
    padding: 6px 10px;
  }

  .role-area-table {
    padding: 0 10px;
    padding-bottom: 20px;
  }

  .role-area-pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px 10px;
    padding-top: 0;
  }
}
</style>
