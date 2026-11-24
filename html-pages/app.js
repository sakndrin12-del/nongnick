// ระบบคลังความรู้ ICT เทศบาลนครขอนแก่น (KKICT) — HTML + Vanilla JS + MySQL API
const API_ORIGIN = window.location.protocol === 'file:' ? 'http://localhost:3000' : (window.location.port === '5500' ? 'http://localhost:3000' : window.location.origin)
const API_BASE = `${API_ORIGIN}/api`
const BOOKMARKS_KEY = 'ict-bookmarked-guides'
const RECENT_KEY = 'ict-recently-viewed-guides'
const TOKEN_KEY = 'ict-admin-token'
const CATEGORY_ICONS = ['▣', '⌁', '▤', '▧', '◉']

function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(dateStr))
  } catch {
    return String(dateStr)
  }
}

function getStoredList(key) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setStoredList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // Ignore storage error
  }
}

function isBookmarked(articleId) {
  const id = Number(articleId)
  return getStoredList(BOOKMARKS_KEY).some((item) => Number(item.articleId) === id)
}

function toggleBookmarkItem(article) {
  if (!article || !article.articleId) return false
  const list = getStoredList(BOOKMARKS_KEY)
  const id = Number(article.articleId)
  const exists = list.some((item) => Number(item.articleId) === id)
  const next = exists
    ? list.filter((item) => Number(item.articleId) !== id)
    : [article, ...list.filter((item) => Number(item.articleId) !== id)].slice(0, 30)
  setStoredList(BOOKMARKS_KEY, next)
  updateSavedBadges()
  return !exists
}

function recordRecentItem(article) {
  if (!article || !article.articleId) return
  const list = getStoredList(RECENT_KEY)
  const id = Number(article.articleId)
  const next = [article, ...list.filter((item) => Number(item.articleId) !== id)].slice(0, 8)
  setStoredList(RECENT_KEY, next)
}

function updateSavedBadges() {
  const count = getStoredList(BOOKMARKS_KEY).length
  document.querySelectorAll('[data-saved-count]').forEach((el) => {
    el.textContent = count
    el.style.display = count > 0 ? 'inline-grid' : 'none'
  })
}

async function apiGet(path, auth = false) {
  const headers = {}
  if (auth) {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL ได้')
  return data
}

async function apiSend(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล')
  return data
}

function renderArticleCard(article) {
  const saved = isBookmarked(article.articleId)
  const img = article.image || (Array.isArray(article.images) && article.images[0]) || ''
  const catName = article.category?.categoryName || 'คู่มือ ICT'
  const cleanExcerpt = String(article.content || '')
    .replace(/^(เกริ่นนำ|Introduction)\s*/i, '')
    .slice(0, 120)
  return `
    <article class="article-card" data-article-id="${article.articleId}">
      <div class="article-art-wrap">
        <a class="article-art" href="article-detail.html?id=${article.articleId}">
          ${article.featured ? '<span class="featured-tag">แนะนำ</span>' : ''}
          ${img
            ? `<img src="${escapeHtml(assetUrl(img))}" alt="${escapeHtml(article.title)}" loading="lazy" />`
            : `<div class="art-placeholder"><span>${escapeHtml(catName)}</span><b>${CATEGORY_ICONS[(Number(article.categoryId || 1) - 1) % 5]}</b><i>ICT GUIDE</i></div>`}
        </a>
        <button type="button" class="card-bookmark-btn ${saved ? 'active' : ''}" data-bookmark-btn="${article.articleId}" title="บันทึกคู่มือนี้">
          ${saved ? '★' : '☆'}
        </button>
      </div>
      <div class="article-copy">
        <div class="article-meta">
          <span>${escapeHtml(catName)}</span>
          <span>เข้าชม ${Number(article.viewCount || 0).toLocaleString('th-TH')} ครั้ง</span>
        </div>
        <h3><a href="article-detail.html?id=${article.articleId}">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(cleanExcerpt)}…</p>
        <div class="article-bottom">
          <span>อัปเดต ${formatDate(article.updatedAt || article.publishedAt)}</span>
          <a href="article-detail.html?id=${article.articleId}">อ่านคู่มือ <b>→</b></a>
        </div>
      </div>
    </article>
  `
}

function bindBookmarkButtons(articlesMap) {
  document.querySelectorAll('[data-bookmark-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const id = Number(btn.getAttribute('data-bookmark-btn'))
      const article = articlesMap.get(id)
      if (!article) return
      const nowSaved = toggleBookmarkItem(article)
      btn.classList.toggle('active', nowSaved)
      btn.textContent = nowSaved ? '★' : '☆'
    })
  })
}

