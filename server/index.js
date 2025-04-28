import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'

const app = express()
const PORT = 3888

// 中间件
app.use(cors())
app.use(bodyParser.json())

// JWT密钥
const JWT_SECRET = 'your-secret-key'

// 模拟数据库
let users = [
  {
    username: 'admin',
    password: 'admin123',
    permissions: ['admin', 'manage_users', 'manage_settings'],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
]

// 验证Token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的认证令牌' })
    }
    req.user = user
    next()
  })
}

// 心跳检测接口
app.post('/api/heartbeat', (req, res) => {
  const { token, username } = req.body

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = users.find(u => u.username === username)

    if (user && decoded.username === username) {
      res.json({
        success: true,
        permissions: user.permissions
      })
    } else {
      res.status(403).json({ error: '无效的用户信息' })
    }
  } catch (error) {
    res.status(403).json({ error: '无效的令牌' })
  }
})

// 用户管理接口
app.get('/api/users', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username)
  if (!user.permissions.includes('manage_users')) {
    return res.status(403).json({ error: '无权限访问' })
  }

  res.json(users.map(u => ({
    username: u.username,
    permissions: u.permissions,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  })))
})

app.post('/api/users', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username)
  if (!user.permissions.includes('manage_users')) {
    return res.status(403).json({ error: '无权限访问' })
  }

  const { username, password, permissions } = req.body
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' })
  }

  const newUser = {
    username,
    password,
    permissions: permissions || ['user'],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }

  users.push(newUser)
  res.status(201).json(newUser)
})

app.put('/api/users/:username', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username)
  if (!user.permissions.includes('manage_users')) {
    return res.status(403).json({ error: '无权限访问' })
  }

  const { username } = req.params
  const { permissions } = req.body

  const targetUser = users.find(u => u.username === username)
  if (!targetUser) {
    return res.status(404).json({ error: '用户不存在' })
  }

  targetUser.permissions = permissions
  res.json(targetUser)
})

app.delete('/api/users/:username', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username)
  if (!user.permissions.includes('manage_users')) {
    return res.status(403).json({ error: '无权限访问' })
  }

  const { username } = req.params
  if (username === 'admin') {
    return res.status(400).json({ error: '不能删除管理员账号' })
  }

  users = users.filter(u => u.username !== username)
  res.json({ success: true })
})

// 权限管理接口
app.get('/api/permissions', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username)
  res.json({ permissions: user.permissions })
})

app.put('/api/users/:username/permissions', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.user.username)
  if (!user.permissions.includes('manage_users')) {
    return res.status(403).json({ error: '无权限访问' })
  }

  const { username } = req.params
  const { permissions } = req.body

  const targetUser = users.find(u => u.username === username)
  if (!targetUser) {
    return res.status(404).json({ error: '用户不存在' })
  }

  targetUser.permissions = permissions
  res.json(targetUser)
})

// 启动服务器
app.listen(PORT, () => {
  console.log('=========================================')
  console.log('🚀 Web后台服务器已启动')
  console.log(`📡 监听地址: http://localhost:${PORT}`)
  console.log('=========================================')

  // 打印可用的API端点
  console.log('\n📋 可用的API端点:')
  console.log('POST /api/heartbeat - 心跳检测')
  console.log('GET  /api/users - 获取用户列表')
  console.log('POST /api/users - 创建新用户')
  console.log('PUT  /api/users/:username - 更新用户')
  console.log('DELETE /api/users/:username - 删除用户')
  console.log('GET  /api/permissions - 获取权限')
  console.log('PUT  /api/users/:username/permissions - 更新权限')
  console.log('\n=========================================')
})