<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="profile-header">
          <h2>个人信息</h2>
          <div class="header-buttons">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑信息
            </el-button>
            <el-button type="danger" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </template>

      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userStore.currentUser?.avatar" />
          <h3>{{ userStore.currentUser?.username }}</h3>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span>{{ userStore.currentUser?.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">角色：</span>
            <span>{{ userStore.currentUser?.role === 'admin' ? '管理员' : '普通用户' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span>{{ new Date(userStore.currentUser?.createdAt).toLocaleString() }}</span>
          </div>
          <div class="info-item">
            <span class="label">最后登录：</span>
            <span>{{ new Date(userStore.currentUser?.lastLoginAt).toLocaleString() }}</span>
          </div>
          <div class="info-item">
            <span class="label">个人描述：</span>
            <span>{{ userStore.currentUser?.description }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑个人信息"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="个人描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入个人描述"
          />
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
import { ElMessage } from 'element-plus'
import { Edit, Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  avatar: userStore.currentUser?.avatar,
  description: userStore.currentUser?.description
})

const rules = {
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    // 可以在这里添加路由跳转到登录页
  }).catch(() => {})
}

const handleEdit = () => {
  form.avatar = userStore.currentUser?.avatar
  form.description = userStore.currentUser?.description
  dialogVisible.value = true
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }

  // 这里应该调用上传API，这里仅做演示
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    form.avatar = reader.result
  }
  return false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    // 更新用户信息
    await userStore.updateUserProfile({
      avatar: form.avatar,
      description: form.description
    })
    
    ElMessage.success('更新成功')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.profile-content {
  display: flex;
  gap: 40px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.info-section {
  flex: 1;
}

.info-item {
  margin-bottom: 16px;
  line-height: 1.5;
}

.info-item .label {
  font-weight: 500;
  margin-right: 8px;
  color: var(--el-text-color-secondary);
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 