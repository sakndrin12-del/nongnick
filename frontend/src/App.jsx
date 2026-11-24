import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, assetUrl, feedbackKey, parseMediaLink, useDocumentTitle } from './services/api'
import { LanguageProvider, LanguageSwitch, useLang } from './i18n'
import { AdminLoginPage, AdminPage } from './pages/Admin'
import { AdminHome, ArticleEditor, ArticleList, CategoryManager, ContactSettings } from './pages/AdminManagement'
import './App.css'

const BOOKMARKS_STORAGE_KEY = 'ict-bookmarked-guides'
const RECENT_STORAGE_KEY = 'ict-recently-viewed-guides'
const SavedGuidesContext = createContext(null)

function readStoredList(key) {
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => item && Number.isInteger(Number(item.articleId))) : []
  } catch {
    return []
  }
}

function writeStoredList(key, list) {
  try { window.localStorage.setItem(key, JSON.stringify(list)) } catch { /* Storage may be restricted. */ }
}

function toArticleSnapshot(article) {
  if (!article || !article.articleId) return null
  return {
    articleId: Number(article.articleId),
    categoryId: article.categoryId,
    title: article.title || '',
    content: article.content || '',
    image: article.image || null,
    images: Array.isArray(article.images) ? article.images : (article.image ? [article.image] : []),
    pdfFile: article.pdfFile || null,
    videoUrl: article.videoUrl || null,
    viewCount: Number(article.viewCount || 0),
    featured: Boolean(article.featured),
    publishedAt: article.publishedAt || null,
    createdAt: article.createdAt || null,
    updatedAt: article.updatedAt || null,
    category: article.category ? { categoryId: article.category.categoryId, categoryName: article.category.categoryName } : null,
  }
}

function SavedGuidesProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => readStoredList(BOOKMARKS_STORAGE_KEY))
  const [recentGuides, setRecentGuides] = useState(() => readStoredList(RECENT_STORAGE_KEY))

  const isBookmarked = useCallback((articleId) => {
    const idNum = Number(articleId)
    return bookmarks.some((item) => Number(item.articleId) === idNum)
  }, [bookmarks])

  const toggleBookmark = useCallback((article) => {
    const snap = toArticleSnapshot(article)
    if (!snap) return
    setBookmarks((prev) => {
      const exists = prev.some((item) => Number(item.articleId) === snap.articleId)
      const next = exists
        ? prev.filter((item) => Number(item.articleId) !== snap.articleId)
        : [snap, ...prev.filter((item) => Number(item.articleId) !== snap.articleId)].slice(0, 30)
      writeStoredList(BOOKMARKS_STORAGE_KEY, next)
      return next
    })
  }, [])

  const recordRecentView = useCallback((article) => {
    const snap = toArticleSnapshot(article)
    if (!snap) return
    setRecentGuides((prev) => {
      const next = [snap, ...prev.filter((item) => Number(item.articleId) !== snap.articleId)].slice(0, 8)
      writeStoredList(RECENT_STORAGE_KEY, next)
      return next
    })
  }, [])

  const clearRecentGuides = useCallback(() => {
    setRecentGuides([])
    writeStoredList(RECENT_STORAGE_KEY, [])
  }, [])

  const clearBookmarks = useCallback(() => {
    setBookmarks([])
    writeStoredList(BOOKMARKS_STORAGE_KEY, [])
  }, [])

  const value = useMemo(() => ({
    bookmarks,
    recentGuides,
    isBookmarked,
    toggleBookmark,
    recordRecentView,
    clearRecentGuides,
    clearBookmarks,
  }), [bookmarks, recentGuides, isBookmarked, toggleBookmark, recordRecentView, clearRecentGuides, clearBookmarks])

  return <SavedGuidesContext.Provider value={value}>{children}</SavedGuidesContext.Provider>
}

function useSavedGuides() {
  const ctx = useContext(SavedGuidesContext)
  if (!ctx) throw new Error('useSavedGuides must be used within SavedGuidesProvider')
  return ctx
}

const categoryIcons = ['▣', '⌁', '▤', '▧', '◉']
const excerpt = (value = '') => {
  const text = value.replace(/<[^>]*>/g, '').replace(/^\s*(?:เกริ่นนำ|Introduction)\s*[:：]?\s*/i, '').replace(/\s+/g, ' ').trim()
  if (text.length <= 125) return text
  const shortened = text.slice(0, 125)
  const lastSpace = shortened.lastIndexOf(' ')
  return `${(lastSpace > 0 ? shortened.slice(0, lastSpace) : shortened).trimEnd()}…`
}

