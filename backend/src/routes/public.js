import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { prisma } from '../db.js'
import { CONTACT_SETTING_KEY, normalizeContactSettings } from '../contactSettings.js'

const router = Router()
const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'ส่งการประเมินบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }),
})
// Count a view / search log once per visitor per window so refreshes, sort changes and
// React StrictMode double-fetches in development do not inflate statistics.
// Prefer the browser's opaque X-Visitor-Id so staff behind one shared office IP are still counted separately.
const DEDUPE_WINDOW_MS = 10 * 60 * 1000
const DEDUPE_MAX_ENTRIES = 50000
const recentHits = new Map()
function visitorFingerprint(req) {
  const visitor = req.get('x-visitor-id')
  const raw = typeof visitor === 'string' && /^[\w-]{16,80}$/.test(visitor) ? `v:${visitor}` : `ip:${req.ip}|${req.get('user-agent') || ''}`
  return createHash('sha256').update(raw).digest('base64url').slice(0, 22)
}
function firstHitInWindow(key) {
  const now = Date.now()
  const seenAt = recentHits.get(key)
  if (seenAt && now - seenAt < DEDUPE_WINDOW_MS) return false
  if (recentHits.size >= DEDUPE_MAX_ENTRIES) {
    for (const [entry, time] of recentHits) if (now - time >= DEDUPE_WINDOW_MS) recentHits.delete(entry)
    if (recentHits.size >= DEDUPE_MAX_ENTRIES) recentHits.clear()
  }
  recentHits.set(key, now)
  return true
}
const publicArticle = { status: 'PUBLISHED' }
const articleSelect = {
  articleId: true, categoryId: true, title: true, content: true, steps: true,
  keywords: true, image: true, images: true, pdfFile: true, videoUrl: true, viewCount: true, featured: true,
  publishedAt: true, createdAt: true, updatedAt: true,
  category: { select: { categoryId: true, categoryName: true } },
}

const PROFANE_PATTERNS = [
  /ควย/i, /หี/i, /เย็ด/i, /สัส/i, /สัด/i, /เหี้ย/i, /มึง/i, /กู/i,
  /อีดอก/i, /ดอกทอง/i, /ชาติหมา/i, /พ่อง/i, /แม่ง/i, /ชิบหาย/i, /ฉิบหาย/i,
  /ระยำ/i, /จัญไร/i, /ตอแหล/i, /เสือก/i, /หัวควย/i, /แตด/i, /เงี่ยน/i,
  /ชักว่าว/i, /กะหรี่/i, /\bfuck/i, /\bshit/i, /\bbitch/i, /\basshole/i,
  /\bdick\b/i, /\bpussy\b/i, /\bcunt\b/i, /\bporn\b/i, /\bxxx\b/i,
]

export function isProfaneSearchTerm(term) {
  if (typeof term !== 'string') return false
  const normalized = term.trim().toLowerCase()
  if (!normalized) return false
  return PROFANE_PATTERNS.some((pattern) => pattern.test(normalized))
}

function normalizeArticleImages(article) {
  if (!article) return article
  const rawList = Array.isArray(article.images) ? article.images.filter(Boolean) : []
  const images = rawList.length ? rawList : (article.image ? [article.image] : [])
  const image = article.image || images[0] || null
  return { ...article, image, images }
}

const EN_LAYOUT = "1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?"
const TH_LAYOUT = "ๅ/-ภถุึคตจขชๆไำพะัีรนยบลฃฟหกดเ้่าสวงผปแอิืทมใฝ+๑๒๓๔ู฿๕๖๗๘๙๐\"ฎฑธํ๊ณฯญฐ,ฅฤฆฏโฌ็๋ษศซ.()ฉฮฺ์?ฒฬฦ"
const EN_TO_TH = new Map([...EN_LAYOUT].map((ch, i) => [ch, TH_LAYOUT[i]]))
const TH_TO_EN = new Map([...TH_LAYOUT].map((ch, i) => [ch, EN_LAYOUT[i]]))

function swapKeyboardLayout(input) {
  if (typeof input !== 'string' || !input) return ''
  let thCount = 0
  let enCount = 0
  for (const ch of input) {
    if (TH_TO_EN.has(ch)) thCount += 1
    else if (EN_TO_TH.has(ch)) enCount += 1
  }
  const map = thCount >= enCount ? TH_TO_EN : EN_TO_TH
  return [...input].map((ch) => map.get(ch) ?? ch).join('')
}

