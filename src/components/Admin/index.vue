<template>
  <div class="admin-container">
    <el-card class="admin-card">
      <template #header>
        <div class="admin-header">
          <h2>用户管理系统</h2>
          <el-button type="primary" @click="handleAddUser">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>

      <el-table
        :data="userStore.getAllUsers"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="{ row }">
            {{ new Date(row.lastLoginAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                @click="handleEditUser(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteUser(row)"
                :disabled="row.username === 'admin'"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            :disabled="dialogType === 'edit'"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '$/store/user/index.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

const form = reactive({
  username: '',
  password: '',
  role: 'user'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleAddUser = () => {
  dialogType.value = 'add'
  form.username = ''
  form.password = ''
  form.role = 'user'
  dialogVisible.value = true
}

const handleEditUser = (row) => {
  dialogType.value = 'edit'
  form.username = row.username
  form.role = row.role
  dialogVisible.value = true
}

const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.username} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 删除用户逻辑
    const index = userStore.localUsers.findIndex(u => u.username === row.username)
    if (index !== -1) {
      userStore.localUsers.splice(index, 1)
      userStore.saveLocalUsers()
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (dialogType.value === 'add') {
      // 添加用户
      await userStore.register(form.username, form.password)
      await userStore.updateUserRole(form.username, form.role)
      ElMessage.success('添加成功')
    } else {
      // 编辑用户
      await userStore.updateUserRole(form.username, form.role)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-card {
  margin-bottom: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