function setupLineQrModal() {
  document.querySelectorAll('[data-open-line-qr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      let modal = document.getElementById('line-qr-modal')
      if (!modal) {
        modal = document.createElement('div')
        modal.id = 'line-qr-modal'
        modal.className = 'lightbox line-qr-modal'
        modal.innerHTML = `
          <div class="line-qr-dialog">
            <button type="button" class="line-qr-close" id="close-line-qr">×</button>
            <span class="eyebrow">LINE OFFICIAL · KKICT</span>
            <h3>สแกน QR Code เพื่อติดต่อทาง LINE</h3>
            <p>ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น</p>
            <div class="line-qr-frame">
              <img src="line-qr.png" alt="LINE QR Code KKICT-Training" />
            </div>
            <div class="line-qr-actions">
              <a class="share-button share-line-btn" href="https://line.me/R/ti/g/sTeVI-fA9K" target="_blank" rel="noreferrer">
                <span>💬 เปิดแชต LINE (KKICT-Training) ↗</span>
              </a>
            </div>
          </div>
        `
        document.body.appendChild(modal)
        modal.addEventListener('click', (e) => {
          if (e.target === modal || e.target.id === 'close-line-qr') modal.remove()
        })
      }
    })
  })
}

// 1. หน้าแรก (index.html)
async function initHomePage() {
  const catGrid = document.getElementById('home-categories')
  const featuredGrid = document.getElementById('home-featured')
  const latestGrid = document.getElementById('home-latest')
  if (!catGrid) return

  const articlesMap = new Map()
  try {
    const [categories, featured, latest] = await Promise.all([
      apiGet('/categories'),
      apiGet('/articles?featured=true&limit=6'),
      apiGet('/articles?limit=6'),
    ])

    catGrid.innerHTML = categories.map((c, idx) => `
      <a class="category-card" href="articles.html?category=${c.categoryId}">
        <span class="category-icon color-${idx % 5}">${CATEGORY_ICONS[idx % 5]}</span>
        <span>
          <b>${escapeHtml(c.categoryName)}</b>
          <small>${c._count?.articles || 0} บทความ</small>
        </span>
        <span class="arrow">→</span>
      </a>
    `).join('')

    const featList = featured.length ? featured : latest.slice(0, 3)
    featList.forEach((a) => articlesMap.set(Number(a.articleId), a))
    latest.forEach((a) => articlesMap.set(Number(a.articleId), a))

    featuredGrid.innerHTML = featList.map(renderArticleCard).join('')
    latestGrid.innerHTML = latest.map(renderArticleCard).join('')
    bindBookmarkButtons(articlesMap)
  } catch (err) {
    featuredGrid.innerHTML = `<div class="notice error-notice"><b>เชื่อมต่อฐานข้อมูลไม่สำเร็จ</b><span>${escapeHtml(err.message)}</span></div>`
  }
}

