import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, assetUrl, parseMediaLink, useDocumentTitle } from '../services/api'
import { LanguageSwitch, useLang } from '../i18n'

function useAdminData(path, refresh = 0) {
  const [response, setResponse] = useState({ path: '', refresh: -1, data: null, error: '' })
  useEffect(() => {
    if (!path) return undefined
    let active = true
    api.get(path).then((data) => { if (active) setResponse({ path, refresh, data, error: '' }) }).catch((error) => { if (active) setResponse({ path, refresh, data: null, error: error.message }) })
    return () => { active = false }
  }, [path, refresh])
  const current = response.path === path && response.refresh === refresh
  return { data: current ? response.data : null, error: current ? response.error : '', loading: !current }
}

const statusLabel = { DRAFT: 'ฉบับร่าง', PUBLISHED: 'เผยแพร่แล้ว', HIDDEN: 'ซ่อนอยู่' }
const dateLabel = (value) => value ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value)) : '—'
const contactFields = [
  ['phone', 'เบอร์โทรศัพท์'],
  ['lineId', 'ไอดี LINE'],
  ['lineUrl', 'ลิงก์ LINE'],
  ['email', 'อีเมล'],
  ['location', 'ที่ตั้งศูนย์ ICT'],
  ['hours', 'เวลาทำการ'],
]
const emptyContact = { phone: '', lineId: '', lineUrl: '', email: '', location: '', hours: '', note: '' }

