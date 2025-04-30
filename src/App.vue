<template>
  <el-config-provider :locale="locale">
    <div class="app-container">
      <template v-if="!userStore.isLoggedIn">
        <div class="auth-container">
          <el-card class="auth-card">
            <template #header>
              <div class="auth-header">
                <h2>{{ isLogin ? '登录' : '注册' }}</h2>
                <el-button type="text" @click="toggleAuthMode">
                  {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
                </el-button>
              </div>
            </template>

            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="80px"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="form.username"
                  placeholder="请输入用户名"
                />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  show-password
                  placeholder="请输入密码"
                />
              </el-form-item>
              <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  show-password
                  placeholder="请再次输入密码"
                />
              </el-form-item>
            </el-form>

            <div class="auth-footer">
              <el-button
                type="primary"
                :loading="loading"
                @click="handleSubmit"
              >
                {{ isLogin ? '登录' : '注册' }}
              </el-button>
            </div>
          </el-card>
        </div>
      </template>

      <template v-else>
        <div
          class="absolute inset-0 h-full flex flex-col px-4 pb-4 pt-1 space-y-4 overflow-hidden"
        >
          <div
            class="flex items-center flex-none border-b border-gray-200 dark:border-gray-700 pb-1"
          >
            <div class="flex-none">
              <el-segmented
                v-slot="{ item }"
                v-model="activeTab"
                :options="tabsModel"
                @change="onTabChange"
              >
                <div class="">
                  {{ $t(item.label) }}
                </div>
              </el-segmented>
            </div>
            <div class="flex-1 w-0 flex items-center justify-end">
              <Quick />
            </div>
          </div>

          <div class="flex-1 h-0 overflow-auto">
            <template v-for="item of tabsModel" :key="item.value">
              <component
                :is="item.component"
                v-if="isRender(item)"
                v-show="item.value === activeTab"
              ></component>
            </template>
          </div>
        </div>
      </template>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import { i18n } from '$/locales/index.js'
import localeModel from '$/plugins/element-plus/locale.js'
import { usePreferenceStore } from '$/store/preference/index.js'
import { useUserStore } from '$/store/user/index.js'
import { useThemeStore } from '$/store/theme/index.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import Device from './components/Device/index.vue'
import Preference from './components/Preference/index.vue'
import Quick from './components/Quick/index.vue'
import User from './components/User/index.vue'

const locale = computed(() => {
  const i18nLocale = i18n.global.locale.value
  const value = localeModel[i18nLocale]
  return value
})

const userStore = useUserStore()
const themeStore = useThemeStore()
const preferenceStore = usePreferenceStore()

// 登录/注册相关
const isLogin = ref(true)
const loading = ref(false)
const formRef = ref(null)
const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
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
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  form.value = {
    username: '',
    password: '',
    confirmPassword: ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isLogin.value) {
      await userStore.login(form.value.username, form.value.password)
      ElMessage.success('登录成功')
    } else {
      await userStore.register({
        username: form.value.username,
        password: form.value.password
      })
      ElMessage.success('注册成功')
      isLogin.value = true
    }
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

// 检查登录状态
const checkLoginStatus = () => {
  if (!userStore.isLoggedIn) {
    // 未登录，显示登录组件
    return 'User'
  }
  return activeTab.value
}

const tabsModel = computed(() => {
  const baseTabs = [
    {
      label: 'device.list',
      value: 'Device',
      component: Device,
    }
  ]

  // 只有登录用户才能看到偏好设置
  if (userStore.isLoggedIn) {
    baseTabs.push({
      label: 'preferences.name',
      value: 'Preference',
      component: Preference,
    })
  }

  return baseTabs
})

const activeTab = ref(checkLoginStatus())
provide('activeTab', activeTab)

const renderTab = ref('')
const rendered = ref(true)
const renderSign = ref(false)

themeStore.init()
preferenceStore.init()

// 检查登录状态
userStore.checkLoginStatus()

// 如果未登录，强制显示登录界面
if (!userStore.isLoggedIn) {
  activeTab.value = 'User'
}

showTips()

async function showTips() {
  const { scrcpyPath } = window.electron?.configs || {}

  console.log('scrcpyPath', scrcpyPath, window.electron)

  if (scrcpyPath) {
    return false
  }

  ElMessageBox.alert(
    `<div>
      ${window.t('dependencies.lack.content', {
        name: '<a class="hover:underline text-primary-500" href="https://github.com/Genymobile/scrcpy" target="_blank">scrcpy</a>',
      })}
    <div>`,
    window.t('dependencies.lack.title'),
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: window.t('common.confirm'),
    },
  )
}

function isRender(item) {
  if (renderTab.value === item?.value) {
    return rendered.value
  }

  return true
}

async function reRender(other) {
  renderTab.value = other || activeTab.value

  rendered.value = false
  await nextTick()
  rendered.value = true

  renderTab.value = ''
}

function reRenderPost() {
  renderSign.value = true
}

async function onTabChange(value) {
  if (!renderSign.value) {
    return false
  }

  if (['Device', 'Preference'].includes(value)) {
    reRender()
  }

  renderSign.value = false
}

defineExpose({
  reRenderPost,
  reRender,
})
</script>

<style lang="postcss" scoped>
.app-container {
  height: 100vh;
  width: 100vw;
}

.auth-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color-page);
}

.auth-card {
  width: 400px;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.auth-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep() {
  .el-segmented {
    --el-border-radius-base: 5px;
    --el-segmented-bg-color: transparent;
    --el-segmented-item-selected-bg-color: var(--el-color-primary-light-9);
    --el-segmented-item-selected-color: rgba(var(--color-primary-500), 1);
  }
}
</style>
