<template>
  <div class="h-full flex flex-col overflow-hidden">
    <template v-if="isLoggedIn">
      <div
        class="mr-4 pb-2 flex items-center justify-between flex-none border-b border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-row gap-4">
          <el-select
            v-model="currentUser"
            class="ml-4 min-w-[4.75rem]"
            placeholder="切换用户"
            @change="handleUserChange"
          >
            <el-option
              v-for="user in userList"
              :key="user.username"
              :label="user.username"
              :value="user.username"
            />
          </el-select>
          <ScopeSelect
            class="ml-4 min-w-[16.75rem]"
            v-model="deviceScope"
            @change="onScopeChange"
            @device-change="onDeviceChange"
          />

          <el-button
            class="ml-4"
            type="danger"
            plain
            @click="handleLogout"
          >
            退出登录
          </el-button>
          <!-- 添加账号 -->
          <el-button
            class="ml-4"
            type="primary"
            @click="handleAddUser"
          >
            添加账号
          </el-button>
        </div>
        <el-button-group class="flex-none">
          <el-button type="" icon="RefreshRight" plain @click="handleReset">
            {{ $t('preferences.config.reset.name') }}
          </el-button>
        </el-button-group>
      </div>

      <div class="pr-2 pt-4 flex-1 h-0 overflow-auto">
        <!-- 用户信息和用户列表的左右布局 -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <!-- 用户信息展示部分 -->
          <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div class="flex flex-col items-center">
              <div class="relative group">
                <el-avatar :size="100" :src="userStore.userInfo.avatar" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                     @click="handleAvatarClick">
                  <el-icon class="text-white text-xl"><Upload /></el-icon>
                </div>
                <input type="file" ref="avatarInput" class="hidden" accept="image/*" @change="handleAvatarChange" />
              </div>
              <h2 class="mt-4 text-2xl font-bold">{{ userStore.userInfo.username }}</h2>
              <div class="mt-2 w-full">
                <div class="user-description">
                  <el-input
                    v-if="isEditingDescription"
                    v-model="editingDescription"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入个人描述"
                    @blur="handleDescriptionBlur"
                  />
                  <div v-else class="description-text" @click="startEditingDescription">
                    {{ userStore.userInfo.description || '点击添加个人描述' }}
                  </div>
                </div>
                <div class="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDate(userStore.userInfo.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-icon><Timer /></el-icon>
                    <span>最近登录：{{ formatDate(userStore.userInfo.lastLoginAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户列表展示 -->
          <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">用户列表</h3>
            <div class="user-list h-[calc(100%-2.5rem)]">
              <el-scrollbar>
                <div
                  v-for="user in userStore.userList"
                  :key="user.username"
                  class="user-list-item"
                  :class="{ 'current-user': user.username === userStore.currentUser }"
                  @click="handleUserChange(user.username)"
                >
                  <el-avatar :size="40" :src="user.avatar" />
                  <div class="user-list-item-info">
                    <span class="username">{{ user.username }}</span>
                    <span class="last-login">最近登录：{{ formatDate(user.lastLoginAt) }}</span>
                  </div>
                  <el-tag v-if="user.username === userStore.currentUser" type="success" size="small">当前用户</el-tag>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>

        <!-- 配置对比展示 -->
        <div class="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4">配置差异对比</h3>
          <div class="config-diff">
            <el-table :data="configDiffData" style="width: 100%" border>
              <el-table-column prop="configItem" label="配置项" width="180" />
              <el-table-column label="用户配置" min-width="200">
                <template #default="{ row }">
                  <div class="flex flex-col gap-2">
                    <div v-for="(value, username) in row.userConfigs" :key="username"
                         class="flex items-center gap-2 p-2 rounded"
                         :class="{'bg-blue-50 dark:bg-blue-900': username === userStore.currentUser}">
                      <el-avatar :size="24" :src="userStore.getUserAvatar(username)" />
                      <span class="font-medium">{{ username }}</span>
                      <el-tag size="small" :type="getConfigTagType(value)">
                        {{ formatConfigValue(value) }}
                      </el-tag>
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 偏好设置表单 -->
        <PreferenceForm
          v-model="preferenceData"
          v-bind="{
            deviceScope,
          }"
          :excludes="['common']"
        >
        </PreferenceForm>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center h-full">
        <div class="w-80 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-center">{{ isRegister ? $t('user.register') : $t('user.login') }}</h2>
            <el-button type="text" @click="toggleMode">
              {{ isRegister ? $t('user.login') : $t('user.register') }}
            </el-button>
          </div>

          <el-form
            :model="formData"
            :rules="rules"
            ref="formRef"
            @keyup.enter="handleSubmit"
          >
            <el-form-item prop="username">
              <el-input
                v-model="formData.username"
                :placeholder="$t('user.username')"
                prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                :placeholder="$t('user.password')"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item v-if="isRegister" prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                type="password"
                :placeholder="$t('user.confirmPassword')"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                class="w-full"
              >
                {{ isRegister ? $t('user.register') : $t('user.login') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { usePreferenceStore } from '$/store/index.js'
import { useUserStore } from '$/store/user/index.js'
import { debounce } from 'lodash-es'
import PreferenceForm from './components/PreferenceForm/index.vue'
import ScopeSelect from './components/ScopeSelect/index.vue'
import { computed, ref, reactive } from 'vue'
import { t } from '$/locales'
import { Calendar, Timer, Upload } from '@element-plus/icons-vue'

export default {
  components: {
    ScopeSelect,
    PreferenceForm,
    Calendar,
    Timer,
    Upload
  },
  setup() {
    const preferenceStore = usePreferenceStore()
    const userStore = useUserStore()

    const preferenceData = ref(preferenceStore.data)
    const deviceScope = computed({
      get: () => preferenceStore.deviceScope,
      set: (value) => preferenceStore.setUserScope(currentUser.value, value)
    })
    const formRef = ref(null)
    const loading = ref(false)
    const isRegister = ref(false)
    const isEditingDescription = ref(false)
    const editingDescription = ref('')
    const avatarInput = ref(null)

    const formData = reactive({
      username: '',
      password: '',
      confirmPassword: ''
    })

    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (formData.confirmPassword !== '') {
          formRef.value?.validateField('confirmPassword')
        }
        callback()
      }
    }

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== formData.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    const rules = computed(() => ({
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ],
      ...(isRegister.value ? {
        confirmPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      } : {})
    }))

    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const userList = computed(() => userStore.userList)
    const currentUser = computed({
      get: () => userStore.currentUser,
      set: (value) => userStore.switchUser(value)
    })

    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const startEditingDescription = () => {
      editingDescription.value = userStore.userInfo.description || ''
      isEditingDescription.value = true
    }

    const handleDescriptionBlur = async () => {
      if (editingDescription.value !== userStore.userInfo.description) {
        try {
          await userStore.updateUserDescription(userStore.userInfo.username, editingDescription.value)
          ElMessage.success('个人描述更新成功')
        } catch (error) {
          ElMessage.error('更新个人描述失败：' + error.message)
        }
      }
      isEditingDescription.value = false
    }

    const onScopeChange = (value) => {
      preferenceStore.setUserScope(currentUser.value, value)
    }

    const onDeviceChange = (options) => {
      const device = options.some(
        item => this.$replaceIP(item.value) === deviceScope.value,
      )

      if (device) {
        return false
      }

      preferenceStore.setUserScope(currentUser.value, 'global')
    }

    // 提取配置差异数据
    const configDiffData = computed(() => {
      const diffData = []
      const allUsers = userStore.userList.map(user => user.username)
      console.log('所有用户:', allUsers)

      // 获取所有配置项
      const configItems = new Set()
      allUsers.forEach(username => {
        const userConfig = preferenceStore.getUserConfig(username)
        console.log(`用户 ${username} 的配置:`, userConfig)
        if (userConfig) {
          // 遍历common配置
          Object.entries(userConfig.common || {}).forEach(([key, value]) => {
            configItems.add(`common.${key}`)
          })
          // 遍历scrcpy配置
          Object.entries(userConfig.scrcpy || {}).forEach(([deviceId, deviceConfig]) => {
            Object.keys(deviceConfig).forEach(key => {
              configItems.add(`scrcpy.${deviceId}.${key}`)
            })
          })
        }
      })
      console.log('所有配置项:', Array.from(configItems))

      // 对每个配置项，收集所有用户的值
      configItems.forEach(item => {
        const userConfigs = {}
        let hasDiff = false
        let firstValue = null

        allUsers.forEach(username => {
          const userConfig = preferenceStore.getUserConfig(username)
          if (userConfig) {
            const value = getNestedValue(userConfig, item)
            userConfigs[username] = value
            console.log(`配置项 ${item} - 用户 ${username} 的值:`, value)

            if (firstValue === null) {
              firstValue = value
            } else if (JSON.stringify(firstValue) !== JSON.stringify(value)) {
              hasDiff = true
              console.log(`发现差异 - 配置项: ${item}, 值1: ${firstValue}, 值2: ${value}`)
            }
          }
        })

        // 只添加有差异的配置项
        if (hasDiff) {
          console.log(`添加差异配置项: ${item}`, userConfigs)
          diffData.push({
            configItem: formatConfigItemName(item),
            userConfigs,
            category: item.split('.')[0]
          })
        }
      })

      console.log('最终差异数据:', diffData)
      return diffData
    })

    // 获取嵌套对象的值
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => {
        return current ? current[key] : undefined
      }, obj)
    }

    // 格式化配置项名称
    const formatConfigItemName = (item) => {
      const [section, ...rest] = item.split('.')
      if (section === 'common') {
        const [key] = rest
        const keyMap = {
          theme: '主题',
          language: '语言',
          savePath: '保存路径'
        }
        return keyMap[key] || key
      } else if (section === 'scrcpy') {
        const [deviceId, configKey] = rest
        const keyMap = {
          '--max-size': '最大尺寸',
          '--bit-rate': '比特率',
          '--max-fps': '最大帧率'
        }
        return `${keyMap[configKey] || configKey} (设备: ${deviceId})`
      }
      return item
    }

    // 获取配置标签类型
    const getConfigTagType = (value) => {
      if (typeof value === 'boolean') {
        return value ? 'success' : 'danger'
      }
      if (typeof value === 'number') {
        return 'info'
      }
      if (typeof value === 'string') {
        if (value.includes('light')) return 'warning'
        if (value.includes('dark')) return 'info'
        if (value.includes('system')) return 'success'
      }
      return ''
    }

    // 格式化配置值
    const formatConfigValue = (value) => {
      if (typeof value === 'string') {
        if (value.includes('light')) return '浅色'
        if (value.includes('dark')) return '深色'
        if (value.includes('system')) return '跟随系统'
        if (value.includes('zh-CN')) return '中文'
        if (value.includes('en-US')) return '英文'
      }
      return value
    }

    const handleAvatarClick = () => {
      avatarInput.value?.click()
    }

    const handleAvatarChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请选择图片文件')
        return
      }

      // 检查文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过2MB')
        return
      }

      try {
        // 创建文件预览URL
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const avatarUrl = e.target.result
            console.log('Updating avatar for user:', userStore.currentUser)
            console.log('User store methods:', Object.keys(userStore))
            // 更新用户头像
            if (typeof userStore.updateUserAvatar === 'function') {
              userStore.updateUserAvatar(avatarUrl)
              ElMessage.success('头像更新成功')
            } else {
              throw new Error('updateUserAvatar方法不存在')
            }
          } catch (error) {
            console.error('Avatar update error:', error)
            ElMessage.error('头像更新失败：' + error.message)
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        ElMessage.error('头像上传失败')
        console.error('Avatar upload error:', error)
      }
    }

    return {
      preferenceStore,
      userStore,
      preferenceData,
      deviceScope,
      formData,
      formRef,
      loading,
      rules,
      isLoggedIn,
      currentUser,
      isRegister,
      userList,
      isEditingDescription,
      editingDescription,
      formatDate,
      startEditingDescription,
      handleDescriptionBlur,
      configDiffData,
      formatConfigValue,
      getConfigTagType,
      avatarInput,
      handleAvatarClick,
      handleAvatarChange
    }
  },
  watch: {
    'preferenceData': {
      handler() {
        this.handleSave()
      },
      deep: true,
    },
    'preferenceData.theme': {
      handler(value) {
        this.$store.theme.update(value)
        window.electron.ipcRenderer.send('theme-change', value)
      },
    },
    'preferenceData.adbPath': {
      handler() {
        this.handleDevices()
      },
    },
  },
  created() {
    this.handleSave = debounce(this.handleSave, 1000)
    this.handleDevices = debounce(this.handleDevices, 1000)
  },
  methods: {
    toggleMode() {
      this.isRegister = !this.isRegister
      this.formData.confirmPassword = ''
      this.$nextTick(() => {
        this.formRef?.clearValidate()
      })
    },
    async handleSubmit() {
      if (!this.formRef) return

      try {
        await this.formRef.validate()
        this.loading = true

        if (this.isRegister) {
          await this.userStore.register({
            username: this.formData.username,
            password: this.formData.password
          })
          this.$message.success(this.$t('user.registerSuccess'))
          this.isRegister = false
        } else {
          await this.userStore.login({
            username: this.formData.username,
            password: this.formData.password
          })
          this.$message.success(this.$t('user.loginSuccess'))
        }
      } catch (error) {
        this.$message.error(error.message || (this.isRegister ? this.$t('user.registerFailed') : this.$t('user.loginFailed')))
      } finally {
        this.loading = false
      }
    },
    handleDevices() {
      this.$root.reRenderPost()
    },
    handleReset() {
      this.preferenceStore.reset(this.deviceScope)
      this.preferenceData = this.preferenceStore.data
    },

    async handleImport() {
      try {
        await this.$electron.ipcRenderer.invoke('show-open-dialog', {
          preset: 'replaceFile',
          filePath: this.$appStore.path,
          filters: [
            {
              name: this.$t('preferences.config.import.placeholder'),
              extensions: ['json'],
            },
          ],
        })

        this.$message.success(this.$t('preferences.config.import.success'))

        this.preferenceData = this.preferenceStore.init()
      }
      catch (error) {
        if (error.message) {
          const message = error.message?.match(/Error: (.*)/)?.[1]
          this.$message.warning(message || error.message)
        }
      }
    },

    handleEdit() {
      this.$appStore.openInEditor()
    },

    async handleExport() {
      const messageEl = this.$message.loading(
        this.$t('preferences.config.export.message'),
      )

      try {
        await this.$electron.ipcRenderer.invoke('show-save-dialog', {
          defaultPath: 'escrcpy-configs.json',
          filePath: this.$appStore.path,
          filters: [
            {
              name: this.$t('preferences.config.export.placeholder'),
              extensions: ['json'],
            },
          ],
        })
        this.$message.success(this.$t('preferences.config.export.success'))
      }
      catch (error) {
        if (error.message) {
          const message = error.message?.match(/Error: (.*)/)?.[1]
          this.$message.warning(message || error.message)
        }
      }

      messageEl.close()
    },

    handleSave() {

      this.preferenceStore.init(this.deviceScope, this.currentUser)
      this.preferenceStore.setData(this.preferenceData, this.deviceScope, this.currentUser)

      this.$message({
        message: `${this.currentUser} ${this.$t('preferences.config.save.placeholder')}`,
        type: 'success',
        grouping: true,
      })
    },

    async handleUserChange(username) {
      try {
        await this.userStore.switchUser(username)
        this.preferenceData = this.preferenceStore.init(this.deviceScope, username)
        this.$message.success(`已切换到用户：${username}`)
      } catch (error) {
        this.$message.error(error.message || '切换用户失败')
      }
    },

    async handleLogout() {
      try {
        await this.userStore.logout()
        this.$message.success('已退出登录')
      } catch (error) {
        this.$message.error(error.message || '退出登录失败')
      }
    },

    async handleAddUser() {
      await this.userStore.logout()
      this.isRegister = true
    },
  },
}
</script>