function stripThaiTones(text) {
  return String(text || '').toLowerCase().replace(/[\u0E47-\u0E4E\-\s_.,/\\()'"]/g, '')
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  const curr = new Array(b.length + 1)
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]
  }
  return prev[b.length]
}

function bigramSimilarity(a, b) {
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0
  const getBigrams = (s) => {
    const map = new Map()
    for (let i = 0; i < s.length - 1; i += 1) {
      const bg = s.slice(i, i + 2)
      map.set(bg, (map.get(bg) || 0) + 1)
    }
    return map
  }
  const mapA = getBigrams(a)
  const mapB = getBigrams(b)
  let overlap = 0
  for (const [bg, countA] of mapA) {
    if (mapB.has(bg)) overlap += Math.min(countA, mapB.get(bg))
  }
  return (2 * overlap) / (a.length - 1 + (b.length - 1))
}

function similarityScore(queryRaw, candidateRaw) {
  const q = stripThaiTones(queryRaw)
  const c = stripThaiTones(candidateRaw)
  if (!q || !c) return 0
  if (q === c) return 0.98
  if (c.startsWith(q) || q.startsWith(c)) {
    const ratio = Math.min(q.length, c.length) / Math.max(q.length, c.length)
    return 0.78 + ratio * 0.16
  }
  if (c.includes(q) || q.includes(c)) {
    const ratio = Math.min(q.length, c.length) / Math.max(q.length, c.length)
    return 0.68 + ratio * 0.18
  }
  const maxLen = Math.max(q.length, c.length)
  const editSim = 1 - levenshtein(q, c) / maxLen
  const diceSim = bigramSimilarity(q, c)
  return Math.max(editSim * 0.85 + diceSim * 0.15, diceSim * 0.85 + editSim * 0.15)
}

const SYNONYM_RULES = [
  { patterns: [/ไวไฟ/i, /วายฟาย/i, /wify/i, /wifii/i, /wi\s*fi/i, /wlan/i, /ไร้สาย/i], targets: ['Wi-Fi', 'เครือข่าย'] },
  { patterns: [/ปริ้น/i, /ปริน/i, /ปริ๊น/i, /พริ้น/i, /priter/i, /prinnter/i, /print/i, /หมึก/i, /กระดาษติด/i], targets: ['Printer', 'เครื่องพิมพ์'] },
  { patterns: [/พาสเวิร์ด/i, /พาสเวิด/i, /รหัด/i, /รหัสผาน/i, /ลืมรหัส/i, /pasword/i, /passward/i, /passwd/i, /login/i, /ล็อกอิน/i], targets: ['รหัสผ่าน', 'บัญชีผู้ใช้'] },
  { patterns: [/วินโดว์/i, /วินโดว/i, /วินโด/i, /windown/i, /window\b/i, /win11/i, /win10/i], targets: ['Windows 11', 'Windows'] },
  { patterns: [/เนต/i, /เน็ต/i, /เน็ท/i, /อินเตอร์เน็ต/i, /อินเตอ/i, /อินเทอ/i, /intenet/i, /internat/i, /สายแลน/i, /แลน/i, /\blan\b/i], targets: ['อินเทอร์เน็ต', 'เครือข่าย', 'IP'] },
  { patterns: [/คอมค้าง/i, /คอมช้า/i, /เครื่องอืด/i, /เปิดไม่ติด/i, /จอดำ/i, /จอมืด/i, /โน๊ตบุ๊ค/i, /โน้ตบุ๊ก/i, /คีย์บอด/i, /เม้าส์/i], targets: ['คอมพิวเตอร์', 'เครื่องช้า', 'จอภาพ'] },
  { patterns: [/แสกน/i, /สแกน/i, /scaner/i, /scann/i], targets: ['สแกนเนอร์', 'เครื่องพิมพ์'] },
  { patterns: [/ไวรัด/i, /ไวรัส/i, /มัลแว/i, /แฮก/i, /สแปม/i, /ฟิชชิ่ง/i, /virus/i, /malware/i], targets: ['ความปลอดภัย', 'ไวรัส'] },
  { patterns: [/พีดีเอฟ/i, /แปลงไฟล/i, /ไฟลหาย/i, /กู้ไฟล/i, /สำรอง/i, /backup/i], targets: ['PDF', 'สำรองข้อมูล'] },
  { patterns: [/ซูม/i, /มีท/i, /ประชุม/i, /ไมค์/i, /กล้อง/i, /ลำโพง/i, /zoom/i, /meet/i], targets: ['ประชุมออนไลน์', 'ไมโครโฟน'] },
]