function StatusBadge({ status }) { return <span className={`status-badge status-${status?.toLowerCase()}`}>{statusLabel[status] || status}</span> }
function Alert({ type = 'error', children }) { return children ? <div className={`admin-alert admin-alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div> : null }

function DailyViewsChart({ rows }) {
  const width = 760
  const height = 220
  const padLeft = 44
  const padRight = 20
  const padTop = 18
  const padBottom = 30
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom
  const maximum = Math.max(4, ...rows.map((row) => row.views))
  const niceMax = Math.ceil(maximum / 4) * 4
  const coordinates = rows.map((row, index) => {
    const x = padLeft + (rows.length > 1 ? index * plotWidth / (rows.length - 1) : plotWidth / 2)
    const y = padTop + plotHeight - (row.views / niceMax) * plotHeight
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), ...row }
  })
  const total = rows.reduce((sum, row) => sum + row.views, 0)
  const average = rows.length ? Math.round(total / rows.length) : 0
  const peak = rows.reduce((best, row) => (row.views > (best?.views ?? -1) ? row : best), null)
  const baselineY = padTop + plotHeight
  const linePoints = coordinates.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaPoints = coordinates.length
    ? `${coordinates[0].x},${baselineY} ${linePoints} ${coordinates.at(-1).x},${baselineY}`
    : ''
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(niceMax * ratio),
    y: Number((baselineY - ratio * plotHeight).toFixed(1)),
  }))
  return <div className="insights-chart-wrap">
    <svg className="insights-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`กราฟยอดเข้าชมรวม ${total.toLocaleString('th-TH')} ครั้ง ใน ${rows.length} วัน`}>
      <title>{`ยอดเข้าชมรายวัน ${rows.length} วัน รวม ${total.toLocaleString('th-TH')} ครั้ง`}</title>
      <defs>
        <linearGradient id="ict-views-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" stopOpacity="0.34"/>
          <stop offset="65%" stopColor="#06b6d4" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"/>
        </linearGradient>
        <linearGradient id="ict-views-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0b5d74"/>
          <stop offset="55%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      {ticks.map((tick) => <g key={tick.value}>
        <line x1={padLeft} y1={tick.y} x2={width - padRight} y2={tick.y} className={tick.value === 0 ? 'insights-chart-axis' : 'insights-chart-grid'}/>
        <text x={padLeft - 10} y={tick.y + 4} textAnchor="end" className="insights-chart-tick">{tick.value}</text>
      </g>)}
      {areaPoints && <polygon points={areaPoints} className="insights-chart-area"/>}
      <polyline points={linePoints} className="insights-chart-line"/>
      {coordinates.map((row) => <circle key={row.day} cx={row.x} cy={row.y} r={peak?.day === row.day && row.views > 0 ? '5.5' : '4'} className={`insights-chart-point${peak?.day === row.day && row.views > 0 ? ' is-peak' : ''}`}><title>{`${row.day}: ${row.views.toLocaleString('th-TH')} ครั้ง`}</title></circle>)}
    </svg>
    <div className="insights-chart-summary">
      <span>{dateLabel(rows[0]?.day)} – {dateLabel(rows.at(-1)?.day)}</span>
      <div className="insights-inline-stats">
        <span>รวมช่วงนี้ <b>{total.toLocaleString('th-TH')} ครั้ง</b></span>
        <span>เฉลี่ย <b>{average.toLocaleString('th-TH')} ครั้ง/วัน</b></span>
        {peak?.views > 0 && <span>สูงสุด <b>{peak.views.toLocaleString('th-TH')} ครั้ง</b> ({dateLabel(peak.day)})</span>}
      </div>
    </div>
  </div>
}

export function ContactSettings() {
  const { data, loading, error } = useAdminData('/settings/contact')
  const [tab, setTab] = useState('contact')
  const [draft, setDraft] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const form = draft || data || emptyContact
  useDocumentTitle('ตั้งค่า · ระบบเจ้าหน้าที่')

  function setField(field) {
    return (event) => setDraft((current) => ({ ...(current || data || emptyContact), [field]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setNotice('')
    setActionError('')
    const emailPattern = /^[A-Z0-9._%+-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i
    if (form.email && !emailPattern.test(form.email.trim())) return setActionError('รูปแบบอีเมลไม่ถูกต้อง')
    if (form.lineUrl && !/^https:\/\//i.test(form.lineUrl.trim())) return setActionError('ลิงก์ LINE ต้องขึ้นต้นด้วย https://')
    setBusy(true)
    try {
      await api.put('/admin/settings/contact', Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])))
      setNotice('บันทึกข้อมูลติดต่อเรียบร้อยแล้ว')
    } catch (err) { setActionError(err.message) }
    finally { setBusy(false) }
  }

  return <section className="admin-content">
    <div className="admin-title-row"><div><span className="eyebrow">SYSTEM SETTINGS</span><h1>ตั้งค่าระบบและบัญชีเจ้าหน้าที่</h1><p className="admin-muted">จัดการข้อมูลติดต่อของศูนย์ ICT และตั้งค่ารหัสผ่านสำหรับเจ้าหน้าที่</p></div></div>
    <div className="admin-filter-row"><div className="admin-tabs"><button type="button" className={tab === 'contact' ? 'active' : ''} onClick={() => setTab('contact')}>ข้อมูลติดต่อศูนย์ ICT</button><button type="button" className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>รหัสผ่านและความปลอดภัย</button></div></div>
    {tab === 'contact' ? <>
      <Alert type="success">{notice}</Alert><Alert>{actionError || error}</Alert>
      {loading ? <p className="admin-loading">กำลังโหลดข้อมูลติดต่อ...</p> : <form className="admin-form contact-settings-form" onSubmit={submit}>
        <div className="admin-form-grid">{contactFields.map(([field, label]) => <label key={field}>{label}<input type="text" maxLength={300} value={form[field]} onChange={setField(field)} placeholder={`ระบุ${label}`}/></label>)}</div>
        <label>หมายเหตุ <small>ไม่เกิน 300 ตัวอักษร</small><textarea rows={3} maxLength={300} value={form.note} onChange={setField('note')} placeholder="ข้อมูลเพิ่มเติมสำหรับผู้ติดต่อ"/></label>
        <div className="admin-form-actions"><button className="admin-primary-link" disabled={busy || Boolean(error)}>{busy ? 'กำลังบันทึก...' : 'บันทึกข้อมูลติดต่อ'}</button></div>
      </form>}
    </> : <PasswordSettings/>}
  </section>
}

function PasswordSettings() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const setField = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setNotice('')
    setActionError('')
    if (form.newPassword.length < 12) return setActionError('รหัสผ่านใหม่ต้องมีอย่างน้อย 12 ตัวอักษร')
    if (form.newPassword !== form.confirmPassword) return setActionError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน')
    setBusy(true)
    try {
      const result = await api.put('/auth/password', { newPassword: form.newPassword })
      setNotice(result.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
      setForm({ newPassword: '', confirmPassword: '' })
    } catch (err) { setActionError(err.message) }
    finally { setBusy(false) }
  }

  return <form className="admin-form password-settings-form" onSubmit={submit}>
    <div className="password-card-head">
      <div>
        <h2>ตั้งรหัสผ่านใหม่ของเจ้าหน้าที่</h2>
        <p className="admin-muted">คุณเข้าสู่ระบบในฐานะเจ้าหน้าที่แล้ว สามารถกำหนดรหัสผ่านใหม่ (12–200 ตัวอักษร) ได้ทันทีโดยไม่ต้องกรอกรหัสเดิม</p>
      </div>
      <button type="button" className="admin-secondary-link" onClick={() => setShowPass((v) => !v)}>{showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}</button>
    </div>
    <Alert type="success">{notice}</Alert><Alert>{actionError}</Alert>
    <div className="admin-form-grid">
      <label>รหัสผ่านใหม่ <small>({form.newPassword.length}/12 ตัวอักษรขั้นต่ำ)</small><input type={showPass ? 'text' : 'password'} autoComplete="new-password" required minLength={12} maxLength={200} value={form.newPassword} onChange={setField('newPassword')} placeholder="กรอกรหัสผ่านใหม่ 12 ตัวอักษรขึ้นไป"/></label>
      <label>ยืนยันรหัสผ่านใหม่ <small>{form.confirmPassword && (form.newPassword === form.confirmPassword ? '✓ รหัสผ่านตรงกัน' : '× รหัสผ่านยังไม่ตรงกัน')}</small><input type={showPass ? 'text' : 'password'} autoComplete="new-password" required minLength={12} maxLength={200} value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"/></label>
    </div>
    <div className="admin-form-actions"><button className="admin-primary-link" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}</button></div>
  </form>
}

const MONTHLY_PREVIEW_COUNT = 5
const TERM_PREVIEW_COUNT = 5

function ShowMoreButton({ expanded, hiddenCount, onToggle, unit = 'รายการ' }) {
  if (!expanded && hiddenCount <= 0) return null
  return <button type="button" className="show-more-btn" aria-expanded={expanded} onClick={onToggle}>
    {expanded ? <>ย่อรายการ <span aria-hidden="true">▴</span></> : <>ดูเพิ่มเติมอีก {hiddenCount.toLocaleString('th-TH')} {unit} <span aria-hidden="true">▾</span></>}
  </button>
}

function DashSectionTitle({ icon, title, hint, children }) {
  return <div className="dash-section-head">
    <div className="dash-section-title">
      <span className="dash-section-icon" aria-hidden="true">{icon}</span>
      <div>
        <h2>{title}</h2>
        {hint && <p>{hint}</p>}
      </div>
    </div>
    {children && <div className="dash-section-actions">{children}</div>}
  </div>
}

export function AdminHome() {
  const [refresh, setRefresh] = useState(0)
  const { data, loading, error } = useAdminData('/admin/dashboard', refresh)
  const [insightDays, setInsightDays] = useState(30)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [expandedMonth, setExpandedMonth] = useState('')
  const [expandedTerms, setExpandedTerms] = useState({ zero: false, top: false })
  const [overviewTab, setOverviewTab] = useState('popular')
  const insights = useAdminData(`/admin/insights?days=${insightDays}`, refresh)
  const monthly = useAdminData(`/admin/reports/monthly${selectedMonth ? `?month=${encodeURIComponent(selectedMonth)}` : ''}`, refresh)
  const [actionError, setActionError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const dashboard = data || {}
  const monthlyData = monthly.data || null
  const activeMonth = selectedMonth || monthlyData?.month || ''
  useDocumentTitle('ภาพรวม · ระบบเจ้าหน้าที่')

  async function publishNow(article) {
    setActionError('')
    setActionNotice('')
    try {
      await api.patch(`/admin/articles/${article.articleId}/status`, { status: 'PUBLISHED' })
      setActionNotice(`เผยแพร่ “${article.title}” แล้ว`)
      setRefresh((value) => value + 1)
    } catch (err) { setActionError(err.message) }
  }
  async function exportCsv() {
    setActionError('')
    try { await api.download('/admin/reports/articles.csv', 'รายงานคลังความรู้ทั้งหมด.csv') }
    catch (err) { setActionError(err.message) }
  }
  async function exportMonthlyCsv() {
    setActionError('')
    const monthQuery = activeMonth ? `?month=${encodeURIComponent(activeMonth)}` : ''
    const fileLabel = activeMonth || 'ประจำเดือน'
    try { await api.download(`/admin/reports/monthly.csv${monthQuery}`, `รายงานสรุปประจำเดือน-${fileLabel}.csv`) }
    catch (err) { setActionError(err.message) }
  }
  async function removeSearchTerm(term) {
    if (!term || !window.confirm(`ต้องการลบประวัติคำค้นหา “${term}” ออกจากสถิติใช่หรือไม่?`)) return
    setActionError('')
    setActionNotice('')
    try {
      const res = await api.delete(`/admin/search-logs?term=${encodeURIComponent(term)}`)
      setActionNotice(res.message || `ลบคำค้นหา “${term}” แล้ว`)
      setRefresh((value) => value + 1)
    } catch (err) { setActionError(err.message) }
  }

  const categoryRows = dashboard.categories || []
  const maxCategoryCount = Math.max(1, ...categoryRows.map((category) => category._count?.articles || 0))
  const totalCategoryArticles = Math.max(1, categoryRows.reduce((sum, category) => sum + (category._count?.articles || 0), 0))
  const topTerms = insights.data?.topTerms || []
  const zeroTerms = insights.data?.zeroResultTerms || []
  const maxTopTermCount = Math.max(1, ...topTerms.map((item) => item.count || 0))
  const draftCount = dashboard.pendingDrafts?.length || 0
  const negativeCount = dashboard.negativeFeedback?.length || 0
  const pendingCount = draftCount + negativeCount

  const monthArticles = monthlyData?.articlesInMonth || []
  const monthExpanded = expandedMonth === activeMonth && activeMonth !== ''
  const visibleMonthArticles = monthExpanded ? monthArticles : monthArticles.slice(0, MONTHLY_PREVIEW_COUNT)
  const visibleZeroTerms = expandedTerms.zero ? zeroTerms : zeroTerms.slice(0, TERM_PREVIEW_COUNT)
  const visibleTopTerms = expandedTerms.top ? topTerms : topTerms.slice(0, TERM_PREVIEW_COUNT)

  function toggleMonthList() {
    if (monthExpanded) {
      setExpandedMonth('')
      document.getElementById('monthly-article-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      setExpandedMonth(activeMonth)
    }
  }

  return <section className="admin-content admin-dashboard dash-simple">
    <div className="dash-hero">
      <div>
        <span className="dash-hero-kicker">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น</span>
        <h1>ภาพรวมคลังความรู้</h1>
        <p>ดูตัวเลขสำคัญ รายงานประจำเดือน และสิ่งที่ควรทำต่อ ได้ในหน้าเดียว</p>
      </div>
      <div className="dash-hero-actions">
        <Link className="admin-primary-link" to="/admin/articles/new">＋ เขียนบทความใหม่</Link>
        <button type="button" className="admin-secondary-link" onClick={exportCsv}>⇣ ส่งออกบทความทั้งหมด (CSV)</button>
      </div>
    </div>

    <Alert type="success">{actionNotice}</Alert>
    <Alert>{error || actionError}</Alert>

    {loading ? <p className="admin-loading">กำลังโหลดข้อมูล...</p> : <>
      <div className="dash-kpi-grid">
        <div className="dash-kpi is-green">
          <span className="dash-kpi-icon" aria-hidden="true">✓</span>
          <div>
            <small>บทความที่เผยแพร่</small>
            <b>{Number(dashboard.publishedCount || 0).toLocaleString('th-TH')}</b>
            <p>จากทั้งหมด {Number(dashboard.articleCount || 0).toLocaleString('th-TH')} บทความ</p>
          </div>
        </div>
        <div className="dash-kpi is-blue">
          <span className="dash-kpi-icon" aria-hidden="true">◉</span>
          <div>
            <small>ยอดเข้าชมสะสม</small>
            <b>{Number(dashboard.totalViews || 0).toLocaleString('th-TH')}</b>
            <p>ครั้งที่มีผู้เปิดอ่านคู่มือ</p>
          </div>
        </div>
        <div className="dash-kpi is-gold">
          <span className="dash-kpi-icon" aria-hidden="true">★</span>
          <div>
            <small>ความพึงพอใจ</small>
            <b>{Number(dashboard.helpfulPercent || 0)}%</b>
            <p>มีประโยชน์ {dashboard.helpfulCount || 0} จาก {dashboard.feedbackCount || 0} โหวต</p>
          </div>
        </div>
        <div className="dash-kpi is-purple">
          <span className="dash-kpi-icon" aria-hidden="true">▣</span>
          <div>
            <small>หมวดหมู่ความรู้</small>
            <b>{Number(dashboard.categoryCount || 0).toLocaleString('th-TH')}</b>
            <p>ฉบับร่าง/ซ่อน {Number(dashboard.draftCount || 0) + Number(dashboard.hiddenCount || 0)} บทความ</p>
          </div>
        </div>
      </div>

      {pendingCount > 0 && <div className="dash-todo-banner" role="status">
        <span className="dash-todo-icon" aria-hidden="true">!</span>
        <div>
          <b>สิ่งที่ควรทำต่อ</b>
          <p>
            {draftCount > 0 && <>มีฉบับร่างรอเผยแพร่ <strong>{draftCount}</strong> บทความ</>}
            {draftCount > 0 && negativeCount > 0 && ' · '}
            {negativeCount > 0 && <>มีบทความที่ผู้อ่านแจ้งว่ายังไม่ช่วยแก้ปัญหา <strong>{negativeCount}</strong> บทความ</>}
          </p>
        </div>
        <button type="button" className="admin-secondary-link" onClick={() => { setOverviewTab('activity'); document.getElementById('dash-overview-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>ดูรายการ →</button>
      </div>}

      <div className="dashboard-panel dash-card monthly-report-panel">
        <DashSectionTitle icon="📅" title="รายงานประจำเดือน" hint="เลือกเดือนเพื่อดูผลงาน และดาวน์โหลดไฟล์ไปทำรายงานส่งหัวหน้าได้ทันที">
          <label className="dash-select">
            <span>เดือน</span>
            <select aria-label="เลือกเดือนและปีของรายงานประจำเดือน" value={activeMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
              {(monthlyData?.availableMonths || []).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
          <button type="button" className="admin-primary-link" onClick={exportMonthlyCsv}>⇣ ดาวน์โหลดรายงาน (CSV)</button>
        </DashSectionTitle>

        {monthly.loading ? <p className="dashboard-empty">กำลังโหลดรายงานประจำเดือน...</p> : monthly.error ? <p className="dashboard-empty" role="alert">{monthly.error}</p> : monthlyData && <>
          <div className="dash-month-stats">
            <div>
              <small>เผยแพร่ในเดือนนี้</small>
              <b>{Number(monthlyData.summary.publishedInMonthCount || 0).toLocaleString('th-TH')} <span>บทความ</span></b>
            </div>
            <div className="is-accent">
              <small>ยอดเข้าชมในเดือนนี้</small>
              <b>{Number(monthlyData.summary.totalViewsInMonth || 0).toLocaleString('th-TH')} <span>ครั้ง</span></b>
            </div>
            <div>
              <small>การค้นหาในเดือนนี้</small>
              <b>{Number(monthlyData.summary.searchesInMonthCount || 0).toLocaleString('th-TH')} <span>ครั้ง</span></b>
            </div>
            <div>
              <small>ความพึงพอใจในเดือนนี้</small>
              <b>{monthlyData.summary.satisfactionPercentInMonth}% <span>({monthlyData.summary.feedbackHelpfulInMonth}/{monthlyData.summary.feedbackTotalInMonth} โหวต)</span></b>
            </div>
          </div>

          <div id="monthly-article-list" className="dash-list-block">
            <div className="dash-list-head">
              <h3>บทความที่สร้าง/เผยแพร่ในเดือน {monthlyData.monthLabel}</h3>
              <span className="panel-pill">{monthArticles.length.toLocaleString('th-TH')} บทความ</span>
            </div>
            {monthArticles.length ? <>
              <ol className="dash-article-list">
                {visibleMonthArticles.map((item, index) => <li key={item.articleId} className="dash-article-row">
                  <span className="dash-row-num">{index + 1}</span>
                  <div className="dash-row-main">
                    <Link className="dash-row-title" to={`/admin/articles/${item.articleId}/edit`} title={item.title}>{item.title}</Link>
                    <div className="dash-row-meta">
                      <StatusBadge status={item.status}/>
                      <span className="category-chip">{item.categoryName}</span>
                      <span>{dateLabel(item.publishedAt || item.createdAt)}</span>
                      {item.imageCount > 0 && <span title="รูปภาพประกอบ">🖼 {item.imageCount}</span>}
                      {item.hasPdf && <span title="มีไฟล์ PDF">PDF</span>}
                      {item.hasVideo && <span title="มีวิดีโอ/ลิงก์">🎬</span>}
                    </div>
                  </div>
                  <div className="dash-row-views">
                    <b>{Number(item.monthViews || 0).toLocaleString('th-TH')}</b>
                    <small>วิวเดือนนี้</small>
                  </div>
                  <div className="dash-row-actions">
                    <Link to={`/articles/${item.articleId}?preview=1`} target="_blank" rel="opener">ดู</Link>
                    <Link to={`/admin/articles/${item.articleId}/edit`}>แก้ไข</Link>
                  </div>
                </li>)}
              </ol>
              <ShowMoreButton expanded={monthExpanded} hiddenCount={monthArticles.length - MONTHLY_PREVIEW_COUNT} onToggle={toggleMonthList} unit="บทความ"/>
            </> : <p className="dashboard-empty">ไม่มีบทความที่สร้างหรือเผยแพร่ในเดือนนี้ ลองเลือกเดือนอื่นจากตัวเลือกด้านบน</p>}
          </div>
        </>}
      </div>

      <div className="dashboard-panel dash-card">
        <DashSectionTitle icon="📈" title={`ยอดเข้าชม ${insightDays} วันล่าสุด`} hint="จำนวนครั้งที่มีผู้เปิดอ่านคู่มือในแต่ละวัน">
          <label className="dash-select">
            <span>ช่วงเวลา</span>
            <select aria-label="เลือกช่วงเวลาสถิติยอดเข้าชม" value={insightDays} onChange={(event) => setInsightDays(Number(event.target.value))}>
              <option value={7}>7 วันล่าสุด</option>
              <option value={30}>30 วันล่าสุด</option>
              <option value={90}>90 วันล่าสุด</option>
            </select>
          </label>
        </DashSectionTitle>
        {insights.loading ? <p className="dashboard-empty">กำลังโหลดสถิติยอดเข้าชม...</p> : insights.error ? <p className="dashboard-empty" role="alert">{insights.error}</p> : insights.data?.viewsByDay?.length ? <DailyViewsChart rows={insights.data.viewsByDay}/> : <p className="dashboard-empty">ยังไม่มีข้อมูลยอดเข้าชม</p>}
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel dash-card">
          <DashSectionTitle icon="🔍" title="คำค้นที่หาไม่เจอ" hint="ผู้ใช้ค้นแล้วไม่พบคู่มือ — ควรเขียนคู่มือเพิ่ม"/>
          {insights.loading ? <p className="dashboard-empty">กำลังโหลดสถิติคำค้น...</p> : insights.error ? <p className="dashboard-empty" role="alert">{insights.error}</p> : zeroTerms.length ? <>
            <ul className="dash-term-list">
              {visibleZeroTerms.map((item) => <li key={item.term} className="dash-term-row">
                <div className="dash-term-main">
                  <b>“{item.term}”</b>
                  <small>ค้นหา {item.count.toLocaleString('th-TH')} ครั้ง · ล่าสุด {dateLabel(item.lastSearched)}</small>
                </div>
                <div className="term-row-actions">
                  <Link className="write-guide-btn" to={`/admin/articles/new?title=${encodeURIComponent(item.term)}`}>＋ เขียนคู่มือ</Link>
                  <button type="button" className="danger-action delete-term-btn" onClick={() => removeSearchTerm(item.term)} aria-label={`ลบคำค้นหา ${item.term}`}>ลบ</button>
                </div>
              </li>)}
            </ul>
            <ShowMoreButton expanded={expandedTerms.zero} hiddenCount={zeroTerms.length - TERM_PREVIEW_COUNT} onToggle={() => setExpandedTerms((v) => ({ ...v, zero: !v.zero }))} unit="คำ"/>
          </> : <p className="dashboard-empty">ยังไม่มีคำค้นที่ไม่พบผลลัพธ์ 🎉</p>}
        </div>

        <div className="dashboard-panel dash-card">
          <DashSectionTitle icon="🔥" title="คำค้นยอดนิยม" hint={`คำที่ผู้ใช้ค้นหาบ่อยที่สุดใน ${insightDays} วันล่าสุด`}/>
          {insights.loading ? <p className="dashboard-empty">กำลังโหลดคำค้นยอดนิยม...</p> : insights.error ? <p className="dashboard-empty" role="alert">{insights.error}</p> : topTerms.length ? <>
            <ul className="dash-term-list">
              {visibleTopTerms.map((item, idx) => <li key={item.term} className="dash-term-row">
                <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                <div className="dash-term-main">
                  <b>{item.term}</b>
                  <div className="dash-term-bar"><span style={{ width: `${Math.max(8, Math.round(item.count * 100 / maxTopTermCount))}%` }}/></div>
                </div>
                <span className="dash-term-count">{item.count.toLocaleString('th-TH')} ครั้ง</span>
                <button type="button" className="danger-action delete-term-btn" onClick={() => removeSearchTerm(item.term)} aria-label={`ลบคำค้นหา ${item.term}`}>ลบ</button>
              </li>)}
            </ul>
            <ShowMoreButton expanded={expandedTerms.top} hiddenCount={topTerms.length - TERM_PREVIEW_COUNT} onToggle={() => setExpandedTerms((v) => ({ ...v, top: !v.top }))} unit="คำ"/>
          </> : <p className="dashboard-empty">ยังไม่มีข้อมูลคำค้น</p>}
        </div>
      </div>

      <div id="dash-overview-tabs" className="dashboard-panel dash-card dashboard-tabbed-panel">
        <div className="dashboard-panel-heading dashboard-tabs-head">
          <div className="admin-tabs" role="tablist" aria-label="ข้อมูลสรุปคลังความรู้">
            <button type="button" role="tab" aria-selected={overviewTab === 'popular'} className={overviewTab === 'popular' ? 'active' : ''} onClick={() => setOverviewTab('popular')}>🏆 บทความยอดนิยม</button>
            <button type="button" role="tab" aria-selected={overviewTab === 'categories'} className={overviewTab === 'categories' ? 'active' : ''} onClick={() => setOverviewTab('categories')}>▣ ตามหมวดหมู่</button>
            <button type="button" role="tab" aria-selected={overviewTab === 'activity'} className={overviewTab === 'activity' ? 'active' : ''} onClick={() => setOverviewTab('activity')}>📝 งานรอจัดการ {pendingCount > 0 && <span className="tab-count-badge">{pendingCount}</span>}</button>
          </div>
          <Link to={overviewTab === 'categories' ? '/admin/categories' : '/admin/articles'}>{overviewTab === 'categories' ? 'จัดการหมวดหมู่ →' : 'จัดการบทความทั้งหมด →'}</Link>
        </div>

        {overviewTab === 'popular' && ((dashboard.topArticles || []).length ? <ol className="dash-article-list">
          {(dashboard.topArticles || []).map((article, index) => <li key={article.articleId} className="dash-article-row">
            <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
            <div className="dash-row-main">
              <Link className="dash-row-title" to={`/admin/articles/${article.articleId}/edit`} title={article.title}>{article.title}</Link>
              <div className="dash-row-meta">
                <span className="category-chip">{article.category?.categoryName || '—'}</span>
                <span>{article.feedbackCount ? `พึงพอใจ ${article.helpfulPercent}% (${article.helpfulCount}/${article.feedbackCount})` : 'ยังไม่มีผลประเมิน'}</span>
              </div>
            </div>
            <div className="dash-row-views">
              <b>{Number(article.viewCount || 0).toLocaleString('th-TH')}</b>
              <small>วิวสะสม</small>
            </div>
            <div className="dash-row-actions">
              <Link to={`/articles/${article.articleId}?preview=1`} target="_blank" rel="opener">ดู</Link>
              <Link to={`/admin/articles/${article.articleId}/edit`}>แก้ไข</Link>
            </div>
          </li>)}
        </ol> : <div className="dashboard-empty">ยังไม่มีบทความเผยแพร่</div>)}

        {overviewTab === 'categories' && <ul className="dash-category-list">
          {categoryRows.map((category) => {
            const count = category._count?.articles || 0
            const share = Math.round(count * 100 / totalCategoryArticles)
            return <li key={category.categoryId} className="dash-category-row">
              <div className="dash-category-main">
                <Link to={`/admin/articles?category=${category.categoryId}`}><b>{category.categoryName}</b></Link>
                <small>{count} บทความ · เข้าชม {Number(category.totalViews || 0).toLocaleString('th-TH')} ครั้ง</small>
              </div>
              <div className="dash-category-bar"><span style={{ width: `${Math.round(count * 100 / maxCategoryCount)}%` }}/></div>
              <span className="dash-category-share">{share}%</span>
            </li>
          })}
        </ul>}

        {overviewTab === 'activity' && <div className="dashboard-columns dashboard-activity-grid">
          <div>
            <h3 className="subpanel-title">ฉบับร่างรอเผยแพร่</h3>
            {draftCount ? <div className="recent-article-list">
              {(dashboard.pendingDrafts || []).map((article) => <div className="recent-article-row" key={`draft-${article.articleId}`}><Link to={`/admin/articles/${article.articleId}/edit`}><span>{article.title}</span><small><StatusBadge status="DRAFT"/> · {article.category?.categoryName || '—'} · {dateLabel(article.updatedAt)}</small></Link><button onClick={() => publishNow(article)}>เผยแพร่ทันที</button></div>)}
            </div> : <p className="dashboard-empty">ไม่มีฉบับร่างค้าง ✓</p>}
          </div>
          <div>
            <h3 className="subpanel-title">บทความที่ผู้อ่านแจ้งว่ายังไม่ช่วย</h3>
            {negativeCount ? <div className="recent-article-list">
              {(dashboard.negativeFeedback || []).map((article) => <Link key={`fb-${article.articleId}`} to={`/admin/articles/${article.articleId}/edit`}><span>{article.title}</span><small>👎 ไม่ช่วย {article.notHelpfulCount} · 👍 มีประโยชน์ {article.helpfulCount}</small></Link>)}
            </div> : <p className="dashboard-empty">ไม่มีข้อเสนอแนะเชิงลบ ✓</p>}
            <h3 className="subpanel-title dash-subpanel-gap">อัปเดตล่าสุด</h3>
            <div className="recent-article-list">{(dashboard.recentArticles || []).map((article) => <div className="recent-article-row" key={article.articleId}><Link to={`/admin/articles/${article.articleId}/edit`}><span>{article.title}</span><small><StatusBadge status={article.status}/> · {dateLabel(article.updatedAt)}</small></Link></div>)}</div>
          </div>
        </div>}
      </div>
    </>}
  </section>
}

export function ArticleList() {
  const location = useLocation()
  const [status, setStatus] = useState('ALL')
  const [categoryId, setCategoryId] = useState(() => new URLSearchParams(location.search).get('category') || '')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [refresh, setRefresh] = useState(0)
  const categoriesData = useAdminData('/admin/categories')
  const filterParams = new URLSearchParams()
  if (status !== 'ALL') filterParams.set('status', status)
  if (categoryId) filterParams.set('category', categoryId)
  if (query.trim()) filterParams.set('q', query.trim())
  const path = `/admin/articles${filterParams.size ? `?${filterParams}` : ''}`
  const { data: articles, loading, error } = useAdminData(path, refresh)
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [actionError, setActionError] = useState('')
  useDocumentTitle('จัดการบทความ · ระบบเจ้าหน้าที่')

  const allArticles = articles || []
  const totalCount = allArticles.length
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize
  const pagedArticles = allArticles.slice(startIndex, startIndex + pageSize)

  async function setArticleStatus(article, nextStatus) {
    setActionError('')
    try { await api.patch(`/admin/articles/${article.articleId}/status`, { status: nextStatus }); setNotice(`เปลี่ยนสถานะ “${article.title}” แล้ว`); setRefresh((value) => value + 1) }
    catch (err) { setActionError(err.message) }
  }
  async function removeArticle(article) {
    if (!window.confirm(`ลบบทความ “${article.title}” ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`)) return
    setActionError('')
    try { await api.delete(`/admin/articles/${article.articleId}`); setNotice('ลบบทความแล้ว'); setRefresh((value) => value + 1) }
    catch (err) { setActionError(err.message) }
  }

  return <section className="admin-content"><div className="admin-title-row"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h1>จัดการบทความ</h1><p className="admin-muted">ดูแลบทความ คู่มือ และสถานะการเผยแพร่</p></div><Link className="admin-primary-link" to="/admin/articles/new">＋ เพิ่มบทความ</Link></div><Alert type="success">{notice}</Alert><Alert>{actionError || error}</Alert>
    <div className="admin-filter-row"><div className="admin-tabs">{[['ALL', 'ทั้งหมด'], ['PUBLISHED', 'เผยแพร่แล้ว'], ['DRAFT', 'ฉบับร่าง'], ['HIDDEN', 'ซ่อน']].map(([value, label]) => <button key={value} className={status === value ? 'active' : ''} onClick={() => { setStatus(value); setPage(1); setNotice(''); setActionError('') }}>{label}</button>)}</div><span>{totalCount} บทความ</span></div><div className="admin-search-filters"><input aria-label="ค้นหาบทความ" placeholder="ค้นหาชื่อ เนื้อหา หรือคำสำคัญ" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }}/><select aria-label="กรองหมวดหมู่" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1) }}><option value="">ทุกหมวดหมู่</option>{(categoriesData.data || []).map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></div>
    {loading ? <p className="admin-loading">กำลังโหลดบทความ...</p> : !totalCount ? <div className="admin-empty"><b>ไม่พบบทความในรายการนี้</b><p>ปรับตัวกรองหรือเพิ่มบทความใหม่</p><Link to="/admin/articles/new">เพิ่มบทความ →</Link></div> : <>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>บทความ</th><th>หมวดหมู่</th><th>สถานะ</th><th>ยอดวิว</th><th>ผลประเมิน</th><th>ไฟล์แนบ</th><th>อัปเดตล่าสุด</th><th>การจัดการ</th></tr></thead><tbody>{pagedArticles.map((article) => { const imgCount = Array.isArray(article.images) && article.images.length ? article.images.length : (article.image ? 1 : 0); return <tr key={article.articleId}><td><b>{article.title}</b></td><td>{article.category?.categoryName || '—'}</td><td><StatusBadge status={article.status}/></td><td>{Number(article.viewCount || 0).toLocaleString('th-TH')}</td><td>{article.feedbackCount ? `${article.helpfulPercent}% (${article.helpfulCount}/${article.feedbackCount})` : 'ยังไม่มีผลประเมิน'}</td><td><span title={imgCount ? `มีรูปภาพ ${imgCount} รูป` : 'ไม่มีรูปภาพ'}>{imgCount ? `🖼 ${imgCount} รูป` : '—'}</span> · <span title={article.pdfFile ? 'มีไฟล์ PDF' : 'ไม่มีไฟล์ PDF'}>{article.pdfFile ? 'PDF' : '—'}</span> · <span title={article.videoUrl ? article.videoUrl : 'ไม่มีลิงก์วิดีโอ'}>{article.videoUrl ? '🎬 วิดีโอ/ลิงก์' : '—'}</span></td><td>{dateLabel(article.updatedAt)}</td><td><div className="admin-row-actions article-row-actions"><div className="admin-row-action-group"><Link to={`/articles/${article.articleId}?preview=1`} target="_blank" rel="opener">ดูตัวอย่าง</Link><Link to={`/admin/articles/${article.articleId}/edit`}>แก้ไข</Link></div><div className="admin-row-action-group">{[['PUBLISHED','เผยแพร่'], ['DRAFT','ฉบับร่าง'], ['HIDDEN','ซ่อน']].filter(([nextStatus]) => nextStatus !== article.status).map(([nextStatus, label]) => <button key={nextStatus} className={`status-action status-action-${nextStatus.toLowerCase()}`} onClick={() => setArticleStatus(article, nextStatus)}>{label}</button>)}<button className="danger-action" onClick={() => removeArticle(article)}>ลบ</button></div></div></td></tr> })}</tbody></table></div>
      <div className="admin-pagination" aria-label="การแบ่งหน้ารายการบทความ">
        <div className="admin-page-summary">
          <span>แสดง <b>{startIndex + 1}–{Math.min(startIndex + pageSize, totalCount)}</b> จากทั้งหมด <b>{totalCount}</b> บทความ</span>
          <label className="admin-pagesize-picker">แสดงต่อหน้า <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value={8}>8 รายการ</option><option value={15}>15 รายการ</option><option value={30}>30 รายการ</option></select></label>
        </div>
        {pageCount > 1 && <div className="admin-page-controls">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>← ก่อนหน้า</button>
          <div className="admin-page-numbers">{Array.from({ length: pageCount }, (_, idx) => idx + 1).map((num) => <button key={num} type="button" className={num === currentPage ? 'active' : ''} onClick={() => setPage(num)}>{num}</button>)}</div>
          <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>ถัดไป →</button>
        </div>}
      </div>
    </>}
  </section>
}

export function ArticleEditor() {
  const { id } = useParams()
  const { data: article, error, loading } = useAdminData(id ? `/admin/articles/${id}` : '')
  if (!id) return <ArticleForm key="new"/>
  if (loading) return <section className="admin-content"><p className="admin-loading">กำลังโหลดบทความ...</p></section>
  if (error || !article) return <section className="admin-content"><Alert>{error || 'ไม่พบบทความนี้'}</Alert><Link to="/admin/articles">← กลับไปรายการบทความ</Link></section>
  return <ArticleForm key={id} article={article}/>
}

function ArticleForm({ article }) {
  const editing = Boolean(article)
  const navigate = useNavigate()
  const location = useLocation()
  const suggestedTitle = new URLSearchParams(location.search).get('title') || ''
  const { data: categories, loading: categoriesLoading } = useAdminData('/admin/categories')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    title: article?.title || suggestedTitle, categoryId: article?.categoryId ? String(article.categoryId) : '',
    content: article?.content || '', steps: Array.isArray(article?.steps) ? article.steps.join('\n') : '',
    keywords: article?.keywords?.join(', ') || '', videoUrl: article?.videoUrl || '',
    status: article?.status || 'DRAFT', featured: Boolean(article?.featured),
    removePdf: false,
  }))
  const [keptImages, setKeptImages] = useState(() => {
    const list = Array.isArray(article?.images) && article.images.length ? article.images.filter(Boolean) : (article?.image ? [article.image] : [])
    return list.slice(0, 5)
  })
  const [newImageFiles, setNewImageFiles] = useState([])
  const [pdfFile, setPdfFile] = useState(null)
  useDocumentTitle(editing ? 'แก้ไขบทความ · ระบบเจ้าหน้าที่' : 'เพิ่มบทความ · ระบบเจ้าหน้าที่')
  const newImagePreviews = useMemo(() => newImageFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [newImageFiles])
  const mediaPreview = useMemo(() => parseMediaLink(form.videoUrl), [form.videoUrl])
  useEffect(() => () => { newImagePreviews.forEach((item) => URL.revokeObjectURL(item.url)) }, [newImagePreviews])
  const setField = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  function appendTemplate(field, template) {
    setForm((value) => ({ ...value, [field]: `${value[field].trimEnd()}${value[field].trim() ? '\n\n' : ''}${template}` }))
  }
  const totalImagesCount = keptImages.length + newImageFiles.length
  const remainingImageSlots = Math.max(0, 5 - totalImagesCount)

  function handleSelectImages(event) {
    const selected = Array.from(event.target.files || [])
    event.target.value = ''
    if (!selected.length) return
    setError('')
    const oversize = selected.find((file) => file.size > 5 * 1024 * 1024)
    if (oversize) {
      setError(`ไฟล์รูปภาพ “${oversize.name}” มีขนาดเกิน 5 MB`)
      return
    }
    const available = Math.max(0, 5 - keptImages.length - newImageFiles.length)
    if (selected.length > available) {
      setError('สามารถแนบรูปภาพประกอบได้สูงสุดไม่เกิน 5 รูปต่อบทความ')
    }
    if (available > 0) {
      setNewImageFiles((prev) => [...prev, ...selected.slice(0, available)])
    }
  }

  function removeExistingImage(imgPath) {
    setKeptImages((prev) => prev.filter((item) => item !== imgPath))
  }

  function removeNewImage(index) {
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => body.append(key, typeof value === 'boolean' ? String(value) : value))
    body.append('keptImages', JSON.stringify(keptImages))
    body.append('removeImage', String(keptImages.length === 0 && newImageFiles.length === 0))
    newImageFiles.forEach((file) => body.append('images', file))
    if (pdfFile) body.append('pdfFile', pdfFile)
    try {
      if (editing) await api.patch(`/admin/articles/${article.articleId}`, body)
      else await api.post('/admin/articles', body)
      navigate('/admin/articles', { replace: true, state: { notice: editing ? 'บันทึกการแก้ไขบทความแล้ว' : 'เพิ่มบทความแล้ว' } })
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return <section className="admin-content"><div className="admin-title-row"><div><span className="eyebrow">ARTICLE EDITOR</span><h1>{editing ? 'แก้ไขบทความ' : 'เพิ่มบทความ'}</h1><p className="admin-muted">กรอกเนื้อหาและเลือกสถานะก่อนบันทึก</p></div><Link className="admin-secondary-link" to="/admin/articles">← กลับ</Link></div><Alert>{error}</Alert>
    <form className="admin-form" onSubmit={submit}><label>ชื่อบทความ <input required maxLength={240} value={form.title} onChange={setField('title')} placeholder="เช่น วิธีเชื่อมต่อ Wi-Fi ของศูนย์"/></label><div className="admin-form-grid"><label>หมวดหมู่<select required value={form.categoryId} onChange={setField('categoryId')} disabled={categoriesLoading}><option value="">เลือกหมวดหมู่</option>{(categories || []).map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></label><label>สถานะ<select value={form.status} onChange={setField('status')}><option value="DRAFT">ฉบับร่าง</option><option value="PUBLISHED">เผยแพร่</option><option value="HIDDEN">ซ่อน</option></select></label></div><label>เนื้อหาบทความ<div className="editor-tools"><button type="button" onClick={() => appendTemplate('content', 'เกริ่นนำ\n')}>เพิ่มหัวข้อเกริ่นนำ</button><button type="button" onClick={() => appendTemplate('content', 'ข้อควรทราบ\n')}>เพิ่มหัวข้อย่อย</button></div><textarea required rows={11} maxLength={100000} value={form.content} onChange={setField('content')} placeholder="อธิบายปัญหาและวิธีแก้ไข..."/></label><label>ขั้นตอนการแก้ไข <small>ใส่หนึ่งขั้นตอนต่อหนึ่งบรรทัด</small><div className="editor-tools"><button type="button" onClick={() => appendTemplate('steps', 'ขั้นตอนใหม่')}>เพิ่มขั้นตอนถัดไป</button></div><textarea rows={7} value={form.steps} onChange={setField('steps')} placeholder={'ตรวจสอบการเชื่อมต่อ\nรีสตาร์ตอุปกรณ์\nทดลองเชื่อมต่ออีกครั้ง'}/></label><label>คำค้น <small>คั่นแต่ละคำด้วยเครื่องหมายจุลภาค</small><input value={form.keywords} onChange={setField('keywords')} placeholder="wifi, เครือข่าย, อินเทอร์เน็ต"/></label>
      <div className="admin-form-grid">
        <div className="admin-file-field">
          <label>
            ภาพประกอบบทความ ({totalImagesCount}/5 รูป) <small>JPG, PNG หรือ WebP · สูงสุด 5 รูป (ไม่เกินรูปละ 5 MB · รูปที่ 1 จะใช้เป็นรูปปกหลัก)</small>
            <input
              type="file"
              multiple
              disabled={remainingImageSlots === 0}
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handleSelectImages}
            />
          </label>
          {remainingImageSlots === 0 && <small className="image-limit-note">ครบจำนวนสูงสุด 5 รูปแล้ว (ลบรูปบางส่วนออกหากต้องการเปลี่ยนรูปใหม่)</small>}
          {(keptImages.length > 0 || newImagePreviews.length > 0) && <div className="admin-multi-image-grid">
            {keptImages.map((imgPath, idx) => <div className="admin-image-card" key={`kept-${imgPath}`}>
              <div className="admin-image-card-head">
                <span className={`image-slot-badge${idx === 0 ? ' is-primary' : ''}`}>{idx === 0 ? '★ รูปปกหลัก (รูปที่ 1)' : `รูปที่ ${idx + 1}`}</span>
                <button type="button" className="danger-action" onClick={() => removeExistingImage(imgPath)}>× ลบรูปนี้</button>
              </div>
              <a href={assetUrl(imgPath)} target="_blank" rel="noreferrer" className="admin-image-thumb-wrap">
                <img className="admin-image-preview" src={assetUrl(imgPath)} alt={`รูปประกอบที่ ${idx + 1}`}/>
              </a>
            </div>)}
            {newImagePreviews.map((item, idx) => {
              const slotNum = keptImages.length + idx + 1
              return <div className="admin-image-card is-new" key={`new-${item.url}`}>
                <div className="admin-image-card-head">
                  <span className={`image-slot-badge${slotNum === 1 ? ' is-primary' : ''}`}>{slotNum === 1 ? '★ รูปปกหลักใหม่ (รูปที่ 1)' : `รูปใหม่ (รูปที่ ${slotNum})`}</span>
                  <button type="button" className="danger-action" onClick={() => removeNewImage(idx)}>× นำออก</button>
                </div>
                <div className="admin-image-thumb-wrap">
                  <img className="admin-image-preview" src={item.url} alt={`ตัวอย่างรูปใหม่ ${item.name}`}/>
                </div>
                <small className="admin-image-filename" title={item.name}>{item.name}</small>
              </div>
            })}
          </div>}
        </div>
        <div className="admin-file-field"><label>คู่มือ PDF <small>PDF · 1 ไฟล์ ไม่เกิน 15 MB</small><input type="file" accept="application/pdf,.pdf" onChange={(event) => { setPdfFile(event.target.files?.[0] || null); setForm((value) => ({ ...value, removePdf: false })) }}/></label>{pdfFile && <div className="selected-file-row"><span>ไฟล์ที่เลือก: {pdfFile.name}</span><button type="button" onClick={() => setPdfFile(null)}>นำออก</button></div>}{article?.pdfFile && <div className="current-file">ไฟล์ PDF เดิม: <a href={assetUrl(article.pdfFile)} target="_blank" rel="noreferrer">เปิด PDF</a><label className="inline-check"><input type="checkbox" checked={form.removePdf} onChange={setField('removePdf')}/> ลบไฟล์ PDF เดิม</label>{form.removePdf && <span className="file-removed-label">เลือกเพื่อลบเมื่อบันทึก</span>}</div>}</div>
      </div>
      <div className="admin-file-field admin-video-field">
        <label>วิดีโอประกอบบทความ / ลิงก์อ้างอิงเพิ่มเติม <small>ไม่บังคับ · รองรับ YouTube, Google Drive, ไฟล์วิดีโอ (.mp4) หรือลิงก์เว็บไซต์ https://</small>
          <div className="admin-video-input-row">
            <input type="url" maxLength={1024} value={form.videoUrl} onChange={setField('videoUrl')} placeholder="เช่น https://www.youtube.com/watch?v=... หรือ https://..."/>
            {form.videoUrl && <button type="button" className="admin-secondary-link" onClick={() => setForm((value) => ({ ...value, videoUrl: '' }))}>ล้างลิงก์</button>}
          </div>
        </label>
        {form.videoUrl.trim() && !mediaPreview && <p className="file-removed-label">กรุณาระบุ URL ที่ขึ้นต้นด้วย https:// หรือ http:// ให้ถูกต้อง</p>}
        {mediaPreview && <div className="admin-video-preview">
          <div className="selected-file-row">
            <span>✓ ตรวจพบลิงก์ ({mediaPreview.provider}): <a href={mediaPreview.href} target="_blank" rel="noreferrer">{mediaPreview.href}</a></span>
          </div>
          {(mediaPreview.type === 'youtube' || mediaPreview.type === 'gdrive') && <div className="video-frame-wrap admin-video-frame">
            <iframe src={mediaPreview.embedUrl} title="ตัวอย่างวิดีโอประกอบ" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
          </div>}
        </div>}
      </div>
      <label className="featured-check"><input type="checkbox" checked={form.featured} onChange={setField('featured')}/> แสดงเป็นบทความแนะนำ</label><div className="admin-form-actions"><button type="button" className="admin-secondary-link" onClick={() => navigate('/admin/articles')}>ยกเลิก</button><button className="admin-primary-link" disabled={busy}>{busy ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'บันทึกบทความ'}</button></div>
    </form>
  </section>
}

export function CategoryManager() {
  const [refresh, setRefresh] = useState(0)
  const { data: categories, loading, error } = useAdminData('/admin/categories', refresh)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  useDocumentTitle('จัดการหมวดหมู่ · ระบบเจ้าหน้าที่')

  function resetForm() { setEditingId(null); setName(''); setDescription(''); setActionError('') }
  function editCategory(category) { setEditingId(category.categoryId); setName(category.categoryName); setDescription(category.description || ''); setActionError('') }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setActionError(''); setNotice('')
    try {
      const payload = { categoryName: name, description }
      if (editingId) await api.patch(`/admin/categories/${editingId}`, payload)
      else await api.post('/admin/categories', payload)
      setNotice(editingId ? 'บันทึกการแก้ไขหมวดหมู่แล้ว' : 'เพิ่มหมวดหมู่แล้ว'); resetForm(); setRefresh((value) => value + 1)
    } catch (err) { setActionError(err.message) } finally { setBusy(false) }
  }
  async function removeCategory(category) {
    if (!window.confirm(`ลบหมวดหมู่ “${category.categoryName}” ใช่หรือไม่?`)) return
    setActionError(''); setNotice('')
    try { await api.delete(`/admin/categories/${category.categoryId}`); setNotice('ลบหมวดหมู่แล้ว'); setRefresh((value) => value + 1) }
    catch (err) { setActionError(err.message) }
  }

  return <section className="admin-content"><div className="admin-title-row"><div><span className="eyebrow">KNOWLEDGE TOPICS</span><h1>จัดการหมวดหมู่</h1><p className="admin-muted">ไม่สามารถลบหมวดหมู่ที่มีบทความผูกอยู่ได้</p></div></div><Alert type="success">{notice}</Alert><Alert>{actionError || error}</Alert><div className="category-admin-layout"><form className="admin-form category-form" onSubmit={submit}><h2>{editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</h2><label>ชื่อหมวดหมู่<input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} placeholder="ชื่อหมวดหมู่"/></label><label>คำอธิบาย<textarea rows={4} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="รายละเอียดหมวดหมู่ (ไม่บังคับ)"/></label><div className="admin-form-actions"><button className="admin-secondary-link" type="button" onClick={resetForm}>ล้าง</button><button className="admin-primary-link" disabled={busy}>{busy ? 'กำลังบันทึก...' : editingId ? 'บันทึก' : 'เพิ่มหมวดหมู่'}</button></div></form><div className="admin-table-wrap category-admin-table-wrap">{loading ? <p className="admin-loading">กำลังโหลดหมวดหมู่...</p> : <table className="admin-table"><thead><tr><th>หมวดหมู่</th><th>คำอธิบาย</th><th>จำนวนบทความ</th><th>การจัดการ</th></tr></thead><tbody>{(categories || []).map((category) => <tr key={category.categoryId}><td><b>{category.categoryName}</b></td><td>{category.description || 'ไม่มีคำอธิบาย'}</td><td>{category._count?.articles || 0}</td><td><div className="admin-row-actions"><button onClick={() => editCategory(category)}>แก้ไข</button><button className="danger-action" onClick={() => removeCategory(category)}>ลบ</button></div></td></tr>)}</tbody></table>}</div></div>
  </section>
}

export default function AdminManagement({ admin, onLogout }) {
  const { t } = useLang()
  const displayName = admin?.fullname || t('เจ้าหน้าที่', 'Administrator')
  const avatarText = displayName.trim().slice(0, 1) || 'จ'
  return <main className="admin-page">
    <header className="admin-topbar admin-sidebar">
      <div className="admin-sidebar-top">
        <Link className="admin-brand" to="/admin">
          <span className="brand-logos" aria-hidden="true"><img className="brand-logo-seal" src="/logo-khonkaen.png" alt=""/><span className="brand-logo-divider"/><img className="brand-logo-ict" src="/logo-ict.png" alt=""/></span>
          <span><b>{t('คลังความรู้ ICT', 'ICT Knowledge')}</b><small>{t('พื้นที่เจ้าหน้าที่', 'Staff Portal')}</small></span>
        </Link>
        <LanguageSwitch/>
      </div>
      <div className="admin-nav-section">
        <span className="admin-nav-label">{t('เมนูจัดการระบบ', 'MANAGEMENT MENU')}</span>
        <nav className="admin-nav" aria-label={t('เมนูพื้นที่เจ้าหน้าที่', 'Staff navigation')}>
          <NavLink to="/admin" end><span className="admin-nav-icon" aria-hidden="true">▤</span><span>{t('ภาพรวม', 'Dashboard')}</span></NavLink>
          <NavLink to="/admin/articles"><span className="admin-nav-icon" aria-hidden="true">✎</span><span>{t('บทความ', 'Articles')}</span></NavLink>
          <NavLink to="/admin/categories"><span className="admin-nav-icon" aria-hidden="true">▣</span><span>{t('หมวดหมู่', 'Categories')}</span></NavLink>
          <NavLink to="/admin/settings"><span className="admin-nav-icon" aria-hidden="true">⚙</span><span>{t('ตั้งค่า', 'Settings')}</span></NavLink>
          <Link to="/" target="_blank" className="admin-ext-link"><span className="admin-nav-icon" aria-hidden="true">↗</span><span>{t('หน้าเว็บไซต์', 'Public Website')}</span></Link>
        </nav>
      </div>
      <div className="admin-user-box">
        <div className="admin-user-info">
          <span className="admin-avatar" aria-hidden="true">{avatarText}</span>
          <div>
            <b>{displayName}</b>
            <small>{t('เจ้าหน้าที่ดูแลระบบ', 'System Administrator')}</small>
          </div>
        </div>
        <button type="button" onClick={onLogout}>{t('ออกจากระบบ', 'Sign Out')}</button>
      </div>
    </header>
    <div className="admin-workspace">
      <Outlet/>
    </div>
  </main>
}