// 2. หน้าคลังความรู้และค้นหา (articles.html)
async function initArticlesPage() {
  const resultsGrid = document.getElementById('listing-grid')
  const filterPanel = document.getElementById('category-filters')
  const countSpan = document.getElementById('results-count')
  const searchInput = document.getElementById('listing-search-input')
  const sortSelect = document.getElementById('listing-sort')
  const assistBar = document.getElementById('search-assist-box')
  if (!resultsGrid) return

  const params = new URLSearchParams(window.location.search)
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const savedOnly = params.get('saved') === '1'
  const sort = params.get('sort') || 'recent'
  if (searchInput) searchInput.value = q
  if (sortSelect) sortSelect.value = sort

  const articlesMap = new Map()
  try {
    const categories = await apiGet('/categories')
    const savedCount = getStoredList(BOOKMARKS_KEY).length
    filterPanel.innerHTML = `
      <b>คลังส่วนตัว</b>
      <button type="button" class="is-saved-filter ${savedOnly ? 'active' : ''}" data-filter-saved="1">
        <span>★ คู่มือที่บันทึกไว้</span>
        <span class="filter-count-pill">${savedCount}</span>
      </button>
      <b class="filter-section-title">หมวดหมู่ความรู้</b>
      <button type="button" class="${!category && !savedOnly ? 'active' : ''}" data-filter-cat="">ทั้งหมด</button>
      ${categories.map((c) => `
        <button type="button" class="${String(c.categoryId) === category && !savedOnly ? 'active' : ''}" data-filter-cat="${c.categoryId}">
          ${escapeHtml(c.categoryName)}
        </button>
      `).join('')}
    `

    filterPanel.querySelectorAll('[data-filter-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = new URLSearchParams(window.location.search)
        const cat = btn.getAttribute('data-filter-cat')
        next.delete('saved')
        if (cat) next.set('category', cat)
        else next.delete('category')
        window.location.search = next.toString()
      })
    })
    filterPanel.querySelector('[data-filter-saved]')?.addEventListener('click', () => {
      window.location.search = savedOnly ? '' : 'saved=1'
    })

    if (savedOnly) {
      const list = getStoredList(BOOKMARKS_KEY)
      list.forEach((a) => articlesMap.set(Number(a.articleId), a))
      countSpan.textContent = `${list.length} บทความที่บันทึกไว้`
      resultsGrid.innerHTML = list.length
        ? list.map(renderArticleCard).join('')
        : `<div class="empty-state"><span>★</span><b>ยังไม่มีคู่มือที่บันทึกไว้</b><p>กดปุ่ม ☆ บนการ์ดบทความเพื่อบันทึกคู่มือที่ใช้บ่อยไว้เปิดดูที่นี่ได้ทันที</p></div>`
      bindBookmarkButtons(articlesMap)
      return
    }

    const searchData = await apiGet(`/articles/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&pageSize=24`)
    const items = searchData.items || []
    items.forEach((a) => articlesMap.set(Number(a.articleId), a))
    countSpan.textContent = `${searchData.total || items.length} บทความ`

    if (assistBar && (searchData.didYouMean || (searchData.suggestions && searchData.suggestions.length))) {
      assistBar.style.display = 'flex'
      assistBar.innerHTML = `
        <span>💡 คำค้นใกล้เคียง:</span>
        ${(searchData.suggestions || []).map((term) => `<a class="suggestion-chip" href="articles.html?q=${encodeURIComponent(term)}">${escapeHtml(term)}</a>`).join('')}
      `
    }

    resultsGrid.innerHTML = items.length
      ? items.map(renderArticleCard).join('')
      : `<div class="empty-state"><span>⌕</span><b>ไม่พบบทความที่ตรงกับคำค้นหา</b><p>ลองเลือกคำค้นใกล้เคียงหรือเลือกดูจากหมวดหมู่ด้านซ้าย</p></div>`
    bindBookmarkButtons(articlesMap)
  } catch (err) {
    resultsGrid.innerHTML = `<div class="notice error-notice"><b>เกิดข้อผิดพลาด</b><span>${escapeHtml(err.message)}</span></div>`
  }
}

