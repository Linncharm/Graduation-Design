import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePreferenceStore } from '../preference/index.js'

const LOCAL_USERS_KEY = 'local_users'
const CURRENT_USER_KEY = 'current_user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(null)
  const localUsers = ref([])
  const currentUser = ref(null)
  const preferenceStore = usePreferenceStore()

  const isLoggedIn = computed(() => !!token.value)
  const userList = computed(() => localUsers.value.map(user => ({
    username: user.username,
    avatar: user.avatar,
    lastLoginAt: user.lastLoginAt,
    description: user.description
  })))

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
        password: userData.password, // 实际应用中应该加密存储
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 默认头像
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        description: '这是一个新用户，点击编辑添加个人描述'
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

  // 登录
  const login = async (loginForm) => {
    try {
      // 在本地用户中查找
      const user = localUsers.value.find(
        u => u.username === loginForm.username && u.password === loginForm.password
      )

      if (!user) {
        throw new Error('用户名或密码错误')
      }

      // 更新最后登录时间
      user.lastLoginAt = new Date().toISOString()
      saveLocalUsers()

      // 生成简单的token（实际应用中应该使用更安全的方式）
      const newToken = btoa(user.username + ':' + new Date().getTime())

      // 保存用户信息和token
      userInfo.value = { ...user, password: undefined } // 不保存密码
      token.value = newToken
      currentUser.value = user.username

      // 切换到用户的作用域
      //const userScope = preferenceStore.getUserScope(user.username)
      window.appStore.set(`user.userScope`, user.username)

      // 保存到本地存储
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        userInfo: userInfo.value,
        token: newToken,
        currentUser: user.username
      }))

      return { userInfo: userInfo.value, token: newToken }
    } catch (error) {
      throw error
    }
  }

  // 切换用户
  const switchUser = async (username) => {
    try {
      const user = localUsers.value.find(u => u.username === username)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 更新最后登录时间
      user.lastLoginAt = new Date().toISOString()
      saveLocalUsers()

      // 生成新的token
      const newToken = btoa(user.username + ':' + new Date().getTime())

      // 更新用户信息和token
      userInfo.value = { ...user, password: undefined }
      token.value = newToken
      currentUser.value = username

      // 切换到用户的作用域
      preferenceStore.setUserScope(username)

      // 更新本地存储
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        userInfo: userInfo.value,
        token: newToken,
        currentUser: username
      }))

      return { userInfo: userInfo.value, token: newToken }
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      // 清除用户信息和token
      userInfo.value = null
      token.value = null
      currentUser.value = null

      // 清除本地存储
      localStorage.removeItem(CURRENT_USER_KEY)
    } catch (error) {
      throw error
    }
  }

  // 检查登录状态
  const checkLoginStatus = () => {
    const savedData = localStorage.getItem(CURRENT_USER_KEY)
    if (savedData) {
      const { userInfo: savedUserInfo, token: savedToken, currentUser: savedCurrentUser } = JSON.parse(savedData)
      userInfo.value = savedUserInfo
      token.value = savedToken
      currentUser.value = savedCurrentUser

      // 恢复用户的作用域
    }
  }

  // 更新用户描述
  const updateUserDescription = async (username, description) => {
    try {
      const userIndex = localUsers.value.findIndex(u => u.username === username)
      if (userIndex === -1) {
        throw new Error('用户不存在')
      }

      // 更新用户描述
      localUsers.value[userIndex].description = description
      saveLocalUsers()

      // 如果当前用户是正在编辑的用户，更新当前用户信息
      if (currentUser.value === username) {
        userInfo.value = { ...userInfo.value, description }
      }

      return localUsers.value[userIndex]
    } catch (error) {
      throw error
    }
  }

  const getUserAvatar = (username) => {
    const user = localUsers.value.find(u => u.username === username)
    return user?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }

  // 初始化
  initLocalUsers()
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
    getUserAvatar
  }
})