async function buildSearchSuggestions(query) {
  if (!query || isProfaneSearchTerm(query)) return { didYouMean: null, suggestions: [], suggestedArticles: [] }
  const published = await prisma.article.findMany({
    where: publicArticle,
    orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
    select: articleSelect,
  })
  if (!published.length) return { didYouMean: null, suggestions: [], suggestedArticles: [] }

  const candidatePool = new Map()
  const addCandidate = (term, weight = 1) => {
    const clean = typeof term === 'string' ? term.trim() : ''
    if (!clean || clean.length < 2 || clean.length > 60) return
    const key = clean.toLowerCase()
    const prev = candidatePool.get(key)
    if (!prev || weight > prev.weight) candidatePool.set(key, { term: clean, weight })
  }

  for (const article of published) {
    for (const kw of article.keywords || []) addCandidate(kw, 1.15)
    if (article.category?.categoryName) addCandidate(article.category.categoryName, 1.0)
    const titleTokens = article.title.split(/[\s()/·,]+/).filter((t) => t.length >= 3 && t.length <= 40)
    for (const token of titleTokens) addCandidate(token, 0.92)
  }

  const swapped = swapKeyboardLayout(query)
  const queriesToTest = [query, swapped].filter(Boolean)
  const normQuery = query.trim().toLowerCase()

  const synonymBoosts = new Set()
  for (const qVariant of queriesToTest) {
    for (const rule of SYNONYM_RULES) {
      if (rule.patterns.some((p) => p.test(qVariant))) {
        for (const t of rule.targets) synonymBoosts.add(t.toLowerCase())
      }
    }
  }

  const scored = []
  for (const [key, { term, weight }] of candidatePool) {
    if (key === normQuery) continue
    let bestSim = 0
    for (const qVariant of queriesToTest) {
      const sim = similarityScore(qVariant, term)
      if (sim > bestSim) bestSim = sim
      for (const word of qVariant.split(/\s+/).filter((w) => w.length >= 2)) {
        const wSim = similarityScore(word, term) * 0.94
        if (wSim > bestSim) bestSim = wSim
      }
    }
    if (synonymBoosts.has(key)) {
      bestSim = Math.max(bestSim, 0.92)
    }
    const finalScore = bestSim * weight
    if (bestSim >= 0.36) {
      scored.push({ term, score: finalScore, rawSim: bestSim })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  const topMatched = scored.slice(0, 5).map((item) => item.term)
  const didYouMean = scored[0] && scored[0].rawSim >= 0.46 ? scored[0].term : (topMatched[0] || null)

  let suggestions = [...topMatched]
  if (suggestions.length < 5) {
    for (const article of published) {
      for (const kw of article.keywords || []) {
        if (kw.toLowerCase() !== normQuery && !suggestions.some((s) => s.toLowerCase() === kw.toLowerCase())) {
          suggestions.push(kw)
          if (suggestions.length >= 5) break
        }
      }
      if (suggestions.length >= 5) break
    }
  }

  const matchTerms = topMatched.slice(0, 3).map((t) => t.toLowerCase())
  let suggestedArticles = []
  if (matchTerms.length) {
    suggestedArticles = published
      .filter((article) => {
        const hay = `${article.title} ${(article.keywords || []).join(' ')} ${article.category?.categoryName || ''}`.toLowerCase()
        return matchTerms.some((mt) => hay.includes(mt) || hay.replace(/-/g, '').includes(mt.replace(/-/g, '')))
      })
      .slice(0, 3)
      .map(normalizeArticleImages)
  }

  return { didYouMean, suggestions, suggestedArticles }
}

router.get('/settings/contact', async (_req, res, next) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: CONTACT_SETTING_KEY }, select: { value: true } })
    res.json(normalizeContactSettings(setting?.value))
  } catch (error) { next(error) }
})

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { categoryId: 'asc' },
      select: { categoryId: true, categoryName: true, description: true, _count: { select: { articles: { where: publicArticle } } } },
    })
    res.json(categories)
  } catch (error) { next(error) }
})

router.get('/articles', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 60)
    const where = { ...publicArticle }
    const categoryId = Number.parseInt(req.query.category, 10)
    if (req.query.category && Number.isInteger(categoryId) && categoryId > 0) where.categoryId = categoryId
    if (req.query.featured === 'true') where.featured = true
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : ''
    if (query) {
      const terms = [...new Set(query.split(/\s+/).filter(Boolean))].slice(0, 8)
      where.OR = terms.flatMap((term) => [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
        { keywords: { has: term } },
      ])
    }
    const orderBy = req.query.sort === 'popular' ? [{ viewCount: 'desc' }, { publishedAt: 'desc' }] : [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    const articles = await prisma.article.findMany({ where, orderBy, take: limit, select: articleSelect })
    res.json(articles.map(normalizeArticleImages))
  } catch (error) { next(error) }
})

