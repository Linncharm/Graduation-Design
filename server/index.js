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

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  // 更新最后登录时间
  user.lastLoginAt = new Date().toISOString()

  // 生成JWT令牌
  const token = jwt.sign(
    { username: user.username, permissions: user.permissions },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    token,
    user: {
      username: user.username,
      permissions: user.permissions,
      role: user.permissions.includes('admin') ? 'admin' : 'user',
      lastLoginAt: user.lastLoginAt,
      description: user.description || '',
      avatar: user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  })
})

// 用户注册
app.post('/api/register', (req, res) => {
  const { username, password } = req.body

  // 检查用户名是否已存在
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' })
  }

  // 创建新用户
  const newUser = {
    username,
    password,
    permissions: ['user'],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    description: '这是一个新用户，点击编辑添加个人描述',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }

  users.push(newUser)

  // 生成JWT令牌
  const token = jwt.sign(
    { username: newUser.username, permissions: newUser.permissions },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.status(201).json({
    token,
    user: {
      username: newUser.username,
      permissions: newUser.permissions,
      role: 'user',
      lastLoginAt: newUser.lastLoginAt,
      description: newUser.description,
      avatar: newUser.avatar
    }
  })
})

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
  console.log('POST /api/login - 用户登录')
  console.log('POST /api/register - 用户注册')
  console.log('POST /api/heartbeat - 心跳检测')
  console.log('GET  /api/users - 获取用户列表')
  console.log('POST /api/users - 创建新用户')
  console.log('PUT  /api/users/:username - 更新用户')
  console.log('DELETE /api/users/:username - 删除用户')
  console.log('GET  /api/permissions - 获取权限')
  console.log('PUT  /api/users/:username/permissions - 更新权限')
  console.log('\n=========================================')
})