// 3. หน้าอ่านบทความ (article-detail.html)
async function initArticleDetailPage() {
  const container = document.getElementById('article-detail-container')
  if (!container) return
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id') || '1'
  try {
    const article = await apiGet(`/articles/${encodeURIComponent(id)}`)
    recordRecentItem(article)
    document.title = `${article.title} | คลังความรู้ ICT ขอนแก่น`
    const steps = Array.isArray(article.steps) ? article.steps : []
    const paragraphs = String(article.content || '').split(/\n{2,}/).filter(Boolean)
    const images = Array.isArray(article.images) && article.images.length ? article.images : (article.image ? [article.image] : [])
    const saved = isBookmarked(article.articleId)

    container.innerHTML = `
      <header class="article-hero-card">
        <div class="article-hero-main">
          <div class="breadcrumbs">
            <a href="index.html">หน้าแรก</a><span>/</span>
            <a href="articles.html?category=${article.categoryId}">${escapeHtml(article.category?.categoryName || 'คลังความรู้')}</a><span>/</span>
            <span>${escapeHtml(article.title)}</span>
          </div>
          <h1>${escapeHtml(article.title)}</h1>
          <div class="detail-stats">
            <span>◷ เข้าชม ${Number(article.viewCount || 0).toLocaleString('th-TH')} ครั้ง</span>
            <span>✎ อัปเดต ${formatDate(article.updatedAt)}</span>
            ${steps.length ? `<span>✓ ${steps.length} ขั้นตอนปฏิบัติ</span>` : ''}
          </div>
          <div class="article-tools">
            <button type="button" id="detail-bookmark-btn" class="bookmark-action-btn ${saved ? 'active' : ''}">
              ${saved ? '★ บันทึกคู่มือแล้ว' : '☆ บันทึกคู่มือนี้'}
            </button>
            <button type="button" class="print-button" onclick="window.print()">▤ พิมพ์คู่มือ / บันทึก PDF</button>
            ${article.pdfFile ? `<button type="button" class="print-button" id="hero-open-pdf">👁 เปิดอ่าน PDF บนหน้าเว็บ</button>` : ''}
            ${article.pdfFile ? `<a class="download-button hero-pdf-btn" href="${escapeHtml(assetUrl(article.pdfFile))}" download>⬇ ดาวน์โหลด PDF</a>` : ''}
          </div>
        </div>
      </header>

      <article class="detail-main" id="reader-article">
        ${images.length ? `
          <div class="detail-gallery-box">
            <div class="detail-image-button">
              <img class="detail-image" id="main-article-img" src="${escapeHtml(assetUrl(images[0]))}" alt="${escapeHtml(article.title)}" />
            </div>
          </div>
        ` : ''}

        <div class="article-content">
          <div class="content-section-bar">
            <div>
              <span>📖 รายละเอียดและคำอธิบายประกอบ</span>
              <small>อ่านทำความเข้าใจก่อนเริ่มปฏิบัติตามขั้นตอน</small>
            </div>
            <div class="font-scale-controls">
              <small>ขนาดตัวอักษร</small>
              <button type="button" class="active" data-font-scale="normal">ก</button>
              <button type="button" data-font-scale="large">ก+</button>
              <button type="button" data-font-scale="xlarge">ก++</button>
            </div>
          </div>
          ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        </div>

        ${steps.length ? `
          <section class="steps-box">
            <div class="steps-box-head">
              <div>
                <span class="eyebrow">STEP-BY-STEP WORKFLOW</span>
                <h2>ขั้นตอนการแก้ไขปัญหาอย่างเป็นลำดับ</h2>
              </div>
              <span class="steps-count-pill">${steps.length} ขั้นตอน</span>
            </div>
            <ol>
              ${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
            </ol>
          </section>
        ` : ''}

        ${article.pdfFile ? `
          <section id="article-pdf-box" class="pdf-banner">
            <div class="pdf-banner-top">
              <div class="pdf-banner-info">
                <span class="pdf-emblem">PDF</span>
                <div>
                  <b>คู่มือฉบับสมบูรณ์พร้อมพิมพ์ (PDF A4)</b>
                  <p>กดเปิดอ่านบนหน้าเว็บนี้ได้ทันทีเหมือน E-Book หรือดาวน์โหลดเก็บไว้ในเครื่อง</p>
                </div>
              </div>
              <div class="pdf-banner-actions">
                <button type="button" class="pdf-toggle-btn" id="toggle-pdf-reader">👁 เปิดอ่าน PDF บนหน้าเว็บนี้</button>
                <a class="download-button" href="${escapeHtml(assetUrl(article.pdfFile))}" download>⬇ ดาวน์โหลด PDF</a>
              </div>
            </div>
            <div class="pdf-viewer-shell" id="pdf-viewer-shell" style="display:none;">
              <div class="pdf-viewer-bar">
                <span>📄 กำลังแสดงคู่มือ PDF: <b>${escapeHtml(article.title)}</b></span>
              </div>
              <iframe class="pdf-viewer-frame" src="${escapeHtml(assetUrl(article.pdfFile))}#view=FitH" title="PDF Reader"></iframe>
            </div>
          </section>
        ` : ''}
      </article>
    `

    const bmBtn = document.getElementById('detail-bookmark-btn')
    bmBtn?.addEventListener('click', () => {
      const nowSaved = toggleBookmarkItem(article)
      bmBtn.classList.toggle('active', nowSaved)
      bmBtn.textContent = nowSaved ? '★ บันทึกคู่มือแล้ว' : '☆ บันทึกคู่มือนี้'
    })

    const readerArticle = document.getElementById('reader-article')
    document.querySelectorAll('[data-font-scale]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const scale = btn.getAttribute('data-font-scale')
        readerArticle.className = `detail-main reader-scale-${scale}`
        document.querySelectorAll('[data-font-scale]').forEach((b) => b.classList.toggle('active', b === btn))
      })
    })

    const togglePdf = () => {
      const shell = document.getElementById('pdf-viewer-shell')
      const btn = document.getElementById('toggle-pdf-reader')
      if (!shell) return
      const open = shell.style.display === 'none'
      shell.style.display = open ? 'block' : 'none'
      if (btn) btn.textContent = open ? '▴ ซ่อนหน้าต่างอ่าน PDF' : '👁 เปิดอ่าน PDF บนหน้าเว็บนี้'
    }
    document.getElementById('toggle-pdf-reader')?.addEventListener('click', togglePdf)
    document.getElementById('hero-open-pdf')?.addEventListener('click', () => {
      const shell = document.getElementById('pdf-viewer-shell')
      if (shell && shell.style.display === 'none') togglePdf()
      document.getElementById('article-pdf-box')?.scrollIntoView({ behavior: 'smooth' })
    })
  } catch (err) {
    container.innerHTML = `<div class="notice error-notice"><b>ไม่พบบทความ</b><span>${escapeHtml(err.message)}</span></div>`
  }
}