router.get('/articles/search', async (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : ''
    const terms = [...new Set(query.split(/\s+/).filter(Boolean))].slice(0, 8)
    const page = Math.min(Math.max(Number.parseInt(req.query.page, 10) || 1, 1), 100000)
    const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 9, 1), 24)
    const categoryId = Number.parseInt(req.query.category, 10)
    const categoryFilter = req.query.category && Number.isInteger(categoryId) && categoryId > 0 ? { categoryId } : {}
    const where = { ...publicArticle, ...categoryFilter }
    if (terms.length) where.OR = terms.flatMap((term) => [
      { title: { contains: term, mode: 'insensitive' } },
      { content: { contains: term, mode: 'insensitive' } },
      { keywords: { has: term } },
    ])
    const categoryClause = Object.hasOwn(categoryFilter, 'categoryId') ? Prisma.sql`AND a.category_id = ${categoryId}` : Prisma.empty
    const termConditions = terms.map((term) => {
      const compact = term.replace(/-/g, '') || term
      return Prisma.sql`(
        position(lower(${term}) in lower(a.title)) > 0 OR
        position(lower(${term}) in lower(a.content)) > 0 OR
        EXISTS (SELECT 1 FROM unnest(a.keywords) AS k(value) WHERE lower(k.value) = lower(${term})) OR
        position(lower(${compact}) in replace(lower(a.title), '-', '')) > 0 OR
        position(lower(${compact}) in replace(lower(a.content), '-', '')) > 0 OR
        EXISTS (SELECT 1 FROM unnest(a.keywords) AS k(value) WHERE replace(lower(k.value), '-', '') = lower(${compact}))
      )`
    })
    const searchClause = terms.length ? Prisma.sql`AND (${Prisma.join(termConditions, ' OR ')})` : Prisma.empty
    let total
    if (terms.length) {
      const [countRow] = await prisma.$queryRaw(Prisma.sql`
        SELECT COUNT(*)::int AS total
        FROM articles a
        WHERE a.status = 'PUBLISHED' ${categoryClause} ${searchClause}
      `)
      total = countRow.total
    } else {
      total = await prisma.article.count({ where })
    }
    if (query && page === 1) {
      const term = query.toLocaleLowerCase('th-TH').trim().slice(0, 120)
      if (!isProfaneSearchTerm(term) && firstHitInWindow(`search:${visitorFingerprint(req)}:${term}`)) {
        prisma.searchLog.create({ data: { term, resultCount: total } }).catch(() => {})
      }
    }
    const skip = (page - 1) * pageSize
    const orderBy = req.query.sort === 'popular' ? [{ viewCount: 'desc' }, { publishedAt: 'desc' }] : [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    let items
    if (terms.length) {
      const compactQuery = query.replace(/-/g, '') || query
      const orderClause = req.query.sort === 'popular'
        ? Prisma.sql`a.view_count DESC, a.published_at DESC`
        : Prisma.sql`CASE
            WHEN lower(a.title) = lower(${query}) OR replace(lower(a.title), '-', '') = lower(${compactQuery}) THEN 0
            WHEN position(lower(${query}) in lower(a.title)) > 0 OR position(lower(${compactQuery}) in replace(lower(a.title), '-', '')) > 0 THEN 1
            WHEN EXISTS (SELECT 1 FROM unnest(a.keywords) AS k(value) WHERE lower(k.value) = lower(${query}) OR replace(lower(k.value), '-', '') = lower(${compactQuery})) THEN 2
            ELSE 3 END ASC, a.published_at DESC`
      const rows = await prisma.$queryRaw(Prisma.sql`
        SELECT a.article_id AS "articleId", a.category_id AS "categoryId", a.title,
          a.content, a.steps, a.keywords, a.image, a.images, a.pdf_file AS "pdfFile", a.video_url AS "videoUrl",
          a.view_count AS "viewCount", a.featured, a.published_at AS "publishedAt",
          a.created_at AS "createdAt", a.updated_at AS "updatedAt",
          c.category_name AS "categoryName"
        FROM articles a JOIN categories c ON c.category_id = a.category_id
        WHERE a.status = 'PUBLISHED' ${categoryClause} ${searchClause}
        ORDER BY ${orderClause}
        LIMIT ${pageSize} OFFSET ${skip}
      `)
      items = rows.map(({ categoryName, ...article }) => normalizeArticleImages({ ...article, category: { categoryId: article.categoryId, categoryName } }))
    } else {
      const rawItems = await prisma.article.findMany({ where, orderBy, skip, take: pageSize, select: articleSelect })
      items = rawItems.map(normalizeArticleImages)
    }
    let suggestionPayload = { didYouMean: null, suggestions: [], suggestedArticles: [] }
    if (query && total <= 2) {
      suggestionPayload = await buildSearchSuggestions(query)
    }
    res.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
      ...suggestionPayload,
    })
  } catch (error) { next(error) }
})