<style scoped lang="postcss">
:deep(.el-collapse-item__header) {
  @apply h-13 leading-13;
}

:deep(.el-collapse-item__arrow) {
  @apply w-2em;
}

.user-description {
  @apply mt-4;
}

.description-text {
  @apply p-2 rounded bg-gray-50 dark:bg-gray-700 cursor-pointer min-h-[60px] text-gray-600 dark:text-gray-300;
}

.description-text:hover {
  @apply bg-gray-100 dark:bg-gray-600;
}

.user-list {
  @apply space-y-2;
}

.user-list-item {
  @apply flex items-center gap-3 p-3 rounded cursor-pointer transition-colors;
}

.user-list-item:hover {
  @apply bg-gray-50 dark:bg-gray-700;
}

.user-list-item.current-user {
  @apply bg-blue-50 dark:bg-blue-900;
}

.user-list-item-info {
  @apply flex-1 flex flex-col;
}

.username {
  @apply font-medium text-gray-900 dark:text-gray-100;
}

.last-login {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.config-diff {
  @apply overflow-x-auto;
}

:deep(.el-table) {
  @apply bg-transparent;
}

:deep(.el-table__header) {
  @apply bg-gray-50 dark:bg-gray-700;
}

:deep(.el-table__row) {
  @apply bg-white dark:bg-gray-800;
}

:deep(.el-table__cell) {
  @apply border-gray-200 dark:border-gray-700;
}
</style>
