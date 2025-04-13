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
        </div>
        <el-button-group class="flex-none">
          <!-- <el-button type="" icon="Upload" plain @click="handleImport">
            {{ $t('preferences.config.import.name') }}
          </el-button>
          <el-button type="" icon="Download" plain @click="handleExport">
            {{ $t('preferences.config.export.name') }}
          </el-button>
          <el-button type="" icon="Edit" plain @click="handleEdit">
            {{ $t('preferences.config.edit.name') }}
          </el-button>
          <el-button type="" icon="RefreshRight" plain @click="handleReset">
            {{ $t('preferences.config.reset.name') }}
          </el-button> -->
        </el-button-group>
      </div>

      <div class="pr-2 pt-4 flex-1 h-0 overflow-auto">
        <PreferenceForm
          v-model="preferenceData"
          v-bind="{
            deviceScope,
          }"
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
import { computed } from 'vue'

export default {
  components: {
    ScopeSelect,
    PreferenceForm,
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
    console.log(userList)
    const currentUser = computed({
      get: () => userStore.currentUser,
      set: (value) => userStore.switchUser(value)
    })

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
      userList
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
      this.preferenceStore.setData(this.preferenceData, this.deviceScope, this.currentUser)

      this.$message({
        message: this.$t('preferences.config.save.placeholder'),
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
</style>
