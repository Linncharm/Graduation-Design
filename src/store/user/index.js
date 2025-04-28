import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePreferenceStore } from '../preference/index.js'

const LOCAL_USERS_KEY = 'local_users'
const CURRENT_USER_KEY = 'current_user'

// 权限枚举
const PERMISSIONS = {
  ADMIN: 'admin',
  USER: 'user',
  // 可以添加更多权限
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings'
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(null)
  const localUsers = ref([])
  const currentUser = ref(null)
  const preferenceStore = usePreferenceStore()

  // 权限检查
  const hasPermission = (permission) => {
    if (!userInfo.value) return false
    return userInfo.value.role === PERMISSIONS.ADMIN || userInfo.value.permissions?.includes(permission)
  }

  const isAdmin = computed(() => hasPermission(PERMISSIONS.ADMIN))

  const isLoggedIn = computed(() => !!token.value)
  const userList = computed(() => localUsers.value.map(user => ({
    username: user.username,
    avatar: user.avatar,
    lastLoginAt: user.lastLoginAt,
    description: user.description,
    role: user.role
  })))

  // 获取所有用户（管理员专用）
  const getAllUsers = computed(() => {
    if (!isAdmin.value) return []
    return localUsers.value.map(user => ({
      username: user.username,
      role: user.role,
      permissions: user.permissions || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }))
  })

  // 初始化本地用户数据
  const initLocalUsers = () => {
    const savedUsers = localStorage.getItem(LOCAL_USERS_KEY)
    if (savedUsers) {
      localUsers.value = JSON.parse(savedUsers)
    }
  }

  // 保存本地用户数据
  const saveLocalUsers = () => {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers.value))
  }

  // 注册新用户
  const register = async (userData) => {
    try {
      // 检查用户名是否已存在
      if (localUsers.value.some(user => user.username === userData.username)) {
        throw new Error('用户名已存在')
      }

      // 创建新用户
      const newUser = {
        username: userData.username,
        password: userData.password,
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        description: '这是一个新用户，点击编辑添加个人描述',
        role: PERMISSIONS.USER, // 默认普通用户
        permissions: [] // 默认无特殊权限
      }

      // 添加到用户列表
      localUsers.value.push(newUser)
      saveLocalUsers()

      // 初始化用户作用域
      preferenceStore.setUserScope(userData.username, 'global')

      return newUser
    } catch (error) {
      throw error
    }
  }

  // 更新用户权限
  const updateUserPermissions = (permissions) => {
    if (currentUser.value) {
      currentUser.value.permissions = permissions
      // 更新本地存储
      const userIndex = localUsers.value.findIndex(u => u.username === currentUser.value.username)
      if (userIndex !== -1) {
        localUsers.value[userIndex].permissions = permissions
        saveLocalUsers()
      }
    }
  }

  // 初始化
  initLocalUsers()
  initAdminAccount()
  checkLoginStatus()

  return {
    userInfo,
    token,
    isLoggedIn,
    localUsers,
    userList,
    currentUser,
    register,
    login,
    logout,
    switchUser,
    checkLoginStatus,
    updateUserDescription,
    getUserAvatar,
    updateUserAvatar,
    hasPermission,
    isAdmin,
    getAllUsers,
    updateUserRole,
    PERMISSIONS,
    updateUserPermissions
  }
})