router.get('/articles/:id', async (req, res, next) => {
  try {
    const articleId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(articleId) || articleId < 1) return res.status(404).json({ message: 'ไม่พบบทความนี้' })
    const previewRequested = req.query.preview === '1' || req.get('x-admin-preview') === '1'
    let adminPreview = false
    if (previewRequested) {
      const authorization = req.get('authorization') || ''
      const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
      if (token) {
        try {
          const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
          const adminId = Number(claims?.sub)
          if (claims?.role === 'admin' && Number.isInteger(adminId) && adminId > 0) {
            adminPreview = Boolean(await prisma.admin.findUnique({ where: { adminId }, select: { adminId: true } }))
          }
        } catch { adminPreview = false }
      }
    }
    const found = await prisma.article.findFirst({ where: adminPreview ? { articleId } : { articleId, ...publicArticle }, select: { articleId: true } })
    if (!found) return res.status(404).json({ message: 'ไม่พบบทความนี้' })
    const userAgent = req.get('user-agent') || ''
    const skipCount = /bot|crawl|spider|preview|headless/i.test(userAgent) || previewRequested
    if (!skipCount && firstHitInWindow(`view:${visitorFingerprint(req)}:${articleId}`)) {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
      const dayString = `${parts.find((part) => part.type === 'year').value}-${parts.find((part) => part.type === 'month').value}-${parts.find((part) => part.type === 'day').value}`
      const day = new Date(`${dayString}T00:00:00.000Z`)
      // Keep the lifetime counter and the daily statistics consistent with each other.
      await prisma.$transaction([
        prisma.article.update({ where: { articleId }, data: { viewCount: { increment: 1 } }, select: { articleId: true } }),
        prisma.articleViewDaily.upsert({
          where: { articleId_day: { articleId, day } },
          create: { articleId, day, count: 1 },
          update: { count: { increment: 1 } },
        }),
      ])
    }
    const [result, feedback] = await Promise.all([
      prisma.article.findUnique({ where: { articleId }, select: articleSelect }),
      prisma.articleFeedback.groupBy({ by: ['helpful'], where: { articleId }, _count: { _all: true } }),
    ])
    const feedbackCount = feedback.reduce((sum, row) => sum + row._count._all, 0)
    const helpfulCount = feedback.find((row) => row.helpful)?._count._all || 0
    res.json({ ...normalizeArticleImages(result), feedbackCount, helpfulCount })
  } catch (error) { next(error) }
})

router.post('/articles/:id/feedback', feedbackLimiter, async (req, res, next) => {
  try {
    const articleId = Number.parseInt(req.params.id, 10)
    const { helpful, voterKey } = req.body || {}
    if (!Number.isInteger(articleId) || articleId < 1 || typeof helpful !== 'boolean' || typeof voterKey !== 'string' || voterKey.length < 16 || voterKey.length > 160) {
      return res.status(400).json({ message: 'ข้อมูลการประเมินไม่ถูกต้อง' })
    }
    const article = await prisma.article.findFirst({ where: { articleId, ...publicArticle }, select: { articleId: true } })
    if (!article) return res.status(404).json({ message: 'ไม่พบบทความนี้' })
    const hashedKey = createHash('sha256').update(voterKey).digest('hex')
    await prisma.articleFeedback.create({ data: { articleId, voterKey: hashedKey, helpful } })
    const [count, helpfulCount] = await Promise.all([
      prisma.articleFeedback.count({ where: { articleId } }),
      prisma.articleFeedback.count({ where: { articleId, helpful: true } }),
    ])
    res.status(201).json({ message: 'บันทึกความคิดเห็นแล้ว', count, helpfulCount })
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'คุณได้ประเมินบทความนี้แล้ว' })
    next(error)
  }
})

export default router
