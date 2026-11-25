import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import publicRoutes from './routes/public.js'
import adminRoutes, { uploadErrorHandler } from './routes/admin.js'
import authRoutes from './routes/auth.js'
import { prisma } from './db.js'

const app = express()
const backendDir = path.dirname(fileURLToPath(import.meta.url))
const htmlDistDir = path.resolve(backendDir, '../../frontend/dist')
const htmlEntryFile = path.join(htmlDistDir, 'index.html')
const htmlPagesDir = path.resolve(backendDir, '../../html-pages')
const singleHtmlFile = path.resolve(backendDir, '../../ict-knowledge-base.html')
const port = Number(process.env.PORT) || 3000
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const allowedOrigins = new Set([allowedOrigin, `http://localhost:${port}`, 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null'])
const jwtSecret = typeof process.env.JWT_SECRET === 'string' ? process.env.JWT_SECRET.trim() : ''
if (jwtSecret.length < 32 || /^replace-/i.test(jwtSecret) || /replace-this/i.test(jwtSecret)) {
  throw new Error('ค่า JWT_SECRET ไม่ถูกต้อง ต้องมีอย่างน้อย 32 ตัวอักษรและห้ามใช้ค่าตัวอย่าง สร้างค่าใหม่ด้วยคำสั่ง: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"')
}
const trustProxy = process.env.TRUST_PROXY?.trim()
const parsedTrustProxy = trustProxy
  ? trustProxy.toLowerCase() === 'true' ? true : trustProxy.toLowerCase() === 'false' ? false : /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy
  : false
const tooManyPublicRequests = (_req, res) => res.status(429).json({ message: 'มีการเรียกใช้งานระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง' })
const publicApiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false, handler: tooManyPublicRequests })

app.disable('x-powered-by')
app.set('trust proxy', parsedTrustProxy)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: false,
  hsts: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      frameAncestors: ["'self'", allowedOrigin, 'http://localhost:5500', 'http://127.0.0.1:5500'],
      upgradeInsecureRequests: null,
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
      connectSrc: ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://drive.google.com'],
    },
  },
}))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/.test(origin)) return callback(null, true)
    return callback(null, false)
  },
  maxAge: 600,
}))
app.use(express.json({ limit: '32kb' }))
app.use('/uploads', express.static(path.resolve(backendDir, '../uploads'), {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}))
if (fs.existsSync(htmlPagesDir)) {
  app.use('/html-pages', express.static(htmlPagesDir))
}
app.get(['/single', '/ict-knowledge-base.html'], (_req, res, next) => {
  if (fs.existsSync(singleHtmlFile)) return res.sendFile(singleHtmlFile)
  next()
})
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'mysql' }))
app.use('/api', (req, res, next) => {
  if (req.path === '/auth' || req.path.startsWith('/auth/') || req.path === '/admin' || req.path.startsWith('/admin/')) return next()
  return publicApiLimiter(req, res, next)
}, publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
if (fs.existsSync(htmlDistDir)) {
  app.use(express.static(htmlDistDir))
  app.get(/^(?!\/api(?:\/|$)|\/uploads(?:\/|$)).*/, (_req, res, next) => {
    if (fs.existsSync(htmlEntryFile)) return res.sendFile(htmlEntryFile)
    next()
  })
}
app.use((req, res) => res.status(404).json({ message: 'ไม่พบเส้นทางที่ร้องขอ' }))
app.use(uploadErrorHandler)
app.use((error, _req, res, _next) => {
  console.error('API error:', error.message)
  const status = Number(error.status ?? error.statusCode)
  const httpStatus = Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500
  const message = httpStatus === 400
    ? 'รูปแบบคำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่ส่ง'
    : httpStatus === 413
      ? 'ข้อมูลคำขอมีขนาดใหญ่เกินกำหนด'
      : 'เกิดข้อผิดพลาดภายในระบบ'
  res.status(httpStatus).json({ message })
})

const server = app.listen(port, () => console.log(`ICT Knowledge API listening on port ${port}`))

async function shutdown() {
  server.close(async () => { await prisma.$disconnect(); process.exit(0) })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