function Header() {
  const { t } = useLang()
  const { bookmarks } = useSavedGuides()
  const location = useLocation()
  const isSavedView = location.pathname === '/articles' && new URLSearchParams(location.search).get('saved') === '1'
  let isAdmin = false
  try { isAdmin = Boolean(window.sessionStorage.getItem('ict-admin-token')) } catch { /* Storage can be disabled by browser policy. */ }
  return <>
    <div className="utility"><div className="shell utility-inner"><span className="utility-org"><img className="utility-seal" src="/logo-khonkaen.png" alt="ตราเทศบาลนครขอนแก่น"/><span>{t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT)', 'Khon Kaen Municipality ICT Skill Development & Learning Center (KKICT)')}</span></span><span>{t('บริการคลังความรู้ดิจิทัล', 'Digital Knowledge Portal')} · <a href="https://www.kkict.net/" target="_blank" rel="noreferrer">{t('เว็บไซต์หลัก kkict.net ↗', 'Main Website kkict.net ↗')}</a></span></div></div>
    <header className="site-header"><div className="shell nav-row">
      <Link className="brand" to="/"><span className="brand-logos" aria-hidden="true"><img className="brand-logo-seal" src="/logo-khonkaen.png" alt=""/><span className="brand-logo-divider"/><img className="brand-logo-ict" src="/logo-ict.png" alt=""/></span><span><b>{t('คลังความรู้ ICT', 'ICT Knowledge Base')}</b><small>{t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น', 'Khon Kaen Municipality ICT Learning Center')}</small></span></Link>
      <nav>
        <NavLink to="/" end>{t('หน้าแรก', 'Home')}</NavLink>
        <NavLink to="/articles" className={({ isActive }) => (isActive && !isSavedView ? 'active' : '')}>{t('คลังความรู้', 'Knowledge Library')}</NavLink>
        <Link to="/articles?saved=1" className={`nav-saved-link${isSavedView ? ' active' : ''}`}>
          <span>★ {t('ที่บันทึกไว้', 'Saved Guides')}</span>
          {bookmarks.length > 0 && <span className="nav-saved-badge">{bookmarks.length}</span>}
        </Link>
      </nav>
      <div className="nav-actions">
        <LanguageSwitch/>
        <Link className="nav-staff-btn" to={isAdmin ? '/admin' : '/admin/login'}>
          <span className="nav-staff-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <span>{isAdmin ? t('ไปที่ระบบจัดการ', 'Admin Dashboard') : t('เข้าสู่ระบบเจ้าหน้าที่', 'Staff Login')}</span>
        </Link>
      </div>
    </div></header>
  </>
}

function safeHttpsHref(value) {
  if (typeof value !== 'string' || !value.trim().toLowerCase().startsWith('https://')) return ''
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}

function safePhoneHref(value) {
  if (typeof value !== 'string' || !/^[+\d().\-\s]{3,80}$/.test(value.trim())) return ''
  const number = value.trim().replace(/[().\-\s]/g, '')
  if (!/^\+?\d{3,20}$/.test(number)) return ''
  try { const url = new URL(`tel:${number}`); return url.protocol === 'tel:' ? url.href : '' } catch { return '' }
}

function safeEmailHref(value) {
  const emailPattern = /^[A-Z0-9._%+-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i
  if (typeof value !== 'string' || !emailPattern.test(value.trim())) return ''
  try { const url = new URL(`mailto:${value.trim()}`); return url.protocol === 'mailto:' ? url.href : '' } catch { return '' }
}

const KKICT_LINE_ID = 'KKICT-Training'
const KKICT_LINE_URL = 'https://line.me/R/ti/g/sTeVI-fA9K'
const KKICT_FACEBOOK_URL = 'https://www.facebook.com/KKICT/?ref=embed_page#'

function contactActionHref(contact) {
  return safePhoneHref(contact?.phone) || safeHttpsHref(contact?.lineUrl) || safeEmailHref(contact?.email)
}

function LineQrModal({ open, onClose, lineId, lineUrl }) {
  const { t } = useLang()
  if (!open) return null
  return <div className="lightbox line-qr-modal" role="dialog" aria-modal="true" aria-label={t('สแกน QR Code LINE ศูนย์ ICT', 'Scan LINE QR Code')} onClick={onClose}>
    <div className="line-qr-dialog" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="line-qr-close" onClick={onClose} aria-label={t('ปิดหน้าต่าง', 'Close')}>×</button>
      <span className="eyebrow">LINE OFFICIAL · KKICT</span>
      <h3>{t('สแกน QR Code เพื่อติดต่อทาง LINE', 'Scan QR Code to Connect on LINE')}</h3>
      <p>{t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น', 'Khon Kaen Municipality ICT Learning Center')}</p>
      <div className="line-qr-frame">
        <img src="/line-qr.png" alt={`LINE QR Code ${lineId || KKICT_LINE_ID}`}/>
      </div>
      <div className="line-qr-actions">
        <a className="share-button share-line-btn" href={lineUrl || KKICT_LINE_URL} target="_blank" rel="noreferrer">
          <span>💬 {t(`เปิดแชต LINE (${lineId || KKICT_LINE_ID}) ↗`, `Open LINE (${lineId || KKICT_LINE_ID}) ↗`)}</span>
        </a>
      </div>
    </div>
  </div>
}

function ContactCard({ contact: rawContact, title, className = '' }) {
  const { t, translateContact } = useLang()
  const [showQr, setShowQr] = useState(false)
  const contact = translateContact(rawContact)
  const heading = title || t('ช่องทางติดต่อ', 'Contact Channels')
  const phone = typeof contact?.phone === 'string' ? contact.phone.trim() : ''
  const lineId = (typeof contact?.lineId === 'string' && contact.lineId.trim()) || KKICT_LINE_ID
  const lineUrl = safeHttpsHref(contact?.lineUrl) || KKICT_LINE_URL
  const email = typeof contact?.email === 'string' ? contact.email.trim() : ''
  const location = typeof contact?.location === 'string' ? contact.location.trim() : ''
  const hours = typeof contact?.hours === 'string' ? contact.hours.trim() : ''
  const note = typeof contact?.note === 'string' ? contact.note.trim() : ''
  if (![phone, lineId, lineUrl, email, location, hours, note].some(Boolean)) return null
  const phoneHref = safePhoneHref(phone)
  const emailHref = safeEmailHref(email)
  return <section className={`contact-card ${className}`.trim()} aria-label={heading}>
    <h2>{heading}</h2>
    <div className="contact-card-layout">
      <dl className="contact-details">
        {phone && <div><dt>{t('โทรศัพท์', 'Phone')}</dt><dd>{phoneHref ? <a href={phoneHref}>{phone}</a> : phone}</dd></div>}
        {(lineId || lineUrl) && <div><dt>LINE</dt><dd className="contact-line-dd"><a href={lineUrl} target="_blank" rel="noreferrer">{lineId || t('เปิด LINE', 'Open LINE')}</a><button type="button" className="qr-inline-btn" onClick={() => setShowQr(true)}>📱 {t('สแกน QR', 'QR Code')}</button></dd></div>}
        <div><dt>Facebook</dt><dd><a href={KKICT_FACEBOOK_URL} target="_blank" rel="noreferrer">{t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT ขอนแก่น ↗', 'Khon Kaen ICT Learning Center (KKICT) ↗')}</a></dd></div>
        {email && <div><dt>{t('อีเมล', 'Email')}</dt><dd>{emailHref ? <a href={emailHref}>{email}</a> : email}</dd></div>}
        {location && <div><dt>{t('ที่ตั้ง', 'Location')}</dt><dd>{location}</dd></div>}
        {hours && <div><dt>{t('เวลาทำการ', 'Service Hours')}</dt><dd>{hours}</dd></div>}
      </dl>
      <button type="button" className="contact-qr-box" onClick={() => setShowQr(true)} aria-label={t('คลิกเพื่อขยาย QR Code LINE', 'Click to enlarge LINE QR Code')}>
        <img src="/line-qr.png" alt={`LINE QR Code ${lineId}`}/>
        <span>🔍 {t('คลิกขยาย QR Code', 'Enlarge QR Code')}</span>
      </button>
    </div>
    {note && <p className="contact-note">{note}</p>}
    <LineQrModal open={showQr} onClose={() => setShowQr(false)} lineId={lineId} lineUrl={lineUrl}/>
  </section>
}

function Footer() {
  const { t, translateCategory, translateContact } = useLang()
  const [showQr, setShowQr] = useState(false)
  const contactRes = usePublicData('/settings/contact')
  const categoriesRes = usePublicData('/categories')
  const rawContact = contactRes.data || {}
  const contact = translateContact(rawContact)
  const phone = (typeof contact?.phone === 'string' && contact.phone.trim()) || '084-583-0208'
  const lineId = (typeof contact?.lineId === 'string' && contact.lineId.trim()) || KKICT_LINE_ID
  const lineUrl = safeHttpsHref(contact?.lineUrl) || KKICT_LINE_URL
  const email = (typeof contact?.email === 'string' && contact.email.trim()) || 'info.kkict@gmail.com'
  const location = (typeof contact?.location === 'string' && contact.location.trim()) || t(
    'ชั้น 2 ตลาดสดเทศบาล 1 ถนนกลางเมือง ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000',
    '2nd Floor, Municipal Fresh Market 1, Klang Mueang Rd., Nai Mueang, Mueang Khon Kaen, Khon Kaen 40000',
  )
  const hours = (typeof contact?.hours === 'string' && contact.hours.trim()) || t(
    'อังคาร – อาทิตย์ เวลา 09:00 – 17:00 น. (หยุดวันจันทร์และวันหยุดนักขัตฤกษ์)',
    'Tuesday – Sunday 09:00 – 17:00 (Closed on Mondays & Public Holidays)',
  )
  const note = (typeof contact?.note === 'string' && contact.note.trim()) || t(
    'ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น บริการพื้นที่การเรียนรู้ ห้องอบรมคอมพิวเตอร์ และให้คำปรึกษาด้านไอที',
    'Khon Kaen Municipality ICT Skill Development & Learning Center provides digital learning spaces, computer training rooms, and IT consultation.',
  )
  const phoneHref = safePhoneHref(phone) || 'tel:0845830208'
  const emailHref = safeEmailHref(email) || 'mailto:info.kkict@gmail.com'
  const fallbackCategories = [
    { categoryId: 1, categoryName: 'คอมพิวเตอร์และอุปกรณ์' },
    { categoryId: 2, categoryName: 'ระบบเครือข่ายและอินเทอร์เน็ต' },
    { categoryId: 3, categoryName: 'โปรแกรมและซอฟต์แวร์' },
    { categoryId: 4, categoryName: 'เครื่องพิมพ์และอุปกรณ์ต่อพ่วง' },
    { categoryId: 5, categoryName: 'ระบบสารสนเทศและบริการออนไลน์' },
  ]
  const categoryList = (categoriesRes.data?.length ? categoriesRes.data : fallbackCategories).map(translateCategory)
  let isAdmin = false
  try { isAdmin = Boolean(window.sessionStorage.getItem('ict-admin-token')) } catch { /* Ignore storage restrictions. */ }
  const staffPath = isAdmin ? '/admin' : '/admin/login'

  return <footer className="site-footer">
    <div className="shell footer-grid">
      <div className="footer-col footer-brand-col">
        <div className="footer-brand-head">
          <div className="footer-brand-emblems">
            <span className="footer-emblem-circle">
              <img src="/logo-khonkaen.png" alt="ตราเทศบาลนครขอนแก่น"/>
            </span>
            <span className="footer-emblem-tile">
              <img src="/logo-ict.png" alt="ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น"/>
            </span>
          </div>
          <div className="footer-brand-titles">
            <b>{t('คลังความรู้และคู่มือบริการไอที (KKICT)', 'IT Knowledge Base & Service Guides (KKICT)')}</b>
            <small>{t('เทศบาลนครขอนแก่น · KHON KAEN ICT LEARNING CENTER', 'KHON KAEN MUNICIPALITY · KHON KAEN ICT LEARNING CENTER')}</small>
          </div>
        </div>
        <p className="footer-brand-desc">
          {t(
            'ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น แหล่งรวบรวมคู่มือมาตรฐาน ขั้นตอนการตั้งค่า และวิธีแก้ไขปัญหาด้านเทคโนโลยีสารสนเทศ คอมพิวเตอร์ เครือข่าย และอุปกรณ์สำนักงานด้วยตนเอง สำหรับบุคลากรและประชาชน',
            'Khon Kaen Municipality ICT Skill Development & Learning Center — your central repository for standardized IT manuals, setup procedures, and self-service troubleshooting guides for computers, networks, and office equipment.',
          )}
        </p>
        <div className="footer-brand-site">
          <span className="footer-gold-dot" aria-hidden="true"/>
          <span>
            {t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT ขอนแก่น', 'Khon Kaen ICT Learning Center')} · <a href="https://www.kkict.net/" target="_blank" rel="noreferrer">www.kkict.net ↗</a>
          </span>
        </div>
      </div>

      <div className="footer-col">
        <h3 className="footer-heading">{t('เกี่ยวกับเรา', 'About Us')}</h3>
        <ul className="footer-links">
          <li><Link to="/">{t('หน้าแรกคลังความรู้', 'Knowledge Base Home')}</Link></li>
          <li><Link to="/articles">{t('คลังความรู้และคู่มือทั้งหมด', 'All Guides & Manuals')}</Link></li>
          <li><Link to="/search">{t('ค้นหาวิธีแก้ไขปัญหาไอที', 'Search IT Troubleshooting')}</Link></li>
          <li><Link to="/articles?sort=popular">{t('คู่มือยอดนิยมประจำศูนย์', 'Most Popular Guides')}</Link></li>
          <li><a href="https://www.kkict.net/" target="_blank" rel="noreferrer">{t('เว็บไซต์หลัก kkict.net ↗', 'Main Website kkict.net ↗')}</a></li>
          <li><Link to={staffPath}>{t('เข้าสู่ระบบเจ้าหน้าที่', 'Staff Portal Login')}</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h3 className="footer-heading">{t('หมวดหมู่คู่มือบริการ', 'Service Guide Categories')}</h3>
        <ul className="footer-links">
          {categoryList.map((cat) => (
            <li key={cat.categoryId}>
              <Link to={`/articles?category=${cat.categoryId}`}>{cat.categoryName}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer-col footer-contact-col">
        <h3 className="footer-heading">{t('ติดต่อศูนย์ ICT', 'Contact ICT Center')}</h3>
        <ul className="footer-contact-list">
          <li>
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span>{location}</span>
          </li>
          <li>
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <span>{t('โทรศัพท์:', 'Phone:')} <a href={phoneHref}><b>{phone}</b></a></span>
          </li>
          <li>
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
            <span>{t('อีเมล:', 'Email:')} <a href={emailHref}><b>{email}</b></a></span>
          </li>
          <li>
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </span>
            <span>LINE: <a href={lineUrl} target="_blank" rel="noreferrer"><b>{lineId}</b></a></span>
          </li>
          <li>
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span>{t('เวลาทำการ:', 'Hours:')} {hours}</span>
          </li>
        </ul>
        {note && <p className="footer-contact-note">{note}</p>}
        <div className="footer-social-row" aria-label={t('ช่องทางติดต่อโซเชียล', 'Social & contact links')}>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.29-1.73 1.76-1.73z"/></svg>
          </a>
          <a href={lineUrl} target="_blank" rel="noreferrer" aria-label="LINE">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 10.6C20 6.9 16.4 4 12 4S4 6.9 4 10.6c0 3.3 2.9 6 6.8 6.5.3.1.6.2.7.5.1.2 0 .5 0 .7l-.1.7c0 .2-.2.8.7.4.9-.4 4.7-2.8 6.4-4.7 1-1.2 1.5-2.6 1.5-4.1z"/></svg>
          </a>
          <a href="https://www.kkict.net/" target="_blank" rel="noreferrer" aria-label="Website kkict.net">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </a>
          <a href={emailHref} aria-label="Email">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
          <a href={phoneHref} aria-label="Phone">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="shell footer-bottom-inner">
        <span>Copyright © 2026 {t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT)', 'Khon Kaen Municipality ICT Learning Center (KKICT)')}. All rights reserved.</span>
        <nav className="footer-bottom-links" aria-label={t('ลิงก์ส่วนท้าย', 'Footer bottom links')}>
          <a href="https://www.kkict.net/" target="_blank" rel="noreferrer">{t('เว็บไซต์หลัก kkict.net', 'Main Website kkict.net')}</a>
          <span aria-hidden="true">|</span>
          <Link to="/articles">{t('คลังความรู้ทั้งหมด', 'All Guides')}</Link>
          <span aria-hidden="true">|</span>
          <Link to="/search">{t('ค้นหาคู่มือ', 'Search Guides')}</Link>
          <span aria-hidden="true">|</span>
          <Link to={staffPath}>{t('สำหรับเจ้าหน้าที่', 'For Staff')}</Link>
        </nav>
      </div>
    </div>
  </footer>
}

function SearchBox({ initial = '' }) {
  const { t, translateKeyword } = useLang()
  const [value, setValue] = useState(initial)
  const navigate = useNavigate()
  const popularTerms = [
    ['Wi-Fi', 'Wi-Fi'],
    ['Printer', 'Printer'],
    ['รหัสผ่าน', translateKeyword('รหัสผ่าน')],
    ['Windows', 'Windows'],
    ['อินเทอร์เน็ต', translateKeyword('อินเทอร์เน็ต')],
  ]
  return <><form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(value.trim())}`) }}>
    <span>⌕</span><input value={value} onChange={(e) => setValue(e.target.value)} aria-label={t('พิมพ์คำค้น', 'Search guides')} placeholder={t('พิมพ์สิ่งที่ต้องการค้นหา เช่น เชื่อมต่อ Wi-Fi...', 'Search IT guides, e.g. Wi-Fi, Printer, Password...')}/><button type="submit">{t('ค้นหาคู่มือ', 'Search Guides')}</button>
  </form><div className="popular-searches"><span>{t('คำค้นหายอดนิยม', 'Popular Searches')}</span>{popularTerms.map(([rawTerm, label]) => <button type="button" key={rawTerm} onClick={() => navigate(`/search?q=${encodeURIComponent(rawTerm)}`)}>{label}</button>)}</div></>
}

function usePublicData(path) {
  const [response, setResponse] = useState({ path: '', data: null, error: '' })
  useEffect(() => {
    if (!path) return
    let active = true
    api.get(path).then((data) => { if (active) setResponse({ path, data, error: '' }) }).catch((err) => { if (active) setResponse({ path, data: null, error: err.message || 'ไม่สามารถโหลดข้อมูลได้' }) })
    return () => { active = false }
  }, [path])
  const current = response.path === path
  return { data: current ? response.data : null, error: current ? response.error : '', loading: !current }
}

function CategoryGrid({ categories = [] }) {
  const { t, translateCategory } = useLang()
  return <div className="category-grid">{(categories || []).map((rawCategory, index) => {
    const category = translateCategory(rawCategory)
    const count = category._count?.articles ?? 0
    return <Link to={`/articles?category=${category.categoryId}`} className="category-card" key={category.categoryId}>
      <span className={`category-icon color-${index % 5}`}>{categoryIcons[index % categoryIcons.length]}</span><span><b>{category.categoryName}</b><small>{count} {t('บทความ', count === 1 ? 'guide' : 'guides')}</small></span><span className="arrow">→</span>
    </Link>
  })}</div>
}

function ArticleCard({ article: rawArticle }) {
  const { t, formatDate, translateArticle } = useLang()
  const { isBookmarked, toggleBookmark } = useSavedGuides()
  const article = translateArticle(rawArticle)
  const saved = isBookmarked(article.articleId)
  const imageCount = Array.isArray(article.images) && article.images.length ? article.images.length : (article.image ? 1 : 0)
  return <article className="article-card"><div className="article-art-wrap"><Link className="article-art" to={`/articles/${article.articleId}`} aria-label={`${t('อ่าน', 'Read')} ${article.title}`}>
    {article.image ? <img src={assetUrl(article.image)} alt=""/> : <div className="art-placeholder"><span>{article.category?.categoryName || t('คู่มือ ICT', 'ICT Guide')}</span><b>{article.title.slice(0, 1)}</b><i>ICT KNOWLEDGE</i></div>}
    {article.featured && <span className="featured-tag">{t('แนะนำ', 'Featured')}</span>}
    {imageCount > 1 && <span className="image-count-tag">🖼 {imageCount} {t('รูป', 'pics')}</span>}
    {article.videoUrl && <span className="video-tag">▶ {t('วิดีโอ/ลิงก์', 'Video/Link')}</span>}
  </Link><button
    type="button"
    className={`card-bookmark-btn${saved ? ' active' : ''}`}
    onClick={() => toggleBookmark(rawArticle)}
    aria-pressed={saved}
    aria-label={saved ? t(`ยกเลิกบันทึก ${article.title}`, `Remove ${article.title} from saved guides`) : t(`บันทึกคู่มือ ${article.title}`, `Save ${article.title}`)}
    title={saved ? t('บันทึกไว้แล้ว (คลิกเพื่อนำออก)', 'Saved (click to remove)') : t('บันทึกคู่มือนี้ไว้ดูภายหลัง', 'Save this guide for later')}
  >{saved ? '★' : '☆'}</button></div><div className="article-copy"><div className="article-meta"><span>{article.category?.categoryName || t('ความรู้ทั่วไป', 'General Guide')}</span><span>{formatDate(article.publishedAt || article.createdAt)}</span></div>
    <h3><Link to={`/articles/${article.articleId}`}>{article.title}</Link></h3><p>{excerpt(article.content)}</p><div className="article-bottom"><span>◷ {Number(article.viewCount || 0).toLocaleString('th-TH')} {t('ครั้ง', 'views')}</span><Link to={`/articles/${article.articleId}`}>{t('อ่านเพิ่มเติม', 'Read Guide')} <b>→</b></Link></div>
  </div></article>
}

function PersonalGuidesShelf() {
  const { t, translateArticle } = useLang()
  const { bookmarks, recentGuides, toggleBookmark, clearRecentGuides, clearBookmarks } = useSavedGuides()
  const [activeTab, setActiveTab] = useState('')
  if (!bookmarks.length && !recentGuides.length) return null
  const currentTab = activeTab === 'saved' && bookmarks.length
    ? 'saved'
    : activeTab === 'recent' && recentGuides.length
      ? 'recent'
      : bookmarks.length ? 'saved' : 'recent'
  const items = (currentTab === 'saved' ? bookmarks : recentGuides).slice(0, 6)

  return <section className="section shell personal-shelf-section" aria-label={t('คลังคู่มือส่วนตัวของคุณ', 'Your Personal Guide Shelf')}>
    <div className="personal-shelf-box">
      <div className="personal-shelf-head">
        <div>
          <span className="eyebrow">{t('PERSONAL QUICK ACCESS · เก็บไว้ในเบราว์เซอร์ของคุณ', 'PERSONAL QUICK ACCESS · STORED IN YOUR BROWSER')}</span>
          <h2>{t('คู่มือที่บันทึกไว้ & เปิดอ่านล่าสุด', 'Saved & Recently Viewed Guides')}</h2>
        </div>
        <div className="personal-shelf-controls">
          <div className="personal-shelf-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={currentTab === 'saved'}
              className={currentTab === 'saved' ? 'active' : ''}
              onClick={() => setActiveTab('saved')}
            >
              ★ {t('ที่บันทึกไว้', 'Saved Guides')} <span>{bookmarks.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentTab === 'recent'}
              className={currentTab === 'recent' ? 'active' : ''}
              onClick={() => setActiveTab('recent')}
            >
              ◷ {t('เปิดอ่านล่าสุด', 'Recently Viewed')} <span>{recentGuides.length}</span>
            </button>
          </div>
          {currentTab === 'saved' && bookmarks.length > 0 && <>
            <Link className="text-link" to="/articles?saved=1">{t('ดูที่บันทึกทั้งหมด', 'View All Saved')} <b>→</b></Link>
            <button type="button" className="shelf-clear-btn" onClick={clearBookmarks}>{t('ล้างที่บันทึก', 'Clear Saved')}</button>
          </>}
          {currentTab === 'recent' && recentGuides.length > 0 && (
            <button type="button" className="shelf-clear-btn" onClick={clearRecentGuides}>{t('ล้างประวัติล่าสุด', 'Clear History')}</button>
          )}
        </div>
      </div>

      {items.length ? <div className="personal-mini-grid">
        {items.map((rawItem) => {
          const item = translateArticle(rawItem)
          return <div className="personal-mini-card" key={`${currentTab}-${item.articleId}`}>
            <Link className="personal-mini-main" to={`/articles/${item.articleId}`}>
              <span className="personal-mini-icon" aria-hidden="true">{currentTab === 'saved' ? '★' : '◷'}</span>
              <div className="personal-mini-copy">
                <small>{item.category?.categoryName || t('คู่มือ ICT', 'ICT Guide')}</small>
                <b>{item.title}</b>
              </div>
            </Link>
            {currentTab === 'saved' && <button
              type="button"
              className="personal-mini-remove"
              onClick={() => toggleBookmark(rawItem)}
              title={t('นำออกจากรายการที่บันทึก', 'Remove from saved guides')}
              aria-label={t(`นำออก ${item.title}`, `Remove ${item.title}`)}
            >×</button>}
          </div>
        })}
      </div> : <p className="personal-shelf-empty">
        {currentTab === 'saved'
          ? t('ยังไม่มีคู่มือที่บันทึกไว้ — กดปุ่ม ☆ บนการ์ดหรือในหน้าบทความเพื่อบันทึกคู่มือที่ใช้บ่อย', 'No saved guides yet — click ☆ on any guide card or article page to bookmark it for quick access.')
          : t('ยังไม่มีประวัติคู่มือที่เพิ่งเปิดอ่าน', 'No recently viewed guides yet.')}
      </p>}
    </div>
  </section>
}

function SectionHeading({ eyebrow, title, action, to }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <Link className="text-link" to={to}>{action} <b>→</b></Link>}</div> }

function HomePage() {
  const { t } = useLang()
  const categories = usePublicData('/categories')
  const recent = usePublicData('/articles?limit=6')
  const featured = usePublicData('/articles?featured=true&limit=3')
  const contact = usePublicData('/settings/contact')
  const contactHref = contactActionHref(contact.data)
  useDocumentTitle('')
  return <main>
    <section className="hero"><div className="shell hero-inner"><div className="hero-copy"><div className="hero-kicker"><img className="kicker-seal" src="/logo-khonkaen.png" alt=""/><img className="kicker-ict" src="/logo-ict.png" alt=""/><span>{t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น', 'Khon Kaen Municipality ICT Learning Center')}</span></div><h1>{t('คลังความรู้และคู่มือไอที', 'IT Knowledge Base & Manuals')}<br/>{t('เพื่อการเรียนรู้และแก้ไขปัญหาด้วยตนเอง', 'for Self-Service Learning & Troubleshooting')}</h1><p>{t('บริการข้อมูลคู่มือการใช้งานคอมพิวเตอร์ เครือข่าย อุปกรณ์สำนักงาน และระบบสารสนเทศ ค้นหาคำตอบได้สะดวกพร้อมขั้นตอนปฏิบัติอย่างเป็นลำดับ', 'Explore step-by-step manuals for computers, wireless networks, office equipment, and municipal information systems — easy to follow anytime.')}</p><SearchBox/><div className="hero-proof"><span>✓</span> {t('มาตรฐานคู่มือเข้าใจง่าย', 'Clear Step-by-Step Guides')} <span>✓</span> {t('ค้นหาได้ตลอด 24 ชั่วโมง', 'Available 24/7 Online')} <span>✓</span> {t('บริการสาธารณะไม่มีค่าใช้จ่าย', 'Free Public Service')}</div></div><div className="hero-visual" aria-hidden="true"><div className="visual-circle"><div className="visual-window"><div className="window-bar"><i/><i/><i/><b>KKICT SERVICE PORTAL</b></div><div className="window-content window-logo-content"><img className="window-logo-seal" src="/logo-khonkaen.png" alt=""/><img className="window-logo-ict" src="/logo-ict.png" alt=""/><div className="window-check">✓</div></div></div><span className="float-chip chip-one">✓ {t('ขั้นตอนชัดเจน ทำตามได้จริง', 'Practical Step-by-Step')}</span><span className="float-chip chip-two">⌕ {t('ค้นหาคู่มือมาตรฐาน', 'Verified IT Manuals')}</span><span className="visual-dot dot-one"/><span className="visual-dot dot-two"/></div></div></div></section>
    <PersonalGuidesShelf/>
    <section className="section shell categories-section"><SectionHeading eyebrow="BROWSE BY TOPIC" title={t('เลือกหมวดหมู่ความรู้', 'Browse by Category')} action={t('ดูทุกหมวดหมู่', 'View All Categories')} to="/articles"/>{categories.loading ? <div className="loading">{t('กำลังโหลดหมวดหมู่...', 'Loading categories...')}</div> : categories.error ? <ErrorState message={categories.error}/> : categories.data?.length ? <CategoryGrid categories={categories.data}/> : <EmptyState title={t('ยังไม่มีหมวดหมู่', 'No Categories Yet')} detail={t('หมวดหมู่ความรู้จะแสดงที่นี่เมื่อมีการเพิ่มข้อมูล', 'Knowledge categories will appear here once added.')}/>}</section>
    <section className="section latest-section"><div className="shell"><SectionHeading eyebrow="LATEST KNOWLEDGE" title={t('คู่มือและบทความล่าสุด', 'Latest Guides & Articles')} action={t('ดูบทความทั้งหมด', 'View All Guides')} to="/articles"/>{recent.loading ? <div className="loading">{t('กำลังโหลดบทความ...', 'Loading articles...')}</div> : recent.error ? <ErrorState message={recent.error}/> : recent.data?.length ? <div className="article-grid">{(recent.data || []).map((a) => <ArticleCard key={a.articleId} article={a}/>)}</div> : <EmptyState title={t('ยังไม่มีบทความ', 'No Articles Yet')} detail={t('เมื่อมีการเผยแพร่คู่มือ บทความจะแสดงที่นี่', 'Published guides will appear here.')}/>}</div></section>
    {!!featured.data?.length && <section className="section shell"><SectionHeading eyebrow="EDITOR'S PICKS" title={t('บทความแนะนำ', 'Featured Guides')}/><div className="article-grid">{(featured.data || []).map((a) => <ArticleCard key={a.articleId} article={a}/>)}</div></section>}
    <section className="help-banner shell"><div className="help-mark">i</div><div><b>{t('ยังหาคำตอบที่ต้องการไม่เจอ?', 'Still looking for the right answer?')}</b><p>{t('ลองค้นหาด้วยคำอื่น หรือเลือกดูจากหมวดหมู่ด้านบน', 'Try searching with another keyword or browse our categories above.')}</p></div><Link to="/articles">{t('ดูคลังความรู้', 'Browse Library')} <span>→</span></Link>{contactHref && <a className="help-contact-link" href={contactHref}>{t('ติดต่อเจ้าหน้าที่', 'Contact ICT Staff')}</a>}</section>
  </main>
}

function ErrorState({ message }) {
  const { t } = useLang()
  return <div className="notice error-notice"><b>{t('ไม่สามารถเชื่อมต่อข้อมูลได้', 'Unable to Load Data')}</b><span>{message} {t('โปรดลองใหม่เมื่อตรวจสอบการเชื่อมต่อระบบแล้ว', 'Please check your connection and try again.')}</span></div>
}
function EmptyState({ title, detail }) { return <div className="empty-state"><span>⌕</span><b>{title}</b><p>{detail}</p></div> }

function NotFoundPage() {
  const { t } = useLang()
  useDocumentTitle(t('ไม่พบหน้าที่ต้องการ', 'Page Not Found'))
  return <main className="not-found shell"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>{t('ไม่พบหน้าที่คุณกำลังหา', 'Page Not Found')}</h1><p>{t('ลิงก์นี้อาจถูกย้ายหรือไม่มีอยู่แล้ว', 'The link you followed may have been moved or no longer exists.')}</p><Link className="admin-primary-link" to="/">{t('กลับหน้าแรก', 'Back to Home')}</Link></main>
}

function ArticlesPage({ search = false }) {
  const { t, translateCategory, translateKeyword, translateArticle } = useLang()
  const { bookmarks, recentGuides, clearRecentGuides, clearBookmarks } = useSavedGuides()
  const [params, setParams] = useSearchParams(); const query = params.get('q') || ''; const categoryId = params.get('category') || ''
  const savedOnly = params.get('saved') === '1'
  const navigate = useNavigate()
  const categories = usePublicData('/categories')
  const rawSelectedCategory = (categories.data || []).find((category) => String(category.categoryId) === categoryId)
  const selectedCategory = translateCategory(rawSelectedCategory)
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1)
  const searchParams = new URLSearchParams({ sort: params.get('sort') || 'recent', page: String(page), pageSize: '9' })
  if (query) searchParams.set('q', query)
  if (categoryId) searchParams.set('category', categoryId)
  const path = savedOnly ? '' : `/articles/search?${searchParams.toString()}`
  const results = usePublicData(path)
  function updateFilter(key, value) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); next.delete('page'); setParams(next) }
  function toggleSavedFilter(enable) {
    const next = new URLSearchParams(params)
    if (enable) next.set('saved', '1')
    else next.delete('saved')
    next.delete('page')
    setParams(next)
  }
  function goToPage(value) { const next = new URLSearchParams(params); next.set('page', String(value)); setParams(next) }
  function applySuggestion(term) {
    const next = new URLSearchParams()
    next.set('q', term)
    if (params.get('sort')) next.set('sort', params.get('sort'))
    navigate(`/search?${next.toString()}`)
  }
  const filteredSavedItems = useMemo(() => {
    if (!savedOnly) return []
    const qLower = query.trim().toLowerCase()
    let list = bookmarks.filter((item) => {
      if (categoryId && String(item.categoryId) !== categoryId) return false
      if (!qLower) return true
      const translated = translateArticle(item)
      const hay = `${item.title} ${translated.title} ${item.content} ${translated.content}`.toLowerCase()
      return hay.includes(qLower)
    })
    if (params.get('sort') === 'popular') {
      list = [...list].sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0))
    }
    return list
  }, [savedOnly, bookmarks, categoryId, query, params, translateArticle])

  const displayItems = savedOnly ? filteredSavedItems : (results.data?.items || [])
  const displayTotal = savedOnly ? filteredSavedItems.length : (results.data?.total || 0)
  const didYouMean = !savedOnly ? (results.data?.didYouMean || null) : null
  const suggestions = !savedOnly ? (results.data?.suggestions || []) : []
  const suggestedArticles = !savedOnly ? (results.data?.suggestedArticles || []) : []
  useDocumentTitle(savedOnly ? t('คู่มือที่บันทึกไว้', 'Saved Guides') : search ? (query ? `${t('ค้นหา', 'Search')} “${query}”` : t('ค้นหาคู่มือ', 'Search Guides')) : selectedCategory ? selectedCategory.categoryName : t('คลังความรู้และคู่มือ', 'Knowledge Library'))
  return <main className="listing-page"><div className="shell"><div className="page-intro"><div className="breadcrumbs"><Link to="/">{t('หน้าแรก', 'Home')}</Link><span>/</span>{savedOnly ? t('คู่มือที่บันทึกไว้', 'Saved Guides') : search ? t('ผลการค้นหา', 'Search Results') : categoryId && selectedCategory ? <><Link to="/articles">{t('คลังบทความ', 'Knowledge Library')}</Link><span>/</span><span>{selectedCategory.categoryName}</span></> : t('คลังบทความ', 'Knowledge Library')}</div><span className="eyebrow">ICT KNOWLEDGE LIBRARY</span><h1>{savedOnly ? t('★ คู่มือที่บันทึกไว้', '★ Your Saved Guides') : selectedCategory && !search ? selectedCategory.categoryName : search ? t('ผลการค้นหา', 'Search Results') : t('คลังความรู้และคู่มือ', 'Knowledge Library & Manuals')}</h1><p>{savedOnly ? t('รายการคู่มือที่คุณกดบันทึกเก็บไว้ในเบราว์เซอร์เพื่อเปิดดูซ้ำได้สะดวกโดยไม่ต้องค้นหาใหม่', 'Guides you bookmarked in your browser for quick access without searching again.') : search ? (query ? <>{t('ผลลัพธ์สำหรับ', 'Showing results for')} <b>“{query}”</b></> : t('พิมพ์คำค้นเพื่อค้นหาคู่มือ', 'Enter a keyword to search for guides')) : t('ค้นหาคู่มือและวิธีแก้ไขปัญหาด้านเทคโนโลยีสารสนเทศ', 'Browse and search our collection of IT manuals and troubleshooting guides')}</p><SearchBox key={query} initial={query}/></div>
    <div className="listing-layout"><aside className="filter-panel">
      <b>{t('คลังส่วนตัว', 'Personal Shelf')}</b>
      <button type="button" className={savedOnly ? 'active is-saved-filter' : 'is-saved-filter'} onClick={() => toggleSavedFilter(!savedOnly)}>
        <span>★ {t('คู่มือที่บันทึกไว้', 'Saved Guides')}</span>
        <span className="filter-count-pill">{bookmarks.length}</span>
      </button>
      <b className="filter-section-title">{t('หมวดหมู่ความรู้', 'Categories')}</b>
      <button className={!categoryId && !savedOnly ? 'active' : ''} onClick={() => { const next = new URLSearchParams(params); next.delete('category'); next.delete('saved'); next.delete('page'); setParams(next) }}>{t('ทั้งหมด', 'All Categories')}</button>
      {(categories.data || []).map((rawCat) => { const c = translateCategory(rawCat); return <button key={c.categoryId} className={categoryId === String(c.categoryId) ? 'active' : ''} onClick={() => updateFilter('category', String(c.categoryId))}>{c.categoryName}</button> })}
      {recentGuides.length > 0 && <div className="sidebar-recent-box">
        <div className="sidebar-recent-head">
          <b>◷ {t('เปิดอ่านล่าสุด', 'Recently Viewed')}</b>
          <button type="button" onClick={clearRecentGuides}>{t('ล้าง', 'Clear')}</button>
        </div>
        <ul className="sidebar-recent-list">
          {recentGuides.slice(0, 5).map((rawItem) => {
            const item = translateArticle(rawItem)
            return <li key={`recent-side-${item.articleId}`}>
              <Link to={`/articles/${item.articleId}`}>{item.title}</Link>
            </li>
          })}
        </ul>
      </div>}
    </aside>
      <section className="listing-results"><div className="results-head"><span>{displayTotal} {t('บทความ', 'guides')}</span><div className="results-head-actions">{savedOnly && bookmarks.length > 0 && <button type="button" className="shelf-clear-btn" onClick={clearBookmarks}>{t('ล้างรายการที่บันทึก', 'Clear All Saved')}</button>}<select aria-label={t('เรียงลำดับ', 'Sort by')} value={params.get('sort') || 'recent'} onChange={(e) => updateFilter('sort', e.target.value)}><option value="recent">{t('ใหม่ล่าสุด', 'Most Recent')}</option><option value="popular">{t('ยอดเข้าชมสูงสุด', 'Most Viewed')}</option></select></div></div>
        {!savedOnly && results.loading ? <div className="loading">{t('กำลังค้นหาบทความ...', 'Searching guides...')}</div> : !savedOnly && results.error ? <ErrorState message={results.error}/> : displayItems.length ? <>
          {query && suggestions.length > 0 && <div className="search-assist-bar" role="region" aria-label={t('คำค้นใกล้เคียง', 'Related search terms')}>
            <span>💡 {t('คำค้นที่ใกล้เคียง:', 'Related keywords:')}</span>
            {suggestions.map((term) => <button type="button" key={term} className="suggestion-chip" onClick={() => applySuggestion(term)}>{translateKeyword(term)}</button>)}
          </div>}
          <div className="article-grid">{displayItems.map((a) => <ArticleCard key={a.articleId} article={a}/>)}</div>
          {!savedOnly && results.data.pageCount > 1 && <nav className="pagination" aria-label={t('เปลี่ยนหน้าผลการค้นหา', 'Search results pagination')}><button disabled={page <= 1} onClick={() => goToPage(page - 1)}>← {t('ก่อนหน้า', 'Previous')}</button><span>{t(`หน้า ${results.data.page} จาก ${results.data.pageCount}`, `Page ${results.data.page} of ${results.data.pageCount}`)}</span><button disabled={page >= results.data.pageCount} onClick={() => goToPage(page + 1)}>{t('ถัดไป', 'Next')} →</button></nav>}
        </> : savedOnly ? <div className="empty-state search-empty-box">
          <span>★</span>
          <b>{t('ยังไม่มีคู่มือที่บันทึกไว้', 'No Saved Guides Yet')}</b>
          <p>{t('คุณสามารถกดปุ่ม ☆ บนมุมการ์ดบทความ หรือปุ่ม “☆ บันทึกคู่มือนี้” ในหน้าอ่านบทความ เพื่อเก็บคู่มือที่ใช้บ่อยไว้เปิดดูที่นี่ได้ทันที', 'Click the ☆ star button on any guide card or inside an article page to bookmark guides for quick access here.')}</p>
          <button type="button" className="clear-category-btn" onClick={() => toggleSavedFilter(false)}>{t('ดูคู่มือทั้งหมดในคลังความรู้ →', 'Browse All Guides →')}</button>
        </div> : <>
          <div className="empty-state search-empty-box">
            <span>⌕</span>
            <b>{query ? t(`ไม่พบบทความที่ตรงกับคำว่า “${query}”`, `No guides matched “${query}”`) : t('ไม่พบบทความในหมวดหมู่นี้', 'No guides found in this category')}</b>
            <p>{t('อาจเกิดจากการสะกดคำผิด ลืมเปลี่ยนภาษาแป้นพิมพ์ หรือใช้คำเฉพาะ — ลองเลือกคำค้นใกล้เคียงด้านล่างได้เลยครับ', 'This may be due to a typo or keyboard layout mismatch — try one of the suggested keywords below.')}</p>
            {didYouMean && <div className="did-you-mean-row">
              <span>💡 {t('คุณหมายถึงคำนี้หรือไม่:', 'Did you mean:')}</span>
              <button type="button" className="did-you-mean-btn" onClick={() => applySuggestion(didYouMean)}>⌕ {t(`ค้นหาคำว่า “${didYouMean}”`, `Search for “${translateKeyword(didYouMean)}”`)}</button>
            </div>}
            {suggestions.length > 0 && <div className="suggestions-block">
              <small>{t('คำค้นใกล้เคียงที่มีคู่มือในระบบ:', 'Suggested keywords with available guides:')}</small>
              <div className="suggestion-chip-list">
                {suggestions.map((term) => <button type="button" key={term} className="suggestion-chip" onClick={() => applySuggestion(term)}>{translateKeyword(term)}</button>)}
              </div>
            </div>}
            {categoryId && <button type="button" className="clear-category-btn" onClick={() => updateFilter('category', '')}>{t('ดูบทความจากทุกหมวดหมู่ →', 'View Guides from All Categories →')}</button>}
          </div>
          {suggestedArticles.length > 0 && <div className="suggested-articles-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RECOMMENDED GUIDES</span>
                <h2>{t('คู่มือที่ใกล้เคียงกับคำค้นของคุณ', 'Recommended Guides Related to Your Search')}</h2>
              </div>
            </div>
            <div className="article-grid">
              {suggestedArticles.map((a) => <ArticleCard key={a.articleId} article={a}/>)}
            </div>
          </div>}
        </>}
      </section></div>
  </div></main>
}

function ArticlePage() {
  const { t, formatDate, translateArticle } = useLang()
  const { bookmarks, recentGuides, isBookmarked, toggleBookmark, recordRecentView } = useSavedGuides()
  const { id } = useParams()
  const [routeParams] = useSearchParams()
  const preview = routeParams.get('preview') === '1'
  const { data: rawArticle, error, loading } = usePublicData(`/articles/${id}${preview ? '?preview=1' : ''}`)
  useEffect(() => {
    if (rawArticle?.articleId) recordRecentView(rawArticle)
  }, [rawArticle, recordRecentView])
  const article = translateArticle(rawArticle)
  const saved = isBookmarked(rawArticle?.articleId)
  const contact = usePublicData('/settings/contact')
  const [vote, setVote] = useState({ id: '', value: '', count: null, helpfulCount: null })
  const [sending, setSending] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [activeImageState, setActiveImageState] = useState({ articleId: '', index: 0 })
  const [fontScale, setFontScale] = useState(() => {
    try { return window.localStorage.getItem('ict-reader-font-scale') || 'normal' } catch { return 'normal' }
  })
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  function changeFontScale(scale) {
    setFontScale(scale)
    try { window.localStorage.setItem('ict-reader-font-scale', scale) } catch { /* Ignore storage restrictions. */ }
  }
  const related = usePublicData(rawArticle ? `/articles?category=${rawArticle.categoryId}&limit=6` : '')
  useDocumentTitle(article?.title || (loading ? t('กำลังโหลดบทความ', 'Loading Guide') : t('ไม่พบบทความ', 'Guide Not Found')))
  const voteValue = vote.id === id ? vote.value : ''
  let storedVote = null
  try { storedVote = window.localStorage.getItem(`ict-article-vote-${id}`) } catch { /* Voting remains available when storage is blocked. */ }
  const feedbackCount = vote.id === id ? vote.count : article?.feedbackCount || 0
  const helpfulCount = vote.id === id ? vote.helpfulCount : article?.helpfulCount || 0
  const sendVote = async (helpful) => {
    setSending(true)
    try {
      const result = await api.post(`/articles/${id}/feedback`, { helpful, voterKey: feedbackKey() })
      try { window.localStorage.setItem(`ict-article-vote-${id}`, helpful ? 'yes' : 'no') } catch { /* The API still records this vote if local storage is unavailable. */ }
      setVote({ id, value: helpful ? 'yes' : 'no', count: result.count, helpfulCount: result.helpfulCount })
    } catch (e) { setVote({ id, value: e.message || t('เกิดข้อผิดพลาด', 'An error occurred'), count: null, helpfulCount: null }) }
    finally { setSending(false) }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setCopyError('')
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      const field = document.createElement('textarea')
      field.value = window.location.href
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      const success = document.execCommand('copy')
      field.remove()
      setCopied(success)
      setCopyError(success ? '' : t('ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกจากแถบที่อยู่', 'Could not copy link automatically. Please copy from the address bar.'))
      if (success) window.setTimeout(() => setCopied(false), 2500)
    }
  }
  if (loading) return <main className="article-detail shell"><div className="loading">{t('กำลังโหลดบทความ...', 'Loading guide...')}</div></main>
  if (error || !article) return <main className="article-detail shell"><ErrorState message={error || t('ไม่พบบทความนี้', 'Guide not found')}/><Link className="text-link" to="/articles">← {t('กลับไปคลังบทความ', 'Back to Knowledge Library')}</Link></main>
  const steps = Array.isArray(article.steps) ? article.steps : []
  const paragraphs = (article.content || '').split(/\n{2,}/).filter(Boolean)
  const relatedArticles = (related.data || []).filter((item) => item.articleId !== article.articleId).slice(0, 4)
  const quickHelpHref = contactActionHref(contact.data)
  const mediaLink = parseMediaLink(article.videoUrl)
  const galleryImages = Array.isArray(article.images) && article.images.length
    ? article.images.filter(Boolean)
    : (article.image ? [article.image] : [])
  const rawImgIdx = activeImageState.articleId === id ? activeImageState.index : 0
  const activeImageIdx = Math.min(Math.max(0, rawImgIdx), Math.max(0, galleryImages.length - 1))





















  const selectImage = (index) => setActiveImageState({ articleId: id, index })
  const currentImage = galleryImages[activeImageIdx] || null
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const lineShareHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  return <main className="article-detail shell">
    {preview && <div className="preview-banner" role="status"><b>{t('โหมดดูตัวอย่างของเจ้าหน้าที่', 'Staff Preview Mode')}</b><span>{t('การเปิดหน้านี้จะไม่ถูกนับเป็นยอดเข้าชม', 'Viewing this page in preview mode does not increment the view count.')}</span></div>}

    <header className="article-hero-card">
      <div className="article-hero-main">
        <div className="breadcrumbs"><Link to="/">{t('หน้าแรก', 'Home')}</Link><span>/</span><Link to={`/articles?category=${article.categoryId}`}>{article.category?.categoryName || t('คลังบทความ', 'Knowledge Library')}</Link><span>/</span><span>{article.title}</span></div>
        <div className="article-meta"><Link to={`/articles?category=${article.categoryId}`}>{article.category?.categoryName}</Link><span>{t('เผยแพร่', 'Published')} {formatDate(article.publishedAt || article.createdAt)}</span></div>
        <h1>{article.title}</h1>
        <div className="detail-stats">
          <span>◷ {t('เข้าชม', 'Views')} {Number(article.viewCount || 0).toLocaleString('th-TH')} {t('ครั้ง', '')}</span>
          <span>✎ {t('อัปเดตล่าสุด', 'Last updated')} {formatDate(article.updatedAt)}</span>
          {steps.length > 0 && <span>✓ {steps.length} {t('ขั้นตอนปฏิบัติ', 'Steps')}</span>}
          {galleryImages.length > 1 && <span>🖼 {galleryImages.length} {t('รูปภาพประกอบ', 'Images')}</span>}
        </div>
        <div className="article-tools">
          <button
            type="button"
            className={`bookmark-action-btn${saved ? ' active' : ''}`}
            onClick={() => toggleBookmark(rawArticle)}
            aria-pressed={saved}
          >
            {saved ? t('★ บันทึกคู่มือแล้ว', '★ Guide Saved') : t('☆ บันทึกคู่มือนี้', '☆ Save Guide')}
          </button>
          <button className="print-button" onClick={copyLink}>{copied ? t('✓ คัดลอกลิงก์แล้ว', '✓ Link Copied') : t('⧉ คัดลอกลิงก์คู่มือ', '⧉ Copy Guide Link')}</button>
          <a className="share-button share-line-btn" href={lineShareHref} target="_blank" rel="noopener noreferrer" aria-label={t('แชร์คู่มือนี้ไปยัง LINE', 'Share this guide on LINE')}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            <span>{t('แชร์ไปยัง LINE', 'Share on LINE')}</span>
          </a>
          <a className="share-button share-fb-btn" href={facebookShareHref} target="_blank" rel="noopener noreferrer" aria-label={t('แชร์คู่มือนี้ไปยัง Facebook', 'Share this guide on Facebook')}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>{t('แชร์ไปยัง Facebook', 'Share on Facebook')}</span>
          </a>
          <button className="print-button" onClick={() => window.print()}>▤ {t('พิมพ์คู่มือ / บันทึกเป็น PDF', 'Print / Save PDF')}</button>
          {mediaLink && <a className="print-button" href="#article-video">▶ {t('ดูวิดีโอ / ลิงก์ประกอบ', 'Watch Video / Link')}</a>}
          {article.pdfFile && <button type="button" className="print-button" onClick={() => { setShowPdfViewer(true); window.setTimeout(() => document.getElementById('article-pdf')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60) }}>👁 {t('อ่าน PDF บนเว็บ', 'Read PDF Online')}</button>}
          {article.pdfFile && <a className="download-button hero-pdf-btn" href={assetUrl(article.pdfFile)} download>⬇ {t('ดาวน์โหลด PDF', 'Download PDF')}</a>}
          {copyError && <span role="status">{copyError}</span>}
        </div>
      </div>
      <div className="article-hero-art" aria-hidden="true">
        <div className="hero-art-glow"/>
        <div className="hero-art-sheet">
          <div className="hero-art-dots"><i/><i/><i/><span>KKICT GUIDE</span></div>
          <div className="hero-art-body">
            <span className="hero-art-emblem">{categoryIcons[(Number(article.categoryId || 1) - 1) % categoryIcons.length] || '▣'}</span>
            <div className="hero-art-bars"><i/><i/><i/></div>
          </div>
          <span className="hero-art-check">✓</span>
        </div>
      </div>
    </header>

    <div className="detail-layout">
      <article className={`detail-main reader-scale-${fontScale}`}>
        {currentImage ? <div className="detail-gallery-box">
          <button className="detail-image-button" onClick={() => setLightbox(true)} aria-label={t('ขยายภาพประกอบ', 'Enlarge illustration')}>
            <img className="detail-image" src={assetUrl(currentImage)} alt={`${t('ภาพประกอบ', 'Illustration')} ${article.title} (${activeImageIdx + 1}/${galleryImages.length})`}/>
            <span>🔍 {t('คลิกเพื่อดูภาพขยาย', 'Click to Enlarge')} ({activeImageIdx + 1}/{galleryImages.length})</span>
          </button>
          {galleryImages.length > 1 && <div className="detail-gallery-strip" role="region" aria-label={t('แกลเลอรีรูปภาพประกอบบทความ', 'Article image gallery')}>
            {galleryImages.map((imgPath, idx) => <button
              key={`${imgPath}-${idx}`}
              type="button"
              className={`gallery-thumb-btn${idx === activeImageIdx ? ' active' : ''}`}
              onClick={() => selectImage(idx)}
              aria-label={`${t('ดูรูปประกอบที่', 'View image')} ${idx + 1}`}
            >
              <img src={assetUrl(imgPath)} alt={`${t('รูปประกอบที่', 'Image')} ${idx + 1}`}/>
              <small>{t(`รูปที่ ${idx + 1}`, `Image ${idx + 1}`)}</small>
            </button>)}
          </div>}
        </div> : <div className="detail-placeholder" aria-label={`${t('หมวดหมู่', 'Category')} ${article.category?.categoryName}`}><span>{categoryIcons[(Number(article.categoryId || 1) - 1) % categoryIcons.length] || '▣'}</span><b>{article.category?.categoryName || t('คู่มือ ICT', 'ICT Guide')}</b></div>}

        <div id="article-intro" className="article-content">
          <div className="content-section-bar">
            <div>
              <span>📖 {t('รายละเอียดและคำอธิบายประกอบ', 'Overview & Detailed Explanation')}</span>
              <small>{t('อ่านทำความเข้าใจก่อนเริ่มปฏิบัติตามขั้นตอน', 'Read through this overview before following the step-by-step instructions.')}</small>
            </div>
            <div className="font-scale-controls" role="group" aria-label={t('ปรับขนาดตัวอักษรเนื้อหาบทความ', 'Adjust article font size')}>
              <small>{t('ขนาดตัวอักษร', 'Text Size')}</small>
              <button type="button" className={fontScale === 'normal' ? 'active' : ''} onClick={() => changeFontScale('normal')} aria-pressed={fontScale === 'normal'} title={t('ขนาดตัวอักษรปกติ', 'Normal text size')}>{t('ก', 'A')}</button>
              <button type="button" className={fontScale === 'large' ? 'active' : ''} onClick={() => changeFontScale('large')} aria-pressed={fontScale === 'large'} title={t('ขนาดตัวอักษรใหญ่', 'Large text size')}>{t('ก+', 'A+')}</button>
              <button type="button" className={fontScale === 'xlarge' ? 'active' : ''} onClick={() => changeFontScale('xlarge')} aria-pressed={fontScale === 'xlarge'} title={t('ขนาดตัวอักษรใหญ่มาก', 'Extra large text size')}>{t('ก++', 'A++')}</button>
            </div>
          </div>
          {paragraphs.map((paragraph, index) => {
            const headingMatch = paragraph.match(/^(เกริ่นนำ|ข้อควรทราบ[^\n]*|คำแนะนำ[^\n]*|สาเหตุ[^\n]*|Introduction|Important Note[^\n]*|Recommendation[^\n]*|Cause[^\n]*)\s*\n([\s\S]*)$/)
            return headingMatch ? <section key={`paragraph-${index}`} className="content-callout-block"><h2>{headingMatch[1]}</h2><p>{headingMatch[2]}</p></section> : <p key={`paragraph-${index}`}>{paragraph}</p>
          })}
        </div>

        {steps.length > 0 && <section id="article-steps" className="steps-box"><div className="steps-box-head"><div><span className="eyebrow">STEP-BY-STEP WORKFLOW</span><h2>{t('ขั้นตอนการแก้ไขปัญหาอย่างเป็นลำดับ', 'Step-by-Step Troubleshooting Instructions')}</h2></div><span className="steps-count-pill">{steps.length} {t('ขั้นตอน', 'Steps')}</span></div><ol>{steps.map((step, index) => <li key={`step-${index}`}>{typeof step === 'string' ? step.replace(/^\s*\d+[.)]\s*/, '') : step?.text || JSON.stringify(step)}</li>)}</ol></section>}

        {mediaLink && <section id="article-video" className="video-guide-box">
          <div className="video-guide-head">
            <div className="video-guide-title">
              <span className="video-emblem" aria-hidden="true">▶</span>
              <div>
                <span className="eyebrow">VIDEO & REFERENCE LINK · {mediaLink.provider}</span>
                <h2>{mediaLink.type === 'link' ? t('ลิงก์วิดีโอ / แหล่งข้อมูลประกอบบทความ', 'Accompanying Video & Reference Link') : t('วิดีโอสาธิตประกอบคู่มือ', 'Video Tutorial Guide')}</h2>
              </div>
            </div>
            <a className="download-button video-ext-btn" href={mediaLink.href} target="_blank" rel="noreferrer">↗ {t(`เปิดลิงก์บน ${mediaLink.provider}`, `Open on ${mediaLink.provider}`)}</a>
          </div>
          {(mediaLink.type === 'youtube' || mediaLink.type === 'gdrive') && <div className="video-frame-wrap">
            <iframe src={mediaLink.embedUrl} title={`${t('วิดีโอประกอบ', 'Video Tutorial')} ${article.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
          </div>}
          {mediaLink.type === 'video' && <div className="video-frame-wrap">
            <video controls preload="metadata" src={mediaLink.href}/>
          </div>}
          {mediaLink.type === 'link' && <a className="external-link-card" href={mediaLink.href} target="_blank" rel="noreferrer">
            <span className="ext-link-icon" aria-hidden="true">🔗</span>
            <div className="ext-link-copy">
              <b>{t(`คลิกเพื่อเปิดวิดีโอหรือลิงก์ข้อมูลประกอบ (${mediaLink.hostname})`, `Click to open video or reference link (${mediaLink.hostname})`)}</b>
              <small>{mediaLink.href}</small>
            </div>
            <span className="ext-link-arrow" aria-hidden="true">↗</span>
          </a>}
        </section>}

        {article.pdfFile && <section id="article-pdf" className={`pdf-banner${showPdfViewer ? ' is-expanded' : ''}`}>
          <div className="pdf-banner-top">
            <div className="pdf-banner-info">
              <span className="pdf-emblem" aria-hidden="true">PDF</span>
              <div>
                <b>{t('คู่มือฉบับสมบูรณ์พร้อมพิมพ์ (PDF A4)', 'Complete Printable Manual (A4 PDF)')}</b>
                <p>{t('กดเปิดอ่านบนหน้าเว็บนี้ได้ทันทีเหมือน E-Book หรือดาวน์โหลดเก็บไว้ในเครื่องเพื่อเปิดดูแบบออฟไลน์', 'Read directly on this page like an E-Book or download the PDF file for offline reference.')}</p>
              </div>
            </div>
            <div className="pdf-banner-actions">
              <button
                type="button"
                className={`pdf-toggle-btn${showPdfViewer ? ' active' : ''}`}
                aria-expanded={showPdfViewer}
                onClick={() => setShowPdfViewer((v) => !v)}
              >
                {showPdfViewer ? t('▴ ซ่อนหน้าต่างอ่าน PDF', '▴ Hide PDF Reader') : t('👁 เปิดอ่าน PDF บนหน้าเว็บนี้', '👁 Read PDF on This Page')}
              </button>
              <a className="print-button" href={assetUrl(article.pdfFile)} target="_blank" rel="noreferrer">↗ {t('เปิดแท็บใหม่', 'Open in New Tab')}</a>
              <a className="download-button" href={assetUrl(article.pdfFile)} download>⬇ {t('ดาวน์โหลด PDF', 'Download PDF')}</a>
            </div>
          </div>
          {showPdfViewer && <div className="pdf-viewer-shell" role="region" aria-label={t('หน้าต่างอ่านเอกสารคู่มือ PDF', 'Embedded PDF Document Reader')}>
            <div className="pdf-viewer-bar">
              <span>📄 {t('กำลังแสดงคู่มือ PDF:', 'Viewing PDF Manual:')} <b>{article.title}</b></span>
              <div className="pdf-viewer-tools">
                <a href={assetUrl(article.pdfFile)} target="_blank" rel="noreferrer">↗ {t('ขยายเต็มจอในแท็บใหม่', 'Open Full Screen in New Tab')}</a>
                <button type="button" onClick={() => setShowPdfViewer(false)}>× {t('ปิดหน้าต่างอ่าน', 'Close Reader')}</button>
              </div>
            </div>
            <iframe
              className="pdf-viewer-frame"
              src={`${assetUrl(article.pdfFile)}#view=FitH`}
              title={`${t('เอกสารคู่มือ PDF', 'PDF Manual')} ${article.title}`}
            />
          </div>}
        </section>}

        {Array.isArray(article.keywords) && article.keywords.length > 0 && <div className="article-keywords" aria-label={t('คำสำคัญของบทความ', 'Article keywords')}><b>{t('คำค้นและหัวข้อที่เกี่ยวข้อง:', 'Related Keywords & Topics:')}</b><div className="keyword-list">{(rawArticle?.keywords || article.keywords).map((rawKw, idx) => <Link key={rawKw} className="keyword-tag" to={`/search?q=${encodeURIComponent(rawKw)}`}>#{article.keywords[idx] || rawKw}</Link>)}</div></div>}

        <div id="article-feedback" className="feedback-box"><b>{t('คู่มือนี้ช่วยให้คุณแก้ปัญหาได้สำเร็จหรือไม่?', 'Was this guide helpful in solving your issue?')}</b><p className="feedback-count">{t(`มีผู้ประเมิน ${Number(feedbackCount || 0)} คน · มีประโยชน์ ${Number(helpfulCount || 0)} คน`, `${Number(feedbackCount || 0)} ratings · ${Number(helpfulCount || 0)} found this helpful`)} ({feedbackCount ? Math.round(helpfulCount * 100 / feedbackCount) : 0}%)</p>{voteValue === 'yes' || voteValue === 'no' || storedVote ? <p className="thanks">✓ {t('ขอบคุณสำหรับความคิดเห็นของคุณ เพื่อนำไปพัฒนาคู่มือต่อไป', 'Thank you for your feedback! It helps us improve our guides.')}</p> : voteValue ? <p className="feedback-error">{voteValue}</p> : <div><button disabled={sending} onClick={() => sendVote(true)}>👍 {t('มีประโยชน์ ทำตามได้จริง', 'Yes, Helpful & Clear')}</button><button disabled={sending} onClick={() => sendVote(false)}>👎 {t('ยังไม่ช่วยแก้ปัญหา', 'Not Helpful Yet')}</button></div>}</div>

        <ContactCard contact={contact.data} title={t('คู่มือนี้ยังไม่ช่วยแก้ปัญหา? ติดต่อเจ้าหน้าที่ศูนย์ ICT', 'Still need assistance? Contact Khon Kaen ICT Center Staff')} className="article-contact-card"/>

        <section className="related-section"><div className="section-heading"><div><span className="eyebrow">RELATED GUIDES</span><h2>{t('บทความที่เกี่ยวข้องในหมวดหมู่นี้', 'Related Guides in This Category')}</h2></div><Link className="text-link" to={`/articles?category=${article.categoryId}`}>{t('ดูทั้งหมดในหมวดนี้', 'View All in Category')} <b>→</b></Link></div>{relatedArticles.length ? <div className="article-grid">{relatedArticles.map((item) => <ArticleCard key={item.articleId} article={item}/>)}</div> : <Link to={`/articles?category=${article.categoryId}`}>{t('ดูบทความเพิ่มเติมในหมวดหมู่นี้ →', 'Explore more guides in this category →')}</Link>}</section>
      </article>

      <aside className="detail-aside">
        <div className="aside-card aside-master-card">
          <div className="aside-master-head">
            <span className="aside-master-icon" aria-hidden="true">{categoryIcons[(Number(article.categoryId || 1) - 1) % categoryIcons.length] || '▣'}</span>
            <div>
              <span className="eyebrow">{t('ข้อมูลคู่มือ', 'GUIDE INFO')}</span>
              <b>{t('รายละเอียดบทความ', 'Guide Summary')}</b>
            </div>
          </div>

          <div className="aside-stat-tiles">
            <div className="aside-tile">
              <small>{t('จำนวนขั้นตอน', 'Total Steps')}</small>
              <b>{steps.length} {t('ขั้นตอน', 'Steps')}</b>
            </div>
            <div className="aside-tile is-gold">
              <small>{t('จำนวนเข้าชม', 'Total Views')}</small>
              <b>{Number(article.viewCount || 0).toLocaleString('th-TH')} {t('ครั้ง', '')}</b>
            </div>
          </div>

          <div className="aside-meta-list">
            <p>{t('หมวดหมู่', 'Category')} <Link to={`/articles?category=${article.categoryId}`}>{article.category?.categoryName}</Link></p>
            <p>{t('เผยแพร่เมื่อ', 'Published')} <span>{formatDate(article.publishedAt || article.createdAt)}</span></p>
            <p>{t('แก้ไขล่าสุด', 'Updated')} <span>{formatDate(article.updatedAt)}</span></p>
          </div>

          <nav className="aside-timeline-nav" aria-label={t('สารบัญภายในบทความ', 'Table of contents')}>
            <span className="aside-nav-heading">{t('สารบัญในหน้านี้', 'ON THIS PAGE')}</span>
            <a href="#article-intro"><i/><span>{t('รายละเอียดและคำอธิบาย', 'Overview & Explanation')}</span></a>
            {steps.length > 0 && <a href="#article-steps"><i/><span>{t('ขั้นตอนการปฏิบัติ', 'Step-by-Step Guide')} ({steps.length})</span></a>}
            {mediaLink && <a href="#article-video"><i/><span>{t('วิดีโอ / ลิงก์ประกอบ', 'Video / Reference Link')}</span></a>}
            {article.pdfFile && <a href="#article-pdf"><i/><span>{t('เอกสารคู่มือ PDF', 'Printable PDF Manual')}</span></a>}
            <a href="#article-feedback"><i/><span>{t('ประเมินความพึงพอใจ', 'Rate This Guide')}</span></a>
          </nav>

          {article.pdfFile && <a className="aside-pdf-cta" href={assetUrl(article.pdfFile)} download>⬇ {t('ดาวน์โหลดคู่มือ PDF (A4)', 'Download PDF Manual (A4)')}</a>}
        </div>

        {(bookmarks.length > 0 || recentGuides.filter((item) => Number(item.articleId) !== Number(article.articleId)).length > 0) && <div className="aside-card aside-history-card">
          {bookmarks.length > 0 && <div className="aside-history-group">
            <div className="aside-history-head">
              <b>★ {t('คู่มือที่บันทึกไว้', 'Saved Guides')} ({bookmarks.length})</b>
              <Link to="/articles?saved=1">{t('ดูทั้งหมด', 'All')}</Link>
            </div>
            <ul className="aside-history-list">
              {bookmarks.slice(0, 4).map((rawItem) => {
                const item = translateArticle(rawItem)
                return <li key={`aside-saved-${item.articleId}`}>
                  <Link to={`/articles/${item.articleId}`} className={Number(item.articleId) === Number(article.articleId) ? 'is-current' : ''}>{item.title}</Link>
                </li>
              })}
            </ul>
          </div>}
          {recentGuides.filter((item) => Number(item.articleId) !== Number(article.articleId)).length > 0 && <div className="aside-history-group">
            <div className="aside-history-head">
              <b>◷ {t('เปิดอ่านล่าสุด', 'Recently Viewed')}</b>
            </div>
            <ul className="aside-history-list">
              {recentGuides.filter((item) => Number(item.articleId) !== Number(article.articleId)).slice(0, 4).map((rawItem) => {
                const item = translateArticle(rawItem)
                return <li key={`aside-recent-${item.articleId}`}>
                  <Link to={`/articles/${item.articleId}`}>{item.title}</Link>
                </li>
              })}
            </ul>
          </div>}
        </div>}

        {quickHelpHref && <a className="aside-support-pill" href={quickHelpHref}>
          <span className="support-pill-icon" aria-hidden="true">☎</span>
          <div>
            <b>{t('ติดปัญหา สอบถามเจ้าหน้าที่', 'Need Help? Contact ICT Staff')}</b>
            <small>{contact.data?.phone ? t(`โทร ${contact.data.phone} · ศูนย์ ICT ขอนแก่น`, `Call ${contact.data.phone} · Khon Kaen ICT Center`) : t('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT ขอนแก่น', 'Khon Kaen Municipality ICT Learning Center')}</small>
          </div>
          <span className="support-pill-arrow" aria-hidden="true">→</span>
        </a>}
      </aside>
    </div>
    {lightbox && currentImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={t('ภาพประกอบขนาดใหญ่', 'Full-size illustration')} onClick={() => setLightbox(false)}>
      <button className="lightbox-close" onClick={() => setLightbox(false)} aria-label={t('ปิดภาพ', 'Close image')}>×</button>
      {galleryImages.length > 1 && <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label={t('รูปก่อนหน้า', 'Previous image')}
        onClick={(e) => { e.stopPropagation(); selectImage((activeImageIdx - 1 + galleryImages.length) % galleryImages.length) }}
      >‹</button>}
      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <img src={assetUrl(currentImage)} alt={`${t('ภาพประกอบ', 'Illustration')} ${article.title} (${activeImageIdx + 1}/${galleryImages.length})`}/>
        {galleryImages.length > 1 && <div className="lightbox-caption">{t(`รูปที่ ${activeImageIdx + 1} จาก ${galleryImages.length}`, `Image ${activeImageIdx + 1} of ${galleryImages.length}`)}</div>}
      </div>
      {galleryImages.length > 1 && <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label={t('รูปถัดไป', 'Next image')}
        onClick={(e) => { e.stopPropagation(); selectImage((activeImageIdx + 1) % galleryImages.length) }}
      >›</button>}
    </div>}
  </main>
}

function PublicLayout() { return <><Header/><Outlet/><Footer/></> }

function App() {
  return <LanguageProvider><SavedGuidesProvider><Routes>
    <Route path="/admin/login" element={<AdminLoginPage/>}/>
    <Route path="/admin" element={<AdminPage/>}>
      <Route index element={<AdminHome/>}/>
      <Route path="articles" element={<ArticleList/>}/>
      <Route path="articles/new" element={<ArticleEditor/>}/>
      <Route path="articles/:id/edit" element={<ArticleEditor/>}/>
      <Route path="categories" element={<CategoryManager/>}/>
      <Route path="settings" element={<ContactSettings/>}/>
      <Route path="*" element={<AdminHome/>}/>
    </Route>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/articles" element={<ArticlesPage/>}/>
      <Route path="/search" element={<ArticlesPage search/>}/>
      <Route path="/articles/:id" element={<ArticlePage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>
    </Route>
  </Routes></SavedGuidesProvider></LanguageProvider>
}

export default App
