import axios from 'axios'

const API_BASE_URL = 'http://localhost:3888/api' // Web后台API地址

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
})

// 心跳间隔（毫秒）
const HEARTBEAT_INTERVAL = 3000

class APIService {
  constructor() {
    this.heartbeatTimer = null
  }

  // 设置用户store
  setUserStore(userStore) {
    this.userStore = userStore
  }

  // 初始化API服务
  init() {
    this.startHeartbeat()
  }

  // 开始心跳检测
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, HEARTBEAT_INTERVAL)
  }

  // 停止心跳检测
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 发送心跳
  async sendHeartbeat() {
    console.log("start heartbeat")
    try {
      console.log(this.userStore)
      const response = await api.post('/heartbeat', {
        token: this.userStore.token,
        username: this.userStore.currentUser?.username
      })

      console.log("heartbeat", response)

      if (response.data.success) {
        // 更新用户权限
        this.userStore.updateUserPermissions(response.data.permissions)
      }
    } catch (error) {
      console.error('心跳检测失败:', error)
      // 可以在这里添加重连逻辑
    }
  }

  // 用户登录
  async login(username, password) {
    try {
      const response = await api.post('/login', {
        username,
        password
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '登录失败')
    }
  }

  // 用户注册
  async register(userData) {
    try {
      const response = await api.post('/register', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '注册失败')
    }
  }

  // 用户管理API
  async getUsers() {
    const response = await api.get('/users', {
      headers: {
        Authorization: `Bearer ${this.userStore.token}`
      }
    })
    return response.data
  }

  async createUser(userData) {
    const response = await api.post('/users', userData, {
      headers: {
        Authorization: `Bearer ${this.userStore.token}`
      }
    })
    return response.data
  }

  async updateUser(username, userData) {
    const response = await api.put(`/users/${username}`, userData, {
      headers: {
        Authorization: `Bearer ${this.userStore.token}`
      }
    })
    return response.data
  }

  async deleteUser(username) {
    const response = await api.delete(`/users/${username}`, {
      headers: {
        Authorization: `Bearer ${this.userStore.token}`
      }
    })
    return response.data
  }

  // 权限管理API
  async getPermissions() {
    const response = await api.get('/permissions', {
      headers: {
        Authorization: `Bearer ${this.userStore.token}`
      }
    })
    return response.data
  }

  async updatePermissions(username, permissions) {
    const response = await api.put(`/users/${username}/permissions`, { permissions }, {
      headers: {
        Authorization: `Bearer ${this.userStore.token}`
      }
    })
    return response.data
  }
}

export const apiService = new APIService()
