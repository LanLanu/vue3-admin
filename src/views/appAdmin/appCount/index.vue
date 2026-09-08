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
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          prop="appIconPath"
          label="应用图标"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <img
              style="height: 40px; width: 40px"
              :src="row.appIconPath"
              alt=""
            />
          </template>
        </el-table-column>
        <el-table-column prop="type" label="应用类型" width="120">
          <template #default="{ row }">
            {{ getType(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="应用名称" min-width="120" />
        <el-table-column prop="status" label="应用类型" min-width="120">
          <template #default="{ row }">
            {{ row.appType == "1" ? "独立应用" : "模块应用" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="appApkPackage"
          label="应用包名(Android)"
          min-width="160"
        />
        <el-table-column
          prop="appAPKFilePath"
          label="apk地址"
          min-width="120"
        />
        <el-table-column prop="appUrl" label="模块地址" min-width="120" />
        <el-table-column prop="appId" label="应用ID" min-width="120" />
        <el-table-column prop="createTime" label="创建时间" min-width="120">
          <template #default="{ row }">
            {{ dayjs(row.createTime).format("YYYY-MM-DD") }}
          </template>
        </el-table-column>
        <el-table-column
          prop="operate"
          label="操作"
          align="center"
          fixed="right"
          width="140"
        >
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
        :page-sizes="[10, 20, 30, 40]"
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
      ref="updateFormRef"
      :title="title"
    />
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { updateAppList, getAppListPage, deleteAppList } from "@/api/appAdmin";
import updateFormDialog from "./components/update-form.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
defineOptions({
  name: "RoleList",
});
const options = [
  { value: "1", label: "服务" },
  { value: "2", label: "工具" },
  { value: "3", label: "管理" },
];
const getType = (type) => {
  const obj = options.find((item) => item.value == type);
  if (obj) {
    return obj.label;
  }
  return "";
};
const tableData = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref("default");
const background = ref(false);
const updateFormRef = ref(null);
const total = ref(0);
const checkList = ref([]);
const title = ref("编辑");
const refresh = async () => {
  loading.value = true;
  try {
    const res = await getAppListPage({
      page: currentPage.value,
      size: pageSize.value,
    });
    tableData.value = res.data.list;
    total.value = res.data.pagination.total;
    console.log(">>>>res>", res);

    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};
const handleStatusChange = async (id, status) => {
  await updateAppList({ id, status: status ? 1 : 0 });
  refresh();
  ElMessage.success("操作成功");
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
  ElMessage.success("操作成功");
  updateFormRef.value.handleCancle();
};
const handleEdit = (row) => {
  title.value = "编辑";
  updateFormRef.value.visible = true;

  updateFormRef.value.setForm(row);
};

const handleDel = async (row) => {
  ElMessageBox.alert("确定删除吗？", "温馨提示", {
    confirmButtonText: "OK",
    callback: async (action) => {
      if (action === "confirm") {
        await deleteAppList({ ids: [row.id] });
        ElMessage.success("删除成功");
        refresh();
      }
    },
  });
};
const handleBatchDel = async () => {
  if (!checkList.value.length) return ElMessage.warning("请选择要删除的数据！");
  ElMessageBox.alert("确定删除吗？", "提示", {
    confirmButtonText: "确定",
    callback: async (action) => {
      if (action === "confirm") {
        await deleteAppList({ ids: checkList.value.map((item) => item.id) });
        ElMessage.success("删除成功");
        refresh();
      }
    },
  });
};
const handleAdd = () => {
  title.value = "新增";
  updateFormRef.value.setForm({ id: 0 });
  updateFormRef.value.visible = true;
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
