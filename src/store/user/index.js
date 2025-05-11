import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePreferenceStore } from '../preference/index.js'
import { apiService } from '../../services/api.js'

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

  // 初始化API服务，应该在登录后设置
  // apiService.setUserStore({
  //   token: token.value,
  //   currentUser: currentUser.value,
  //   updateUserPermissions: (permissions) => {
  //     if (currentUser.value) {
  //       currentUser.value.permissions = permissions
  //     }
  //   }
  // })

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
  const initLocalUsers = async () => {
    try {
      if (isAdmin.value) {
        const users = await apiService.getUsers()
        localUsers.value = users
        saveLocalUsers()
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      const savedUsers = localStorage.getItem(LOCAL_USERS_KEY)
      if (savedUsers) {
        localUsers.value = JSON.parse(savedUsers)
      }
    }
  }

  // 初始化管理员账户
  // const initAdminAccount = async () => {
  //   try {
  //     const users = await apiService.getUsers()
  //     const adminExists = users.some(user => user.username === 'admin')
      
  //     if (!adminExists) {
  //       const adminUser = {
  //         username: 'admin',
  //         password: 'admin123',
  //         role: PERMISSIONS.ADMIN,
  //         permissions: [PERMISSIONS.ADMIN, PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_SETTINGS],
  //         createdAt: new Date().toISOString(),
  //         lastLoginAt: new Date().toISOString(),
  //         avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  //         description: '系统管理员'
  //       }
  //       await apiService.createUser(adminUser)
  //       localUsers.value.push(adminUser)
  //       saveLocalUsers()
  //     }
  //   } catch (error) {
  //     console.error('初始化管理员账户失败:', error)
  //   }
  // }

  // 检查登录状态
  const checkLoginStatus = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('currentUser')
    if (savedToken && savedUser) {
      token.value = savedToken
      currentUser.value = JSON.parse(savedUser)
      userInfo.value = currentUser.value
      apiService.setUserStore({
        token:token.value,
        currentUser:currentUser.value
      })
      apiService.init()
    }
  }

  // 保存本地用户数据
  const saveLocalUsers = () => {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers.value))
  }

  // 登录
  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password)
      token.value = response.token
      currentUser.value = response.user
      userInfo.value = response.user
      
      // 更新最后登录时间
      const userIndex = localUsers.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        localUsers.value[userIndex].lastLoginAt = new Date().toISOString()
        saveLocalUsers()
      }

      // 保存登录状态
      localStorage.setItem('token', token.value)
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))

      return response
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    currentUser.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }

  // 切换用户
  const switchUser = async (username) => {
    try {
      const user = localUsers.value.find(u => u.username === username)
      if (!user) {
        throw new Error('用户不存在')
      }
      
      // 通过API验证用户
      const response = await apiService.login(user.username, user.password)
      token.value = response.token
      currentUser.value = response.user
      userInfo.value = response.user
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } catch (error) {
      throw error
    }
  }

  // 注册新用户
  const register = async (userData) => {
    try {
      // 通过API注册用户
      const response = await apiService.register(userData)

      console.log("register" , response)
      
      // 创建新用户对象
      const newUser = {
        username: userData.username,
        password: userData.password,
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        description: '这是一个新用户，点击编辑添加个人描述',
        role: PERMISSIONS.USER,
        permissions: []
      }

      // 更新本地用户列表
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
  const updateUserPermissions = async (username, permissions) => {
    try {
      await apiService.updatePermissions(username, permissions)
      
      const userIndex = localUsers.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        localUsers.value[userIndex].permissions = permissions
        saveLocalUsers()
      }
    } catch (error) {
      throw error
    }
  }

  // 更新用户角色
  const updateUserRole = async (username, role) => {
    try {
      await apiService.updateUser(username, { role })
      
      const userIndex = localUsers.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        localUsers.value[userIndex].role = role
        saveLocalUsers()
      }
    } catch (error) {
      throw error
    }
  }

  // 更新用户描述
  const updateUserDescription = async (username, description) => {
    try {
      await apiService.updateUser(username, { description })
      
      const userIndex = localUsers.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        localUsers.value[userIndex].description = description
        saveLocalUsers()
      }
    } catch (error) {
      throw error
    }
  }

  // 获取用户头像
  const getUserAvatar = (username) => {
    const user = localUsers.value.find(u => u.username === username)
    return user?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }

  // 更新用户头像
  const updateUserAvatar = async (username, avatar) => {
    try {
      await apiService.updateUser(username, { avatar })
      
      const userIndex = localUsers.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        localUsers.value[userIndex].avatar = avatar
        saveLocalUsers()
      }
    } catch (error) {
      throw error
    }
  }

  // 初始化
  initLocalUsers()
  //initAdminAccount()
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
