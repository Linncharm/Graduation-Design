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
        :data="users"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3888/api'

const users = ref([])
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

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'x-admin-request': 'true'
      }
    })
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + error.message)
  }
}

// 添加用户
const handleAddUser = () => {
  dialogType.value = 'add'
  form.username = ''
  form.password = ''
  form.role = 'user'
  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  dialogType.value = 'edit'
  form.username = row.username
  form.role = row.role
  dialogVisible.value = true
}

// 删除用户
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

    await axios.delete(`${API_BASE_URL}/users/${row.username}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'x-admin-request': 'true'
      }
    })

    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'x-admin-request': 'true'
    }

    if (dialogType.value === 'add') {
      // 添加用户
      await axios.post(`${API_BASE_URL}/users`, {
        username: form.username,
        password: form.password,
        permissions: form.role === 'admin' ? ['admin', 'manage_users', 'manage_settings'] : ['user']
      }, { headers })
      ElMessage.success('添加成功')
    } else {
      // 编辑用户
      await axios.put(`${API_BASE_URL}/users/${form.username}`, {
        permissions: form.role === 'admin' ? ['admin', 'manage_users', 'manage_settings'] : ['user']
      }, { headers })
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(() => {
  fetchUsers()
})
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