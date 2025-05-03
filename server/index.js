import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3888
const prisma = new PrismaClient()

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')))

// 管理页面路由
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/admin.html'))
})

// JWT密钥
const JWT_SECRET = 'your-secret-key'

// 管理页面特殊权限中间件
const adminAuth = (req, res, next) => {
  if (req.headers['x-admin-request'] === 'true') {
    req.user = {
      username: 'admin',
      permissions: ['admin', 'manage_users', 'manage_settings']
    }
    return next()
  }
  next()
}

// 验证Token中间件
const authenticateToken = (req, res, next) => {
  if (req.headers['x-admin-request'] === 'true') {
    return next()
  }

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
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user || user.password !== password) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  const permissions = JSON.parse(user.permissions)
  const token = jwt.sign(
    { username: user.username, permissions },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    token,
    user: {
      username: user.username,
      permissions,
      role: permissions.includes('admin') ? 'admin' : 'user',
      lastLoginAt: user.lastLoginAt,
      description: user.description || '',
      avatar: user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  })
})

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        permissions: JSON.stringify(['user']),
        description: '这是一个新用户，点击编辑添加个人描述',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
      }
    })

    const token = jwt.sign(
      { username: newUser.username, permissions: ['user'] },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      token,
      user: {
        username: newUser.username,
        permissions: ['user'],
        role: 'user',
        lastLoginAt: newUser.lastLoginAt,
        description: newUser.description,
        avatar: newUser.avatar
      }
    })
  } catch (error) {
    res.status(500).json({ error: '注册失败' })
  }
})

// 心跳检测接口
app.post('/api/heartbeat', async (req, res) => {
  const { token, username } = req.body

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (user && decoded.username === username) {
      const permissions = JSON.parse(user.permissions)
      res.json({
        success: true,
        permissions
      })
    } else {
      res.status(403).json({ error: '无效的用户信息' })
    }
  } catch (error) {
    res.status(403).json({ error: '无效的令牌' })
  }
})

// 用户管理接口
app.get('/api/users', adminAuth, authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        permissions: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    res.json(users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions)
    })))
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

app.post('/api/users', adminAuth, authenticateToken, async (req, res) => {
  const { username, password, permissions } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        permissions: JSON.stringify(permissions || ['user'])
      }
    })

    res.status(201).json({
      ...newUser,
      permissions: JSON.parse(newUser.permissions)
    })
  } catch (error) {
    res.status(500).json({ error: '创建用户失败' })
  }
})

app.put('/api/users/:username', adminAuth, authenticateToken, async (req, res) => {
  const { username } = req.params
  const { permissions } = req.body

  try {
    const user = await prisma.user.update({
      where: { username },
      data: {
        permissions: JSON.stringify(permissions)
      }
    })

    res.json({
      ...user,
      permissions: JSON.parse(user.permissions)
    })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.status(500).json({ error: '更新用户失败' })
  }
})

app.delete('/api/users/:username', adminAuth, authenticateToken, async (req, res) => {
  const { username } = req.params
  if (username === 'admin') {
    return res.status(403).json({ error: '不能删除管理员账号' })
  }

  try {
    await prisma.user.delete({
      where: { username }
    })
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.status(500).json({ error: '删除用户失败' })
  }
})

// 权限管理接口
app.get('/api/permissions', adminAuth, authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.user.username }
    })
    res.json({ permissions: JSON.parse(user.permissions) })
  } catch (error) {
    res.status(500).json({ error: '获取权限失败' })
  }
})

app.put('/api/users/:username/permissions', adminAuth, authenticateToken, async (req, res) => {
  const { username } = req.params
  const { permissions } = req.body

  try {
    const user = await prisma.user.update({
      where: { username },
      data: {
        permissions: JSON.stringify(permissions)
      }
    })

    res.json({
      ...user,
      permissions: JSON.parse(user.permissions)
    })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.status(500).json({ error: '更新权限失败' })
  }
})

// 初始化管理员账号
async function initAdminUser() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (!adminUser) {
      await prisma.user.create({
        data: {
          username: 'admin',
          password: 'admin123',
          permissions: JSON.stringify(['admin', 'manage_users', 'manage_settings'])
        }
      })
      console.log('管理员账号已创建')
    }
  } catch (error) {
    console.error('初始化管理员账号失败:', error)
  }
}

// 启动服务器
app.listen(PORT, async () => {
  await initAdminUser()
  console.log('=========================================')
  console.log('🚀 Web后台服务器已启动')
  console.log(`📡 监听地址: http://localhost:${PORT}`)
  console.log(`👨‍💼 管理页面: http://localhost:${PORT}/admin`)
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