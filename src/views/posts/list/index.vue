<template>
  <div class="role-area">
    <div class="role-area-header">
      <el-button type="primary" plain size="default" @click="refresh"
        >刷新</el-button
      >
      <el-button
        type="primary"
        size="default"
        @click="handleAdd"
        v-auth="'base:sys:user:add'"
        >新增</el-button
      >
      <el-button
        type="danger"
        size="default"
        :disabled="!checkList.length"
        @click="handleBatchDel"
        v-auth="'base:sys:user:delete'"
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
        <el-table-column prop="title" label="标题" min-width="120" />
        <el-table-column prop="body" label="内容" min-width="360" />
        <el-table-column prop="createTime" label="创建时间" min-width="100">
          <template #default="{ row }">
            {{ dayjs(row.createTime).format("YYYY-MM-DD") }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="100">
          <template #default="{ row }">
            {{ dayjs(row.updateTime).format("YYYY-MM-DD") }}
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
            <!-- <el-button
              type="primary"
              plain
              size="small"
              @click="handleEdit(row)"
              v-auth="'base:sys:user:update'"
              >编辑</el-button
            > -->
            <el-button
              type="danger"
              plain
              size="small"
              @click="handleDel(row)"
              v-auth="'base:sys:user:delete'"
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

    <el-dialog v-model="dialogVisible" :title="title" width="70%">
      <el-form
        ref="updateFormRef"
        style="width: 100%"
        :model="updataForm"
        :rules="rules"
        label-width="auto"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="updataForm.title" />
        </el-form-item>
        <!-- <el-form-item label="内容" prop="body">
          <QuillInput v-model="updataForm.body" height="260px" />
        </el-form-item> -->
        <el-form-item label="内容" prop="body">
          <MarkDown v-model="updataForm.body" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- <updateFormDialog @success="handleSuccess" ref="updateFormRef" :title="title" /> -->
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { updateUser, getUserPage, deleteUser } from "@/api/user";
import { getPostsPage, deletePosts, addPosts } from "@/api/posts";
// import updateFormDialog from "./components/update-form.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import QuillInput from "@/views/quill/index.vue";
import MarkDown from "@/views/markdown/index.vue";
import dayjs from "dayjs";
defineOptions({
  name: "RoleList",
});
const updataForm = ref({
  body: "",
  title: "",
});
const tableData = ref([]);
const dialogVisible = ref(false);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref("default");
const background = ref(false);
const updateFormRef = ref(null);
const total = ref(0);
const checkList = ref([]);
const title = ref("编辑");
const rules = ref({
  title: [
    {
      required: true,
      message: "请输入标题",
      trigger: "blur",
    },
  ],
  body: [
    {
      required: true,
      message: "请输入内容",
      trigger: "blur",
    },
  ],
});
const handleConfirm = async () => {
  await updateFormRef.value.validate();
  const res = await addPosts(updataForm.value);
  console.log(">>>>>新增", res);
  if (res.code == 1000) {
    dialogVisible.value = false;
    updataForm.value = {};
    pageSize.value = 10;
    currentPage.value = 1;
    ElMessage.success("新增成功!");
    refresh();
  } else {
    ElMessage.error(res.message);
  }
};
const refresh = async () => {
  loading.value = true;
  try {
    const res = await getPostsPage({
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
        await deletePosts({ ids: [row.id] });
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
        await deletePosts({ ids: checkList.value.map((item) => item.id) });
        ElMessage.success("删除成功");
        refresh();
      }
    },
  });
};
const handleAdd = () => {
  title.value = "新增";
  dialogVisible.value = true;
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
