<template>
  <div class="role-area">
    <div class="role-area-header">
      <el-button type="primary" plain size="default" @click="refresh">刷新</el-button>
      <el-button type="primary" size="default" @click="handleAdd" v-auth="'base:sys:user:add'">新增</el-button>
      <el-button type="danger" size="default" :disabled="!checkList.length" @click="handleBatchDel"
        v-auth="'base:sys:user:delete'">批量删除</el-button>
    </div>
    <div class="role-area-table">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="headImg" label="头像" width="120" align="center">
          <template #default="{ row }">
            <img style="height: 40px;width: 40px;border-radius: 50%;" :src="row.headImg" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column prop="roleName" label="角色" width="120">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="item in row.roleName.split(',')" :key="item">{{ item }}</el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="120">
          <template #default="{ row }">
            <el-switch :modelValue="!!row.status" @update:modelValue="handleStatusChange(row.id, $event)" />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="phone" label="手机号码" min-width="120" />
        <el-table-column prop="createTime" label="创建时间" min-width="120">
          <template #default="{ row }">
            {{ dayjs(row.createTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="120">
          <template #default="{ row }">
            {{ dayjs(row.updateTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" align="center" fixed="right" width="140">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="handleEdit(row)"
              v-auth="'base:sys:user:update'">编辑</el-button>
            <el-button type="danger" plain size="small" @click="handleDel(row)"
              v-auth="'base:sys:user:delete'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="role-area-pagination">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
        :size="size" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <updateFormDialog @success="handleSuccess" ref="updateFormRef" :title="title" />
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { updateUser, getUserPage, deleteUser } from "@/api/user";
import updateFormDialog from "./components/update-form.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
defineOptions({
  name: 'RoleList',
})
const tableData = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref("default");
const background = ref(false);
const updateFormRef = ref(null);
const total = ref(0);
const checkList = ref([]);
const title = ref('编辑')
const refresh = async () => {
  loading.value = true;
  try {
    const res = await getUserPage({ page: currentPage.value, size: pageSize.value });
    tableData.value = res.data.list;
    total.value = res.data.pagination.total;
    console.log(">>>>res>", res);

    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};
const handleStatusChange = async (id, status) => {
  await updateUser({ id, status: status ? 1 : 0 });
  refresh();
  ElMessage.success("操作成功");
};
const handleSizeChange = (val) => {
  refresh()
};
const handleCurrentChange = (val) => {
  refresh()
};
const handleSelectionChange = (val) => {
  // multipleSelection.value = val
  console.log(">>>>>多选", val);
  checkList.value = val
};
const handleSuccess = () => {
  refresh();
  ElMessage.success("操作成功");
  updateFormRef.value.handleCancle()
}
const handleEdit = (row) => {
  title.value = '编辑'
  updateFormRef.value.visible = true

  updateFormRef.value.setForm(row)
}

const handleDel = async (row) => {
  ElMessageBox.alert('确定删除吗？', '温馨提示', {
    confirmButtonText: 'OK',
    callback: async (action) => {
      if (action === 'confirm') {
        await deleteUser({ ids: [row.id] });
        ElMessage.success('删除成功');
        refresh();
      }
    },
  })
}
const handleBatchDel = async () => {
  if (!checkList.value.length) return ElMessage.warning('请选择要删除的数据！')
  ElMessageBox.alert('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    callback: async (action) => {
      if (action === 'confirm') {
        await deleteUser({ ids: checkList.value.map(item => item.id) });
        ElMessage.success('删除成功');
        refresh();
      }
    },
  })
}
const handleAdd = () => {
  title.value = '新增'
  updateFormRef.value.setForm({ id: 0 })
  updateFormRef.value.visible = true
}
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