// 4. หน้าเข้าสู่ระบบเจ้าหน้าที่ (admin-login.html)
function initAdminLoginPage() {
  const form = document.getElementById('html-admin-login-form')
  const errBox = document.getElementById('html-login-error')
  if (!form) return
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errBox.style.display = 'none'
    const username = document.getElementById('login-username').value.trim()
    const password = document.getElementById('login-password').value
    try {
      const res = await apiSend('POST', '/auth/login', { username, password })
      sessionStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(TOKEN_KEY, res.token)
      window.location.href = 'admin-dashboard.html'
    } catch (err) {
      errBox.textContent = err.message
      errBox.style.display = 'block'
    }
  })
}

// 5. หน้าแดชบอร์ดผู้ดูแลระบบ (admin-dashboard.html)
async function initAdminDashboardPage() {
  const kpiBox = document.getElementById('admin-kpi-grid')
  const monthlyList = document.getElementById('admin-monthly-list')
  const monthlyPager = document.getElementById('admin-monthly-pagination')
  if (!kpiBox) return

  let currentPage = 1
  const pageSize = 5
  let monthArticles = []

  function renderMonthlyPage() {
    const total = monthArticles.length
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    currentPage = Math.min(Math.max(1, currentPage), pageCount)
    const start = (currentPage - 1) * pageSize
    const visible = monthArticles.slice(start, start + pageSize)

    monthlyList.innerHTML = visible.map((item, idx) => `
      <li class="dash-article-row">
        <span class="dash-row-num">${start + idx + 1}</span>
        <div class="dash-row-main">
          <a class="dash-row-title" href="article-detail.html?id=${item.articleId}">${escapeHtml(item.title)}</a>
          <div class="dash-row-meta">
            <span class="status-badge status-${String(item.status || '').toLowerCase()}">${item.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</span>
            <span class="category-chip">${escapeHtml(item.categoryName)}</span>
            <span>${formatDate(item.publishedAt || item.createdAt)}</span>
          </div>
        </div>
        <div class="dash-row-views">
          <b>${Number(item.monthViews || 0).toLocaleString('th-TH')}</b>
          <small>วิวเดือนนี้</small>
        </div>
      </li>
    `).join('')

    if (pageCount > 1) {
      monthlyPager.innerHTML = `
        <div class="admin-page-summary">
          <span>แสดง <b>${start + 1}–${Math.min(start + pageSize, total)}</b> จากทั้งหมด <b>${total}</b> บทความ</span>
        </div>
        <div class="admin-page-controls">
          <button type="button" ${currentPage <= 1 ? 'disabled' : ''} data-mpage="${currentPage - 1}">← ก่อนหน้า</button>
          <div class="admin-page-numbers">
            ${Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => `
              <button type="button" class="${n === currentPage ? 'active' : ''}" data-mpage="${n}">${n}</button>
            `).join('')}
          </div>
          <button type="button" ${currentPage >= pageCount ? 'disabled' : ''} data-mpage="${currentPage + 1}">ถัดไป →</button>
        </div>
      `
      monthlyPager.querySelectorAll('[data-mpage]').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentPage = Number(btn.getAttribute('data-mpage'))
          renderMonthlyPage()
        })
      })
    } else {
      monthlyPager.innerHTML = ''
    }
  }

  try {
    const [dashboard, monthly] = await Promise.all([
      apiGet('/admin/dashboard', true),
      apiGet('/admin/reports/monthly', true),
    ])

    kpiBox.innerHTML = `
      <div class="dash-kpi is-green">
        <span class="dash-kpi-icon">✓</span>
        <div><small>บทความที่เผยแพร่</small><b>${dashboard.publishedCount}</b><p>จากทั้งหมด ${dashboard.articleCount} บทความ</p></div>
      </div>
      <div class="dash-kpi is-blue">
        <span class="dash-kpi-icon">◉</span>
        <div><small>ยอดเข้าชมสะสม</small><b>${Number(dashboard.totalViews || 0).toLocaleString('th-TH')}</b><p>ฐานข้อมูล MySQL</p></div>
      </div>
      <div class="dash-kpi is-gold">
        <span class="dash-kpi-icon">★</span>
        <div><small>ความพึงพอใจ</small><b>${dashboard.helpfulPercent}%</b><p>มีประโยชน์ ${dashboard.helpfulCount}/${dashboard.feedbackCount} โหวต</p></div>
      </div>
      <div class="dash-kpi is-purple">
        <span class="dash-kpi-icon">▣</span>
        <div><small>หมวดหมู่ความรู้</small><b>${dashboard.categoryCount}</b><p>เชื่อมต่อ MySQL สำเร็จ</p></div>
      </div>
    `
    monthArticles = monthly.articlesInMonth || []
    renderMonthlyPage()
  } catch {
    window.location.href = 'admin-login.html'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateSavedBadges()
  setupLineQrModal()
  initHomePage()
  initArticlesPage()
  initArticleDetailPage()
  initAdminLoginPage()
  initAdminDashboardPage()
})
