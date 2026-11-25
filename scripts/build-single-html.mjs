import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const cssContent = fs.readFileSync(path.join(rootDir, 'frontend/src/App.css'), 'utf8')

const singleFileHtml = `<!doctype html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0f4c5c" />
  <meta name="description" content="คลังความรู้และคู่มือบริการไอที ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT) - Single-File HTML + MySQL" />
  <title>คลังความรู้ ICT | ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
${cssContent}

/* --- Single-File HTML View Switching Styles --- */
.spa-view { display: none; }
.spa-view.is-active { display: block; }
.spa-admin-view { display: none; }
.spa-admin-view.is-active { display: grid; }
@media (max-width: 960px) {
  .spa-admin-view.is-active { display: block; }
}
.admin-subview { display: none; }
.admin-subview.is-active { display: block; }
  </style>
</head>
<body>

  <!-- ===================================================================== -->
  <!-- ส่วนหัวเว็บไซต์ (PUBLIC HEADER)                                         -->
  <!-- ===================================================================== -->
  <div id="public-chrome-top">
    <div class="utility">
      <div class="shell utility-inner">
        <span class="utility-org">
          <img class="utility-seal" data-asset="/logo-khonkaen.png" alt="ตราเทศบาลนครขอนแก่น" />
          <span data-i18n="ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT)|Khon Kaen Municipality ICT Skill Development & Learning Center (KKICT)">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT)</span>
        </span>
        <span>
          <span data-i18n="บริการคลังความรู้ดิจิทัล (HTML + MySQL)|Digital Knowledge Portal (HTML + MySQL)">บริการคลังความรู้ดิจิทัล (HTML + MySQL)</span> ·
          <a href="https://www.kkict.net/" target="_blank" rel="noreferrer" data-i18n="เว็บไซต์หลัก kkict.net ↗|Main Website kkict.net ↗">เว็บไซต์หลัก kkict.net ↗</a>
        </span>
      </div>
    </div>

    <header class="site-header">
      <div class="shell nav-row">
        <a class="brand" href="#home" onclick="navigateTo('home'); return false;">
          <span class="brand-logos" aria-hidden="true">
            <img class="brand-logo-seal" data-asset="/logo-khonkaen.png" alt="" />
            <span class="brand-logo-divider"></span>
            <img class="brand-logo-ict" data-asset="/logo-ict.png" alt="" />
          </span>
          <span>
            <b data-i18n="คลังความรู้ ICT|ICT Knowledge Base">คลังความรู้ ICT</b>
            <small data-i18n="ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น|Khon Kaen Municipality ICT Learning Center">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น</small>
          </span>
        </a>
        <nav>
          <a href="#home" id="nav-link-home" class="active" onclick="navigateTo('home'); return false;" data-i18n="หน้าแรก|Home">หน้าแรก</a>
          <a href="#articles" id="nav-link-articles" onclick="navigateTo('articles'); return false;" data-i18n="คลังความรู้|Knowledge Library">คลังความรู้</a>
          <a href="#saved" id="nav-link-saved" class="nav-saved-link" onclick="navigateTo('articles', { saved: '1' }); return false;">
            <span data-i18n="★ ที่บันทึกไว้|★ Saved Guides">★ ที่บันทึกไว้</span>
            <span class="nav-saved-badge" data-saved-count style="display:none;">0</span>
          </a>
        </nav>
        <div class="nav-actions">
          <div class="lang-switch" role="group" aria-label="สลับภาษา">
            <button type="button" id="lang-btn-th" class="active" onclick="setLanguage('th')">TH</button>
            <button type="button" id="lang-btn-en" onclick="setLanguage('en')">EN</button>
          </div>
          <a class="nav-staff-btn" href="#admin" onclick="goStaffPortal(); return false;">
            <span class="nav-staff-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span id="header-staff-label" data-i18n="เข้าสู่ระบบเจ้าหน้าที่|Staff Login">เข้าสู่ระบบเจ้าหน้าที่</span>
          </a>
        </div>
      </div>
    </header>
  </div>

  <!-- ===================================================================== -->
  <!-- หน้าที่ 1: หน้าแรกคลังความรู้ (HOME VIEW)                                -->
  <!-- ===================================================================== -->
  <main id="view-home" class="spa-view is-active">
    <section class="hero">
      <div class="shell hero-inner">
        <div class="hero-copy">
          <div class="hero-kicker">
            <span>
              <img class="kicker-seal" data-asset="/logo-khonkaen.png" alt="" />
              <img class="kicker-ict" data-asset="/logo-ict.png" alt="" />
            </span>
            <span data-i18n="ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น · KKICT|KHON KAEN MUNICIPALITY ICT LEARNING CENTER · KKICT">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น · KKICT</span>
          </div>
          <h1 data-i18n="คลังความรู้และคู่มือไอที เพื่อการเรียนรู้และแก้ไขปัญหาด้วยตนเอง|IT Knowledge Base & Self-Service Troubleshooting Guides">คลังความรู้และคู่มือไอที เพื่อการเรียนรู้และแก้ไขปัญหาด้วยตนเอง</h1>
          <p data-i18n="บริการข้อมูลคู่มือการใช้งานคอมพิวเตอร์ เครือข่าย อุปกรณ์สำนักงาน และระบบสารสนเทศ ค้นหาคำตอบได้สะดวกพร้อมขั้นตอนปฏิบัติอย่างเป็นลำดับ|Standardized manuals and step-by-step troubleshooting guides for computers, networks, printers, and municipal information systems.">บริการข้อมูลคู่มือการใช้งานคอมพิวเตอร์ เครือข่าย อุปกรณ์สำนักงาน และระบบสารสนเทศ ค้นหาคำตอบได้สะดวกพร้อมขั้นตอนปฏิบัติอย่างเป็นลำดับ</p>
          <form class="hero-search" onsubmit="submitHeroSearch(event)">
            <span>⌕</span>
            <input id="home-search-input" placeholder="พิมพ์สิ่งที่ต้องการค้นหา เช่น เชื่อมต่อ Wi-Fi, เครื่องพิมพ์..." />
            <button type="submit" data-i18n="ค้นหาคู่มือ|Search Guides">ค้นหาคู่มือ</button>
          </form>
          <div class="popular-searches">
            <span data-i18n="คำค้นหายอดนิยม|Popular Searches">คำค้นหายอดนิยม</span>
            <button type="button" onclick="navigateTo('articles', { q: 'Wi-Fi' })">Wi-Fi</button>
            <button type="button" onclick="navigateTo('articles', { q: 'Printer' })">Printer</button>
            <button type="button" onclick="navigateTo('articles', { q: 'รหัสผ่าน' })">รหัสผ่าน</button>
            <button type="button" onclick="navigateTo('articles', { q: 'Windows' })">Windows</button>
            <button type="button" onclick="navigateTo('articles', { q: 'อินเทอร์เน็ต' })">อินเทอร์เน็ต</button>
          </div>
          <div class="hero-proof">
            <span>✓</span> <span data-i18n="มาตรฐานคู่มือเข้าใจง่าย|Easy-to-follow manuals">มาตรฐานคู่มือเข้าใจง่าย</span>
            <span>✓</span> <span data-i18n="ค้นหาได้ตลอด 24 ชั่วโมง|Available 24/7">ค้นหาได้ตลอด 24 ชั่วโมง</span>
            <span>✓</span> <span data-i18n="บริการสาธารณะไม่มีค่าใช้จ่าย|Free public digital service">บริการสาธารณะไม่มีค่าใช้จ่าย</span>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="visual-circle">
            <div class="visual-window">
              <div class="window-bar"><i></i><i></i><i></i></div>
              <div class="window-content window-logo-content">
                <img class="window-logo-seal" data-asset="/logo-khonkaen.png" alt="" />
                <img class="window-logo-ict" data-asset="/logo-ict.png" alt="" />
                <span class="window-check">✓</span>
              </div>
            </div>
          </div>
          <div class="float-chip chip-one">✓ ขั้นตอนชัดเจน</div>
          <div class="float-chip chip-two">⌕ ค้นหาคู่มือมาตรฐาน</div>
        </div>
      </div>
    </section>

    <!-- แถบคู่มือที่เปิดอ่านล่าสุด & ที่บันทึกไว้ -->
    <section id="home-personal-shelf" class="section shell personal-shelf-section" style="display:none;"></section>

    <section class="section shell">
      <div class="section-heading">
        <div>
          <span class="eyebrow">KNOWLEDGE TOPICS</span>
          <h2 data-i18n="หมวดหมู่ความรู้|Knowledge Categories">หมวดหมู่ความรู้</h2>
        </div>
        <a class="text-link" href="#articles" onclick="navigateTo('articles'); return false;"><span data-i18n="ดูบทความทั้งหมด|View All Guides">ดูบทความทั้งหมด</span> <b>→</b></a>
      </div>
      <div class="category-grid" id="home-categories">
        <div class="loading">กำลังโหลดหมวดหมู่ความรู้จาก MySQL...</div>
      </div>
    </section>

    <section class="section shell">
      <div class="section-heading">
        <div>
          <span class="eyebrow">RECOMMENDED GUIDES</span>
          <h2 data-i18n="บทความแนะนำและคู่มือยอดนิยม|Featured & Popular Guides">บทความแนะนำและคู่มือยอดนิยม</h2>
        </div>
        <a class="text-link" href="#articles" onclick="navigateTo('articles', { sort: 'popular' }); return false;"><span data-i18n="ดูยอดนิยมทั้งหมด|View Most Popular">ดูยอดนิยมทั้งหมด</span> <b>→</b></a>
      </div>
      <div class="article-grid" id="home-featured">
        <div class="loading">กำลังโหลดบทความแนะนำ...</div>
      </div>
    </section>

    <section class="section latest-section">
      <div class="shell">
        <div class="section-heading">
          <div>
            <span class="eyebrow">RECENT UPDATES</span>
            <h2 data-i18n="อัปเดตล่าสุด|Latest Guides">อัปเดตล่าสุด</h2>
          </div>
          <a class="text-link" href="#articles" onclick="navigateTo('articles'); return false;"><span data-i18n="ดูทั้งหมด|Browse All">ดูทั้งหมด</span> <b>→</b></a>
        </div>
        <div class="article-grid" id="home-latest">
          <div class="loading">กำลังโหลดบทความล่าสุด...</div>
        </div>
      </div>
    </section>

    <section class="section shell">
      <div id="home-contact-card"></div>
    </section>
  </main>

  <!-- ===================================================================== -->
  <!-- หน้าที่ 2: หน้าคลังความรู้และค้นหาทั้งหมด (ARTICLES & SEARCH VIEW)         -->
  <!-- ===================================================================== -->
  <main id="view-articles" class="spa-view listing-page">
    <div class="shell">
      <div class="page-intro">
        <div class="breadcrumbs">
          <a href="#home" onclick="navigateTo('home'); return false;" data-i18n="หน้าแรก|Home">หน้าแรก</a>
          <span>/</span>
          <span id="listing-breadcrumb-current">คลังความรู้และคู่มือ</span>
        </div>
        <span class="eyebrow">ICT KNOWLEDGE LIBRARY</span>
        <h1 id="listing-heading">คลังความรู้และคู่มือ</h1>
        <p id="listing-subtitle">ค้นหาคู่มือและวิธีแก้ไขปัญหาด้านเทคโนโลยีสารสนเทศ</p>
        <form class="hero-search" onsubmit="submitListingSearch(event)">
          <span>⌕</span>
          <input id="listing-search-input" placeholder="พิมพ์สิ่งที่ต้องการค้นหา เช่น Wi-Fi, Printer, รหัสผ่าน..." />
          <button type="submit" data-i18n="ค้นหาคู่มือ|Search Guides">ค้นหาคู่มือ</button>
        </form>
      </div>

      <div class="listing-layout">
        <aside class="filter-panel" id="listing-filter-panel"></aside>
        <section class="listing-results">
          <div class="results-head">
            <span id="listing-total-label">0 บทความ</span>
            <div class="results-head-actions">
              <select id="listing-sort-select" onchange="changeListingSort(this.value)">
                <option value="recent">ใหม่ล่าสุด</option>
                <option value="popular">ยอดเข้าชมสูงสุด</option>
              </select>
            </div>
          </div>
          <div id="listing-assist-bar" class="search-assist-bar" style="display:none;"></div>
          <div id="listing-results-body"></div>
        </section>
      </div>
    </div>
  </main>

  <!-- ===================================================================== -->
  <!-- หน้าที่ 3: หน้าอ่านรายละเอียดคู่มือ & PDF (ARTICLE DETAIL VIEW)             -->
  <!-- ===================================================================== -->
  <main id="view-detail" class="spa-view article-detail shell">
    <div id="detail-view-body"></div>
  </main>

  <!-- ===================================================================== -->
  <!-- หน้าที่ 4: หน้าเข้าสู่ระบบเจ้าหน้าที่ (ADMIN LOGIN & RESET VIEW)            -->
  <!-- ===================================================================== -->
  <main id="view-login" class="spa-view admin-login-page">
    <div class="admin-login-shell">
      <aside class="admin-login-showcase" aria-hidden="true">
        <div class="showcase-top">
          <div class="showcase-kicker"><img class="kicker-seal" data-asset="/logo-khonkaen.png" alt="" /> KKICT STAFF PORTAL · เทศบาลนครขอนแก่น</div>
          <h2>ระบบบริหารจัดการ<br/>คลังความรู้ดิจิทัล (MySQL)</h2>
          <p>พื้นที่ทำงานสำหรับเจ้าหน้าที่ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เพื่อดูแลคู่มือไอทีและติดตามสถิติการใช้งานของประชาชน</p>
        </div>
        <ul class="showcase-features">
          <li>
            <span class="feature-icon">▤</span>
            <div><b>จัดการบทความและหมวดหมู่ครบวงจร</b><small>สร้าง แก้ไข ตั้งสถานะฉบับร่าง แนบรูป 5 รูป และไฟล์คู่มือ PDF</small></div>
          </li>
          <li>
            <span class="feature-icon">◉</span>
            <div><b>เชื่อมต่อฐานข้อมูล MySQL โดยตรง</b><small>ดูรายงานสรุปผลงานรายเดือนและส่งออกไฟล์ CSV</small></div>
          </li>
        </ul>
      </aside>

      <div class="admin-login-card">
        <div class="login-card-top">
          <a class="admin-brand" href="#home" onclick="navigateTo('home'); return false;">
            <span class="brand-logos" aria-hidden="true">
              <img class="brand-logo-seal" data-asset="/logo-khonkaen.png" alt="" />
              <span class="brand-logo-divider"></span>
              <img class="brand-logo-ict" data-asset="/logo-ict.png" alt="" />
            </span>
            <span>
              <b>คลังความรู้ ICT</b>
              <small>ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น</small>
            </span>
          </a>
          <div class="login-mode-tabs">
            <button type="button" id="tab-mode-login" class="active" onclick="switchAuthMode('login')">เข้าสู่ระบบ</button>
            <button type="button" id="tab-mode-reset" onclick="switchAuthMode('reset')">ตั้งรหัสใหม่</button>
          </div>
        </div>

        <div id="auth-box-login">
          <div class="admin-login-title">
            <span class="eyebrow">STAFF AUTHENTICATION</span>
            <h1>เข้าสู่ระบบเจ้าหน้าที่</h1>
            <p>กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบจัดการคลังความรู้</p>
          </div>
          <form onsubmit="submitAdminLogin(event)">
            <label>ชื่อผู้ใช้ (Username)
              <input id="admin-login-user" required placeholder="เช่น niknat789 หรือ ict-admin" />
            </label>
            <label>รหัสผ่าน (Password)
              <input id="admin-login-pass" type="password" required placeholder="กรอกรหัสผ่าน" />
            </label>
            <p id="admin-login-notice" class="admin-login-notice" style="display:none;"></p>
            <p id="admin-login-error" class="admin-login-error" style="display:none;"></p>
            <button type="submit" class="login-submit-btn">เข้าสู่ระบบจัดการคลังความรู้ →</button>
          </form>
        </div>

        <div id="auth-box-reset" style="display:none;">
          <div class="admin-login-title">
            <span class="eyebrow">PASSWORD RECOVERY</span>
            <h1>ตั้งรหัสผ่านใหม่</h1>
            <p>ยืนยันชื่อผู้ใช้และชื่อ-นามสกุลเจ้าหน้าที่ที่ลงทะเบียนไว้เพื่อกำหนดรหัสผ่านใหม่</p>
          </div>
          <form onsubmit="submitAdminReset(event)">
            <label>ชื่อผู้ใช้ (Username)
              <input id="admin-reset-user" required placeholder="เช่น niknat789 หรือ ict-admin" />
            </label>
            <label>ชื่อ-นามสกุลเจ้าหน้าที่ (ที่ลงทะเบียนไว้)
              <input id="admin-reset-fullname" required placeholder="เช่น เจ้าหน้าที่ศูนย์ ICT 2 หรือ ICT Administrator" />
            </label>
            <label>รหัสผ่านใหม่ (12 ตัวอักษรขึ้นไป)
              <input id="admin-reset-pass" type="password" required minlength="12" placeholder="อย่างน้อย 12 ตัวอักษร" />
            </label>
            <p id="admin-reset-error" class="admin-login-error" style="display:none;"></p>
            <button type="submit" class="login-submit-btn">บันทึกรหัสผ่านใหม่ →</button>
          </form>
        </div>

        <div class="login-card-footer">
          <a class="back-home" href="#home" onclick="navigateTo('home'); return false;">← กลับสู่หน้าเว็บไซต์คลังความรู้</a>
        </div>
      </div>
    </div>
  </main>

  <!-- ===================================================================== -->
  <!-- หน้าที่ 5: ระบบจัดการหลังบ้านสำหรับเจ้าหน้าที่ (ADMIN PORTAL VIEW)          -->
  <!-- ===================================================================== -->
  <main id="view-admin" class="spa-admin-view admin-page">
    <header class="admin-topbar admin-sidebar">
      <div class="admin-sidebar-top">
        <a class="admin-brand" href="#admin" onclick="switchAdminTab('dashboard'); return false;">
          <span class="brand-logos" aria-hidden="true">
            <img class="brand-logo-seal" data-asset="/logo-khonkaen.png" alt="" />
            <span class="brand-logo-divider"></span>
            <img class="brand-logo-ict" data-asset="/logo-ict.png" alt="" />
          </span>
          <span>
            <b>คลังความรู้ ICT</b>
            <small>พื้นที่เจ้าหน้าที่ (MySQL)</small>
          </span>
        </a>
      </div>
      <div class="admin-nav-section">
        <span class="admin-nav-label">เมนูจัดการระบบ</span>
        <nav class="admin-nav">
          <a href="#admin-dashboard" id="adm-nav-dashboard" class="active" onclick="switchAdminTab('dashboard'); return false;"><span class="admin-nav-icon">▤</span><span>ภาพรวม</span></a>
          <a href="#admin-articles" id="adm-nav-articles" onclick="switchAdminTab('articles'); return false;"><span class="admin-nav-icon">✎</span><span>บทความ</span></a>
          <a href="#admin-categories" id="adm-nav-categories" onclick="switchAdminTab('categories'); return false;"><span class="admin-nav-icon">▣</span><span>หมวดหมู่</span></a>
          <a href="#admin-settings" id="adm-nav-settings" onclick="switchAdminTab('settings'); return false;"><span class="admin-nav-icon">⚙</span><span>ตั้งค่า</span></a>
          <a href="#home" class="admin-ext-link" onclick="navigateTo('home'); return false;"><span class="admin-nav-icon">↗</span><span>หน้าเว็บไซต์</span></a>
        </nav>
      </div>
      <div class="admin-user-box">
        <div class="admin-user-info">
          <span class="admin-avatar" id="admin-user-avatar">จ</span>
          <div>
            <b id="admin-user-fullname">เจ้าหน้าที่ศูนย์ ICT</b>
            <small>เจ้าหน้าที่ดูแลระบบ</small>
          </div>
        </div>
        <button type="button" onclick="logoutAdmin()">ออกจากระบบ</button>
      </div>
    </header>

    <div class="admin-workspace">
      <!-- 5.1 แท็บภาพรวม (Admin Dashboard & Monthly Report) -->
      <section id="admin-sub-dashboard" class="admin-subview is-active admin-content admin-dashboard dash-simple">
        <div class="dash-hero">
          <div>
            <span class="dash-hero-kicker">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น · MySQL</span>
            <h1>ภาพรวมคลังความรู้</h1>
            <p>ดูตัวเลขสำคัญ รายงานประจำเดือน และสิ่งที่ควรทำต่อ ได้ในหน้าเดียว</p>
          </div>
          <div class="dash-hero-actions">
            <button type="button" class="admin-primary-link" onclick="openArticleEditor(null)">＋ เขียนบทความใหม่</button>
            <button type="button" class="admin-secondary-link" onclick="downloadAllArticlesCsv()">⇣ ส่งออกบทความทั้งหมด (CSV)</button>
          </div>
        </div>

        <div id="dash-notice-box"></div>
        <div class="dash-kpi-grid" id="dash-kpi-grid"></div>

        <div class="dashboard-panel dash-card monthly-report-panel">
          <div class="dash-section-head">
            <div class="dash-section-title">
              <span class="dash-section-icon">📅</span>
              <div>
                <h2>รายงานประจำเดือน</h2>
                <p>เลือกเดือนเพื่อดูผลงาน และดาวน์โหลดไฟล์ไปทำรายงานส่งหัวหน้าได้ทันที</p>
              </div>
            </div>
            <div class="dash-section-actions">
              <label class="dash-select">
                <span>เดือน</span>
                <select id="dash-month-select" onchange="changeDashboardMonth(this.value)"></select>
              </label>
              <button type="button" class="admin-primary-link" onclick="downloadMonthlyCsv()">⇣ ดาวน์โหลดรายงาน (CSV)</button>
            </div>
          </div>
          <div class="dash-month-stats" id="dash-month-stats"></div>
          <div class="dash-list-block">
            <div class="dash-list-head">
              <h3 id="dash-month-list-title">บทความที่สร้าง/เผยแพร่ในเดือนนี้</h3>
              <span class="panel-pill" id="dash-month-count-pill">0 บทความ</span>
            </div>
            <ol class="dash-article-list" id="dash-month-article-list"></ol>
            <nav class="admin-pagination dash-pagination" id="dash-month-pagination"></nav>
          </div>
        </div>

        <div class="dashboard-columns">
          <div class="dashboard-panel dash-card">
            <div class="dash-section-head">
              <div class="dash-section-title">
                <span class="dash-section-icon">🔍</span>
                <div><h2>คำค้นที่หาไม่เจอ</h2><p>ผู้ใช้ค้นแล้วไม่พบคู่มือ — ควรเขียนคู่มือเพิ่ม</p></div>
              </div>
            </div>
            <ul class="dash-term-list" id="dash-zero-terms"></ul>
          </div>
          <div class="dashboard-panel dash-card">
            <div class="dash-section-head">
              <div class="dash-section-title">
                <span class="dash-section-icon">🔥</span>
                <div><h2>คำค้นยอดนิยม</h2><p>คำที่ผู้ใช้ค้นหาบ่อยที่สุด</p></div>
              </div>
            </div>
            <ul class="dash-term-list" id="dash-top-terms"></ul>
          </div>
        </div>
      </section>

      <!-- 5.2 แท็บจัดการบทความ (Article List & Editor) -->
      <section id="admin-sub-articles" class="admin-subview admin-content">
        <div id="admin-articles-list-box">
          <div class="admin-title-row">
            <div>
              <span class="eyebrow">CONTENT MANAGEMENT</span>
              <h1>จัดการบทความ</h1>
              <p class="admin-muted">ดูแลบทความ คู่มือ และสถานะการเผยแพร่บนฐานข้อมูล MySQL</p>
            </div>
            <button type="button" class="admin-primary-link" onclick="openArticleEditor(null)">＋ เพิ่มบทความ</button>
          </div>
          <div class="admin-search-filters">
            <input id="adm-art-search" placeholder="ค้นหาชื่อ เนื้อหา หรือคำสำคัญ..." oninput="renderAdminArticlesTable()" />
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr><th>บทความ</th><th>หมวดหมู่</th><th>สถานะ</th><th>ยอดวิว</th><th>อัปเดตล่าสุด</th><th>การจัดการ</th></tr>
              </thead>
              <tbody id="adm-articles-tbody"></tbody>
            </table>
          </div>
        </div>

        <div id="admin-article-editor-box" style="display:none;">
          <div class="admin-title-row">
            <div>
              <span class="eyebrow">ARTICLE EDITOR</span>
              <h1 id="editor-heading">เพิ่มบทความ</h1>
            </div>
            <button type="button" class="admin-secondary-link" onclick="closeArticleEditor()">← กลับไปรายการบทความ</button>
          </div>
          <div id="editor-error-box"></div>
          <form class="admin-form" onsubmit="submitArticleEditor(event)">
            <input type="hidden" id="edit-article-id" />
            <label>ชื่อบทความ <input id="edit-title" required maxlength="240" placeholder="เช่น วิธีเชื่อมต่อ Wi-Fi ของศูนย์" /></label>
            <div class="admin-form-grid">
              <label>หมวดหมู่ <select id="edit-category" required></select></label>
              <label>สถานะ
                <select id="edit-status">
                  <option value="DRAFT">ฉบับร่าง</option>
                  <option value="PUBLISHED">เผยแพร่</option>
                  <option value="HIDDEN">ซ่อน</option>
                </select>
              </label>
            </div>
            <label>เนื้อหาบทความ <textarea id="edit-content" required rows="7" placeholder="อธิบายปัญหาและวิธีแก้ไข..."></textarea></label>
            <label>ขั้นตอนการแก้ไข <small>(ใส่หนึ่งขั้นตอนต่อหนึ่งบรรทัด)</small><textarea id="edit-steps" rows="5" placeholder="ตรวจสอบการเชื่อมต่อ&#10;รีสตาร์ตอุปกรณ์"></textarea></label>
            <label>คำค้น <small>(คั่นด้วยเครื่องหมายจุลภาค ,)</small><input id="edit-keywords" placeholder="wifi, เครือข่าย, อินเทอร์เน็ต" /></label>
            <label>วิดีโอประกอบบทความ / ลิงก์อ้างอิง <small>(YouTube, Google Drive หรือ https://...)</small><input id="edit-video" type="url" placeholder="https://www.youtube.com/watch?v=..." /></label>
            <div class="admin-form-grid">
              <label>อัปโหลดรูปภาพประกอบ (สูงสุด 5 รูป) <input id="edit-images" type="file" multiple accept="image/jpeg,image/png,image/webp" /></label>
              <label>อัปโหลดไฟล์คู่มือ PDF <input id="edit-pdf" type="file" accept="application/pdf,.pdf" /></label>
            </div>
            <label class="featured-check"><input id="edit-featured" type="checkbox" /> แสดงเป็นบทความแนะนำ</label>
            <div class="admin-form-actions">
              <button type="button" class="admin-secondary-link" onclick="closeArticleEditor()">ยกเลิก</button>
              <button type="submit" class="admin-primary-link">บันทึกบทความลง MySQL</button>
            </div>
          </form>
        </div>
      </section>

      <!-- 5.3 แท็บจัดการหมวดหมู่ (Category Manager) -->
      <section id="admin-sub-categories" class="admin-subview admin-content">
        <div class="admin-title-row">
          <div><span class="eyebrow">KNOWLEDGE TOPICS</span><h1>จัดการหมวดหมู่</h1></div>
        </div>
        <div class="category-admin-layout">
          <form class="admin-form category-form" onsubmit="submitCategoryForm(event)">
            <h2 id="cat-form-title">เพิ่มหมวดหมู่</h2>
            <input type="hidden" id="cat-edit-id" />
            <label>ชื่อหมวดหมู่ <input id="cat-edit-name" required maxlength="160" /></label>
            <label>คำอธิบาย <textarea id="cat-edit-desc" rows="3"></textarea></label>
            <div class="admin-form-actions">
              <button type="button" class="admin-secondary-link" onclick="resetCategoryForm()">ล้าง</button>
              <button type="submit" class="admin-primary-link">บันทึกหมวดหมู่</button>
            </div>
          </form>
          <div class="admin-table-wrap category-admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>หมวดหมู่</th><th>คำอธิบาย</th><th>จำนวนบทความ</th><th>การจัดการ</th></tr></thead>
              <tbody id="adm-categories-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 5.4 แท็บตั้งค่า (Contact Settings) -->
      <section id="admin-sub-settings" class="admin-subview admin-content">
        <div class="admin-title-row">
          <div><span class="eyebrow">SYSTEM SETTINGS</span><h1>ตั้งค่าข้อมูลติดต่อศูนย์ ICT</h1></div>
        </div>
        <div id="settings-notice-box"></div>
        <form class="admin-form" onsubmit="submitContactSettings(event)">
          <div class="admin-form-grid">
            <label>เบอร์โทรศัพท์ <input id="set-phone" /></label>
            <label>ไอดี LINE <input id="set-lineId" /></label>
            <label>ลิงก์ LINE <input id="set-lineUrl" /></label>
            <label>อีเมล <input id="set-email" /></label>
            <label>ที่ตั้งศูนย์ ICT <input id="set-location" /></label>
            <label>เวลาทำการ <input id="set-hours" /></label>
          </div>
          <label>หมายเหตุ <textarea id="set-note" rows="3"></textarea></label>
          <div class="admin-form-actions">
            <button type="submit" class="admin-primary-link">บันทึกข้อมูลติดต่อ</button>
          </div>
        </form>
      </section>
    </div>
  </main>

  <!-- ===================================================================== -->
  <!-- ส่วนท้ายเว็บไซต์ 4 คอลัมน์ (PUBLIC FOOTER) & แถบเมนูมือถือด้านล่าง         -->
  <!-- ===================================================================== -->
  <div id="public-chrome-bottom">
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-col footer-brand-col">
          <div class="footer-brand-head">
            <div class="footer-brand-emblems">
              <span class="footer-emblem-circle"><img data-asset="/logo-khonkaen.png" alt="ตราเทศบาลนครขอนแก่น" /></span>
              <span class="footer-emblem-tile"><img data-asset="/logo-ict.png" alt="ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น" /></span>
            </div>
            <div class="footer-brand-titles">
              <b>คลังความรู้และคู่มือบริการไอที (KKICT)</b>
              <small>เทศบาลนครขอนแก่น · KHON KAEN ICT LEARNING CENTER</small>
            </div>
          </div>
          <p class="footer-brand-desc">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น แหล่งรวบรวมคู่มือมาตรฐาน ขั้นตอนการตั้งค่า และวิธีแก้ไขปัญหาด้านเทคโนโลยีสารสนเทศ คอมพิวเตอร์ เครือข่าย และอุปกรณ์สำนักงานด้วยตนเอง สำหรับบุคลากรและประชาชน</p>
          <div class="footer-brand-site">
            <span class="footer-gold-dot"></span>
            <span>ศูนย์พัฒนาทักษะและการเรียนรู้ ICT ขอนแก่น · <a href="https://www.kkict.net/" target="_blank" rel="noreferrer">www.kkict.net ↗</a></span>
          </div>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">เกี่ยวกับเรา</h3>
          <ul class="footer-links">
            <li><a href="#home" onclick="navigateTo('home'); return false;">หน้าแรกคลังความรู้</a></li>
            <li><a href="#articles" onclick="navigateTo('articles'); return false;">คลังความรู้และคู่มือทั้งหมด</a></li>
            <li><a href="#saved" onclick="navigateTo('articles', { saved: '1' }); return false;">★ คู่มือที่บันทึกไว้</a></li>
            <li><a href="#popular" onclick="navigateTo('articles', { sort: 'popular' }); return false;">คู่มือยอดนิยมประจำศูนย์</a></li>
            <li><a href="https://www.kkict.net/" target="_blank" rel="noreferrer">เว็บไซต์หลัก kkict.net ↗</a></li>
            <li><a href="#admin" onclick="goStaffPortal(); return false;">เข้าสู่ระบบเจ้าหน้าที่</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">หมวดหมู่คู่มือบริการ</h3>
          <ul class="footer-links" id="footer-category-links">
            <li><a href="#cat1" onclick="navigateTo('articles', { category: '1' }); return false;">คอมพิวเตอร์และอุปกรณ์</a></li>
            <li><a href="#cat2" onclick="navigateTo('articles', { category: '2' }); return false;">ระบบเครือข่ายและอินเทอร์เน็ต</a></li>
            <li><a href="#cat3" onclick="navigateTo('articles', { category: '3' }); return false;">โปรแกรมและซอฟต์แวร์</a></li>
            <li><a href="#cat4" onclick="navigateTo('articles', { category: '4' }); return false;">เครื่องพิมพ์และอุปกรณ์ต่อพ่วง</a></li>
            <li><a href="#cat5" onclick="navigateTo('articles', { category: '5' }); return false;">ระบบสารสนเทศและบริการออนไลน์</a></li>
          </ul>
        </div>

        <div class="footer-col footer-contact-col">
          <h3 class="footer-heading">ติดต่อศูนย์ ICT</h3>
          <ul class="footer-contact-list">
            <li><span>ชั้น 2 ตลาดสดเทศบาล 1 ถนนกลางเมือง ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000</span></li>
            <li><span>โทรศัพท์: <a href="tel:0845830208"><b>084-583-0208</b></a></span></li>
            <li><span>อีเมล: <a href="mailto:info.kkict@gmail.com"><b>info.kkict@gmail.com</b></a></span></li>
            <li><span class="footer-line-item">LINE: <a href="https://line.me/R/ti/g/sTeVI-fA9K" target="_blank" rel="noreferrer"><b>KKICT-Training</b></a> <button type="button" class="footer-qr-btn" onclick="openLineQrModal()">📱 QR Code</button></span></li>
            <li><span>Facebook: <a href="https://www.facebook.com/KKICT/?ref=embed_page#" target="_blank" rel="noreferrer"><b>ศูนย์ ICT ขอนแก่น (KKICT)</b></a></span></li>
            <li><span>เวลาทำการ: อังคาร – อาทิตย์ เวลา 09:00 – 17:00 น. (หยุดวันจันทร์และวันหยุดนักขัตฤกษ์)</span></li>
          </ul>
          <div class="footer-social-row">
            <a href="https://www.facebook.com/KKICT/?ref=embed_page#" target="_blank" rel="noreferrer" aria-label="Facebook KKICT">f</a>
            <a href="https://line.me/R/ti/g/sTeVI-fA9K" target="_blank" rel="noreferrer" aria-label="LINE KKICT-Training">L</a>
            <a href="https://www.kkict.net/" target="_blank" rel="noreferrer" aria-label="Website">🌐</a>
            <a href="mailto:info.kkict@gmail.com" aria-label="Email">✉</a>
            <a href="tel:0845830208" aria-label="Phone">☎</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="shell footer-bottom-inner">
          <span>Copyright © 2026 ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (KKICT). All rights reserved.</span>
        </div>
      </div>
    </footer>

    <nav class="mobile-bottom-nav" aria-label="แถบเมนูหลักบนมือถือ">
      <a href="#home" id="mnav-home" class="active" onclick="navigateTo('home'); return false;"><span class="mnav-icon">⌂</span><small>หน้าแรก</small></a>
      <a href="#articles" id="mnav-articles" onclick="navigateTo('articles'); return false;"><span class="mnav-icon">▤</span><small>คลังคู่มือ</small></a>
      <a href="#search" id="mnav-search" onclick="navigateTo('articles'); return false;"><span class="mnav-icon">⌕</span><small>ค้นหา</small></a>
      <a href="#saved" id="mnav-saved" onclick="navigateTo('articles', { saved: '1' }); return false;"><span class="mnav-icon">★<i class="mnav-badge" data-saved-count style="display:none;">0</i></span><small>ที่บันทึก</small></a>
      <a href="#admin" onclick="goStaffPortal(); return false;"><span class="mnav-icon">⚙</span><small>เจ้าหน้าที่</small></a>
    </nav>
  </div>

  <!-- หน้าต่าง Modal แสดง QR Code LINE (KKICT-Training) -->
  <div id="line-qr-modal" class="lightbox line-qr-modal" style="display:none;" onclick="closeLineQrModal()">
    <div class="line-qr-dialog" onclick="event.stopPropagation()">
      <button type="button" class="line-qr-close" onclick="closeLineQrModal()">×</button>
      <span class="eyebrow">LINE OFFICIAL · KKICT</span>
      <h3>สแกน QR Code เพื่อติดต่อทาง LINE</h3>
      <p>ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น</p>
      <div class="line-qr-frame">
        <img data-asset="/line-qr.png" alt="LINE QR Code KKICT-Training" />
      </div>
      <div class="line-qr-actions">
        <a class="share-button share-line-btn" href="https://line.me/R/ti/g/sTeVI-fA9K" target="_blank" rel="noreferrer">
          <span>💬 เปิดแชต LINE (KKICT-Training) ↗</span>
        </a>
      </div>
    </div>
  </div>

  <!-- หน้าต่าง Lightbox ขยายรูปภาพประกอบบทความ -->
  <div id="image-lightbox" class="lightbox" style="display:none;" onclick="closeImageLightbox()">
    <button type="button" class="lightbox-close" onclick="closeImageLightbox()">×</button>
    <div class="lightbox-stage" onclick="event.stopPropagation()">
      <img id="lightbox-img" src="" alt="ภาพขยาย" />
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- JAVASCRIPT ควบคุมการทำงานทั้งหมดในไฟล์เดียว (เชื่อมฐานข้อมูล MySQL)     -->
  <!-- ===================================================================== -->
  <script>
    const API_HOST = window.location.hostname || 'localhost';
    const API_ORIGIN = (window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '5173')
      ? ('http://' + API_HOST + ':3000')
      : window.location.origin;
    const API_BASE = API_ORIGIN + '/api';
    const BOOKMARKS_KEY = 'ict-bookmarked-guides';
    const RECENT_KEY = 'ict-recently-viewed-guides';
    const TOKEN_KEY = 'ict-admin-token';
    const CATEGORY_ICONS = ['▣', '⌁', '▤', '▧', '◉'];

    let currentLang = localStorage.getItem('ict-lang') || 'th';
    let listingState = { q: '', category: '', saved: '', sort: 'recent', page: 1 };
    let personalShelfTab = 'saved';
    let articlesCache = new Map();
    let adminArticlesList = [];
    let adminCategoriesList = [];
    let monthlyArticlesAll = [];
    let monthlyPage = 1;
    const MONTHLY_PAGE_SIZE = 5;

    function escapeHtml(text) {
      return String(text ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function assetUrl(path) {
      if (!path) return '';
      if (/^https?:\\/\\//i.test(path) || path.startsWith('data:')) return path;
      return API_ORIGIN + (path.startsWith('/') ? path : '/' + path);
    }

    function initStaticAssets() {
      document.querySelectorAll('[data-asset]').forEach((img) => {
        img.src = assetUrl(img.getAttribute('data-asset'));
      });
    }

    function formatDate(dateStr) {
      if (!dateStr) return '—';
      try {
        return new Intl.DateTimeFormat(currentLang === 'en' ? 'en-US' : 'th-TH', { dateStyle: 'medium' }).format(new Date(dateStr));
      } catch {
        return String(dateStr);
      }
    }

    function setLanguage(lang) {
      currentLang = lang === 'en' ? 'en' : 'th';
      localStorage.setItem('ict-lang', currentLang);
      document.getElementById('lang-btn-th')?.classList.toggle('active', currentLang === 'th');
      document.getElementById('lang-btn-en')?.classList.toggle('active', currentLang === 'en');
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const [th, en] = el.getAttribute('data-i18n').split('|');
        el.textContent = currentLang === 'en' ? (en || th) : th;
      });
    }

    function getStoredList(key) {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }

    function setStoredList(key, list) {
      try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
    }

    function isBookmarked(articleId) {
      const id = Number(articleId);
      return getStoredList(BOOKMARKS_KEY).some((item) => Number(item.articleId) === id);
    }

    function toggleBookmarkById(articleId, event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      const id = Number(articleId);
      const article = articlesCache.get(id) || getStoredList(BOOKMARKS_KEY).find((a) => Number(a.articleId) === id) || getStoredList(RECENT_KEY).find((a) => Number(a.articleId) === id);
      if (!article) return;
      const list = getStoredList(BOOKMARKS_KEY);
      const exists = list.some((item) => Number(item.articleId) === id);
      const next = exists
        ? list.filter((item) => Number(item.articleId) !== id)
        : [article, ...list.filter((item) => Number(item.articleId) !== id)].slice(0, 30);
      setStoredList(BOOKMARKS_KEY, next);
      updateSavedBadges();
      renderPersonalShelf();
      document.querySelectorAll('[data-bm-card="' + id + '"]').forEach((btn) => {
        btn.classList.toggle('active', !exists);
        btn.textContent = !exists ? '★' : '☆';
      });
      const detailBtn = document.getElementById('detail-bm-btn');
      if (detailBtn && Number(detailBtn.getAttribute('data-id')) === id) {
        detailBtn.classList.toggle('active', !exists);
        detailBtn.textContent = !exists ? '★ บันทึกคู่มือแล้ว' : '☆ บันทึกคู่มือนี้';
      }
      if (listingState.saved === '1') loadListingView();
    }

    function recordRecentView(article) {
      if (!article || !article.articleId) return;
      const id = Number(article.articleId);
      const list = getStoredList(RECENT_KEY);
      const next = [article, ...list.filter((item) => Number(item.articleId) !== id)].slice(0, 8);
      setStoredList(RECENT_KEY, next);
      renderPersonalShelf();
    }

    function updateSavedBadges() {
      const count = getStoredList(BOOKMARKS_KEY).length;
      document.querySelectorAll('[data-saved-count]').forEach((el) => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-grid' : 'none';
      });
    }

    function getAdminToken() {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
    }

    async function apiRequest(method, path, body = null, auth = false) {
      const headers = {};
      if (auth) {
        const token = getAdminToken();
        if (token) headers.Authorization = 'Bearer ' + token;
      }
      const opts = { method, headers };
      if (body instanceof FormData) {
        opts.body = body;
      } else if (body !== null) {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(API_BASE + path, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      return data;
    }

    // --- การสลับหน้าภายในไฟล์เดียว (Single-File Navigation) ---
    function navigateTo(view, params = {}) {
      const isAdminView = view === 'admin';
      const isLoginView = view === 'login';
      document.getElementById('public-chrome-top').style.display = (isAdminView || isLoginView) ? 'none' : 'block';
      document.getElementById('public-chrome-bottom').style.display = (isAdminView || isLoginView) ? 'none' : 'block';

      ['home', 'articles', 'detail', 'login'].forEach((v) => {
        document.getElementById('view-' + v)?.classList.toggle('is-active', v === view);
      });
      document.getElementById('view-admin')?.classList.toggle('is-active', isAdminView);

      document.getElementById('nav-link-home')?.classList.toggle('active', view === 'home');
      document.getElementById('nav-link-articles')?.classList.toggle('active', view === 'articles' && params.saved !== '1');
      document.getElementById('nav-link-saved')?.classList.toggle('active', view === 'articles' && params.saved === '1');
      document.getElementById('mnav-home')?.classList.toggle('active', view === 'home');
      document.getElementById('mnav-articles')?.classList.toggle('active', (view === 'articles' && params.saved !== '1') || view === 'detail');
      document.getElementById('mnav-saved')?.classList.toggle('active', view === 'articles' && params.saved === '1');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (view === 'home') {
        loadHomeView();
      } else if (view === 'articles') {
        listingState = {
          q: params.q || '',
          category: params.category || '',
          saved: params.saved || '',
          sort: params.sort || 'recent',
          page: Number(params.page) || 1,
        };
        loadListingView();
      } else if (view === 'detail') {
        loadDetailView(params.id);
      } else if (view === 'admin') {
        loadAdminPortal();
      }
    }

    function goStaffPortal() {
      if (getAdminToken()) navigateTo('admin');
      else navigateTo('login');
    }

    function renderArticleCardHtml(article) {
      articlesCache.set(Number(article.articleId), article);
      const saved = isBookmarked(article.articleId);
      const img = article.image || (Array.isArray(article.images) && article.images[0]) || '';
      const catName = article.category?.categoryName || 'คู่มือ ICT';
      const excerpt = String(article.content || '').replace(/^(เกริ่นนำ|Introduction)\\s*/i, '').slice(0, 120);
      return \`
        <article class="article-card">
          <div class="article-art-wrap">
            <a class="article-art" href="#article-\${article.articleId}" onclick="navigateTo('detail', { id: \${article.articleId} }); return false;">
              \${article.featured ? '<span class="featured-tag">แนะนำ</span>' : ''}
              \${img
                ? \`<img src="\${escapeHtml(assetUrl(img))}" alt="\${escapeHtml(article.title)}" loading="lazy" />\`
                : \`<div class="art-placeholder"><span>\${escapeHtml(catName)}</span><b>\${CATEGORY_ICONS[(Number(article.categoryId || 1) - 1) % 5]}</b><i>ICT GUIDE</i></div>\`}
            </a>
            <button type="button" class="card-bookmark-btn \${saved ? 'active' : ''}" data-bm-card="\${article.articleId}" onclick="toggleBookmarkById(\${article.articleId}, event)" title="บันทึกคู่มือนี้">\${saved ? '★' : '☆'}</button>
          </div>
          <div class="article-copy">
            <div class="article-meta">
              <span>\${escapeHtml(catName)}</span>
              <span>เข้าชม \${Number(article.viewCount || 0).toLocaleString('th-TH')} ครั้ง</span>
            </div>
            <h3><a href="#article-\${article.articleId}" onclick="navigateTo('detail', { id: \${article.articleId} }); return false;">\${escapeHtml(article.title)}</a></h3>
            <p>\${escapeHtml(excerpt)}…</p>
            <div class="article-bottom">
              <span>อัปเดต \${formatDate(article.updatedAt || article.publishedAt)}</span>
              <a href="#article-\${article.articleId}" onclick="navigateTo('detail', { id: \${article.articleId} }); return false;">อ่านคู่มือ <b>→</b></a>
            </div>
          </div>
        </article>
      \`;
    }

    function renderPersonalShelf() {
      const shelf = document.getElementById('home-personal-shelf');
      if (!shelf) return;
      const bookmarks = getStoredList(BOOKMARKS_KEY);
      const recents = getStoredList(RECENT_KEY);
      if (!bookmarks.length && !recents.length) {
        shelf.style.display = 'none';
        return;
      }
      shelf.style.display = 'block';
      const activeTab = (personalShelfTab === 'saved' && bookmarks.length) || !recents.length ? 'saved' : 'recent';
      const list = activeTab === 'saved' ? bookmarks.slice(0, 4) : recents.slice(0, 4);
      list.forEach((a) => articlesCache.set(Number(a.articleId), a));
      shelf.innerHTML = \`
        <div class="personal-shelf-box">
          <div class="personal-shelf-head">
            <div class="personal-shelf-title">
              <span class="eyebrow">PERSONAL QUICK ACCESS</span>
              <h2>คู่มือของคุณ — เปิดอ่านล่าสุด & ที่บันทึกไว้</h2>
            </div>
            <div class="personal-shelf-tabs">
              <button type="button" class="\${activeTab === 'saved' ? 'active' : ''}" onclick="personalShelfTab='saved'; renderPersonalShelf();">★ ที่บันทึกไว้ <span>\${bookmarks.length}</span></button>
              <button type="button" class="\${activeTab === 'recent' ? 'active' : ''}" onclick="personalShelfTab='recent'; renderPersonalShelf();">◷ เปิดอ่านล่าสุด <span>\${recents.length}</span></button>
            </div>
          </div>
          <div class="personal-mini-grid">
            \${list.map((item) => \`
              <div class="personal-mini-card">
                <a class="personal-mini-main" href="#article-\${item.articleId}" onclick="navigateTo('detail', { id: \${item.articleId} }); return false;">
                  <span class="personal-mini-icon">\${CATEGORY_ICONS[(Number(item.categoryId || 1) - 1) % 5]}</span>
                  <div class="personal-mini-copy">
                    <small>\${escapeHtml(item.category?.categoryName || 'คู่มือ ICT')}</small>
                    <b>\${escapeHtml(item.title)}</b>
                  </div>
                </a>
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    // --- 1. โหลดข้อมูลหน้าแรก (Home View) ---
    async function loadHomeView() {
      renderPersonalShelf();
      try {
        const [categories, featured, latest, contact] = await Promise.all([
          apiRequest('GET', '/categories'),
          apiRequest('GET', '/articles?featured=true&limit=6'),
          apiRequest('GET', '/articles?limit=6'),
          apiRequest('GET', '/settings/contact'),
        ]);
        document.getElementById('home-categories').innerHTML = categories.map((c, idx) => \`
          <a class="category-card" href="#cat-\${c.categoryId}" onclick="navigateTo('articles', { category: '\${c.categoryId}' }); return false;">
            <span class="category-icon color-\${idx % 5}">\${CATEGORY_ICONS[idx % 5]}</span>
            <span><b>\${escapeHtml(c.categoryName)}</b><small>\${c._count?.articles || 0} บทความ</small></span>
            <span class="arrow">→</span>
          </a>
        \`).join('');

        const featItems = featured.length ? featured : latest.slice(0, 3);
        document.getElementById('home-featured').innerHTML = featItems.map(renderArticleCardHtml).join('');
        document.getElementById('home-latest').innerHTML = latest.map(renderArticleCardHtml).join('');

        document.getElementById('home-contact-card').innerHTML = \`
          <section class="contact-card">
            <h2>ไม่พบคำตอบที่ต้องการ? ติดต่อเจ้าหน้าที่ศูนย์พัฒนาทักษะและการเรียนรู้ ICT ขอนแก่น</h2>
            <div class="contact-card-layout">
              <dl class="contact-details">
                <div><dt>โทรศัพท์</dt><dd><a href="tel:\${escapeHtml(contact.phone || '084-583-0208')}">\${escapeHtml(contact.phone || '084-583-0208')}</a></dd></div>
                <div><dt>LINE</dt><dd class="contact-line-dd"><a href="\${escapeHtml(contact.lineUrl || 'https://line.me/R/ti/g/sTeVI-fA9K')}" target="_blank" rel="noreferrer">\${escapeHtml(contact.lineId || 'KKICT-Training')}</a><button type="button" class="qr-inline-btn" onclick="openLineQrModal()">📱 สแกน QR</button></dd></div>
                <div><dt>Facebook</dt><dd><a href="https://www.facebook.com/KKICT/?ref=embed_page#" target="_blank" rel="noreferrer">ศูนย์พัฒนาทักษะและการเรียนรู้ ICT ขอนแก่น ↗</a></dd></div>
                <div><dt>อีเมล</dt><dd><a href="mailto:\${escapeHtml(contact.email || 'info.kkict@gmail.com')}">\${escapeHtml(contact.email || 'info.kkict@gmail.com')}</a></dd></div>
                <div><dt>ที่ตั้ง</dt><dd>\${escapeHtml(contact.location || '')}</dd></div>
                <div><dt>เวลาทำการ</dt><dd>\${escapeHtml(contact.hours || '')}</dd></div>
              </dl>
              <button type="button" class="contact-qr-box" onclick="openLineQrModal()">
                <img src="\${escapeHtml(assetUrl('/line-qr.png'))}" alt="LINE QR Code" />
                <span>🔍 คลิกขยาย QR Code</span>
              </button>
            </div>
          </section>
        \`;
      } catch (err) {
        document.getElementById('home-featured').innerHTML = \`<div class="notice error-notice"><b>เชื่อมต่อฐานข้อมูลไม่สำเร็จ</b><span>\${escapeHtml(err.message)}</span></div>\`;
      }
    }

    function submitHeroSearch(e) {
      e.preventDefault();
      const q = document.getElementById('home-search-input').value.trim();
      navigateTo('articles', { q });
    }

    // --- 2. โหลดข้อมูลหน้าคลังความรู้และค้นหา (Articles & Search View) ---
    async function loadListingView() {
      const searchInput = document.getElementById('listing-search-input');
      const sortSelect = document.getElementById('listing-sort-select');
      const assistBar = document.getElementById('listing-assist-bar');
      const bodyBox = document.getElementById('listing-results-body');
      searchInput.value = listingState.q;
      sortSelect.value = listingState.sort;
      assistBar.style.display = 'none';
      bodyBox.innerHTML = '<div class="loading">กำลังค้นหาบทความจากฐานข้อมูล MySQL...</div>';

      try {
        const categories = await apiRequest('GET', '/categories');
        const savedList = getStoredList(BOOKMARKS_KEY);
        document.getElementById('listing-filter-panel').innerHTML = \`
          <b>คลังส่วนตัว</b>
          <button type="button" class="is-saved-filter \${listingState.saved === '1' ? 'active' : ''}" onclick="navigateTo('articles', { saved: listingState.saved === '1' ? '' : '1' })">
            <span>★ คู่มือที่บันทึกไว้</span>
            <span class="filter-count-pill">\${savedList.length}</span>
          </button>
          <b class="filter-section-title">หมวดหมู่ความรู้</b>
          <button type="button" class="\${!listingState.category && listingState.saved !== '1' ? 'active' : ''}" onclick="navigateTo('articles', { q: listingState.q })">ทั้งหมด</button>
          \${categories.map((c) => \`
            <button type="button" class="\${String(c.categoryId) === String(listingState.category) && listingState.saved !== '1' ? 'active' : ''}" onclick="navigateTo('articles', { category: '\${c.categoryId}', q: listingState.q })">\${escapeHtml(c.categoryName)}</button>
          \`).join('')}
        \`;

        if (listingState.saved === '1') {
          document.getElementById('listing-heading').textContent = '★ คู่มือที่บันทึกไว้';
          document.getElementById('listing-total-label').textContent = savedList.length + ' บทความ';
          bodyBox.innerHTML = savedList.length
            ? \`<div class="article-grid">\${savedList.map(renderArticleCardHtml).join('')}</div>\`
            : \`<div class="empty-state"><span>★</span><b>ยังไม่มีคู่มือที่บันทึกไว้</b><p>กดปุ่ม ☆ บนการ์ดบทความหรือในหน้าอ่านคู่มือเพื่อบันทึกเก็บไว้เปิดดูที่นี่ได้ทันที</p></div>\`;
          return;
        }

        const selectedCat = categories.find((c) => String(c.categoryId) === String(listingState.category));
        document.getElementById('listing-heading').textContent = listingState.q
          ? \`ผลการค้นหา “\${listingState.q}”\`
          : (selectedCat ? selectedCat.categoryName : 'คลังความรู้และคู่มือ');

        const qParams = new URLSearchParams({
          q: listingState.q,
          category: listingState.category,
          sort: listingState.sort,
          page: String(listingState.page),
          pageSize: '9',
        });
        const res = await apiRequest('GET', '/articles/search?' + qParams.toString());
        document.getElementById('listing-total-label').textContent = (res.total || 0) + ' บทความ';

        if (listingState.q && res.suggestions && res.suggestions.length > 0 && res.items.length > 0) {
          assistBar.style.display = 'flex';
          assistBar.innerHTML = \`
            <span>💡 คำค้นที่ใกล้เคียง:</span>
            \${res.suggestions.map((term) => \`<button type="button" class="suggestion-chip" onclick="navigateTo('articles', { q: '\${escapeHtml(term)}' })">\${escapeHtml(term)}</button>\`).join('')}
          \`;
        }

        if (res.items && res.items.length) {
          const pagerHtml = res.pageCount > 1 ? \`
            <nav class="pagination">
              <button type="button" \${res.page <= 1 ? 'disabled' : ''} onclick="navigateTo('articles', { ...listingState, page: \${res.page - 1} })">← ก่อนหน้า</button>
              <span>หน้า \${res.page} จาก \${res.pageCount}</span>
              <button type="button" \${res.page >= res.pageCount ? 'disabled' : ''} onclick="navigateTo('articles', { ...listingState, page: \${res.page + 1} })">ถัดไป →</button>
            </nav>
          \` : '';
          bodyBox.innerHTML = \`<div class="article-grid">\${res.items.map(renderArticleCardHtml).join('')}</div>\${pagerHtml}\`;
        } else {
          bodyBox.innerHTML = \`
            <div class="empty-state search-empty-box">
              <span>⌕</span>
              <b>ไม่พบบทความที่ตรงกับคำว่า “\${escapeHtml(listingState.q)}”</b>
              <p>อาจเกิดจากการสะกดคำผิดหรือลืมเปลี่ยนภาษาแป้นพิมพ์ — ลองเลือกคำค้นใกล้เคียงด้านล่างได้เลยครับ</p>
              \${res.didYouMean ? \`<div class="did-you-mean-row"><span>💡 คุณหมายถึงคำนี้หรือไม่:</span><button type="button" class="did-you-mean-btn" onclick="navigateTo('articles', { q: '\${escapeHtml(res.didYouMean)}' })">⌕ ค้นหาคำว่า “\${escapeHtml(res.didYouMean)}”</button></div>\` : ''}
              \${(res.suggestions && res.suggestions.length) ? \`<div class="suggestions-block"><div class="suggestion-chip-list">\${res.suggestions.map((t) => \`<button type="button" class="suggestion-chip" onclick="navigateTo('articles', { q: '\${escapeHtml(t)}' })">\${escapeHtml(t)}</button>\`).join('')}</div></div>\` : ''}
            </div>
            \${(res.suggestedArticles && res.suggestedArticles.length) ? \`<div class="suggested-articles-section"><h2>คู่มือที่ใกล้เคียงกับคำค้นของคุณ</h2><div class="article-grid">\${res.suggestedArticles.map(renderArticleCardHtml).join('')}</div></div>\` : ''}
          \`;
        }
      } catch (err) {
        bodyBox.innerHTML = \`<div class="notice error-notice"><b>เกิดข้อผิดพลาด</b><span>\${escapeHtml(err.message)}</span></div>\`;
      }
    }

    function submitListingSearch(e) {
      e.preventDefault();
      const q = document.getElementById('listing-search-input').value.trim();
      navigateTo('articles', { q, category: listingState.category, sort: listingState.sort });
    }

    function changeListingSort(sort) {
      navigateTo('articles', { ...listingState, sort, page: 1 });
    }

    // --- 3. โหลดข้อมูลหน้าอ่านรายละเอียดคู่มือ (Article Detail View) ---
    async function loadDetailView(articleId) {
      const box = document.getElementById('detail-view-body');
      box.innerHTML = '<div class="loading">กำลังโหลดเนื้อหาคู่มือ...</div>';
      try {
        const article = await apiRequest('GET', '/articles/' + encodeURIComponent(articleId));
        articlesCache.set(Number(article.articleId), article);
        recordRecentView(article);
        const saved = isBookmarked(article.articleId);
        const steps = Array.isArray(article.steps) ? article.steps : [];
        const paragraphs = String(article.content || '').split(/\\n{2,}/).filter(Boolean);
        const images = Array.isArray(article.images) && article.images.length ? article.images : (article.image ? [article.image] : []);
        const keywords = Array.isArray(article.keywords) ? article.keywords : [];

        box.innerHTML = \`
          <header class="article-hero-card">
            <div class="article-hero-main">
              <div class="breadcrumbs">
                <a href="#home" onclick="navigateTo('home'); return false;">หน้าแรก</a><span>/</span>
                <a href="#cat" onclick="navigateTo('articles', { category: '\${article.categoryId}' }); return false;">\${escapeHtml(article.category?.categoryName || 'คลังบทความ')}</a><span>/</span>
                <span>\${escapeHtml(article.title)}</span>
              </div>
              <h1>\${escapeHtml(article.title)}</h1>
              <div class="detail-stats">
                <span>◷ เข้าชม \${Number(article.viewCount || 0).toLocaleString('th-TH')} ครั้ง</span>
                <span>✎ อัปเดตล่าสุด \${formatDate(article.updatedAt)}</span>
                \${steps.length ? \`<span>✓ \${steps.length} ขั้นตอนปฏิบัติ</span>\` : ''}
              </div>
              <div class="article-tools">
                <button type="button" id="detail-bm-btn" data-id="\${article.articleId}" class="bookmark-action-btn \${saved ? 'active' : ''}" onclick="toggleBookmarkById(\${article.articleId}, event)">
                  \${saved ? '★ บันทึกคู่มือแล้ว' : '☆ บันทึกคู่มือนี้'}
                </button>
                <button type="button" class="print-button" onclick="window.print()">▤ พิมพ์คู่มือ / บันทึกเป็น PDF</button>
                \${article.pdfFile ? \`<button type="button" class="print-button" onclick="toggleEmbeddedPdf(true)">👁 อ่าน PDF บนเว็บ</button>\` : ''}
                \${article.pdfFile ? \`<a class="download-button hero-pdf-btn" href="\${escapeHtml(assetUrl(article.pdfFile))}" download>⬇ ดาวน์โหลด PDF</a>\` : ''}
              </div>
            </div>
          </header>

          <div class="detail-layout">
            <article class="detail-main" id="detail-reader-article">
              \${images.length ? \`
                <div class="detail-gallery-box">
                  <button type="button" class="detail-image-button" onclick="openImageLightbox(document.getElementById('detail-main-img').src)">
                    <img class="detail-image" id="detail-main-img" src="\${escapeHtml(assetUrl(images[0]))}" alt="\${escapeHtml(article.title)}" />
                    <span>🔍 คลิกเพื่อดูภาพขยาย</span>
                  </button>
                  \${images.length > 1 ? \`
                    <div class="detail-gallery-strip">
                      \${images.map((img, idx) => \`
                        <button type="button" class="gallery-thumb-btn \${idx === 0 ? 'active' : ''}" onclick="document.getElementById('detail-main-img').src='\${escapeHtml(assetUrl(img))}';">
                          <img src="\${escapeHtml(assetUrl(img))}" alt="รูปที่ \${idx + 1}" />
                          <small>รูปที่ \${idx + 1}</small>
                        </button>
                      \`).join('')}
                    </div>
                  \` : ''}
                </div>
              \` : ''}

              <div class="article-content">
                <div class="content-section-bar">
                  <div>
                    <span>📖 รายละเอียดและคำอธิบายประกอบ</span>
                    <small>อ่านทำความเข้าใจก่อนเริ่มปฏิบัติตามขั้นตอน</small>
                  </div>
                  <div class="font-scale-controls">
                    <small>ขนาดตัวอักษร</small>
                    <button type="button" class="active" onclick="setReaderFontScale('normal', this)">ก</button>
                    <button type="button" onclick="setReaderFontScale('large', this)">ก+</button>
                    <button type="button" onclick="setReaderFontScale('xlarge', this)">ก++</button>
                  </div>
                </div>
                \${paragraphs.map((p) => \`<p>\${escapeHtml(p)}</p>\`).join('')}
              </div>

              \${steps.length ? \`
                <section class="steps-box">
                  <div class="steps-box-head">
                    <div><span class="eyebrow">STEP-BY-STEP WORKFLOW</span><h2>ขั้นตอนการแก้ไขปัญหาอย่างเป็นลำดับ</h2></div>
                    <span class="steps-count-pill">\${steps.length} ขั้นตอน</span>
                  </div>
                  <ol>\${steps.map((s) => \`<li>\${escapeHtml(String(s).replace(/^\\s*\\d+[.)]\\s*/, ''))}</li>\`).join('')}</ol>
                </section>
              \` : ''}

              \${article.pdfFile ? \`
                <section id="detail-pdf-section" class="pdf-banner">
                  <div class="pdf-banner-top">
                    <div class="pdf-banner-info">
                      <span class="pdf-emblem">PDF</span>
                      <div>
                        <b>คู่มือฉบับสมบูรณ์พร้อมพิมพ์ (PDF A4)</b>
                        <p>กดเปิดอ่านบนหน้าเว็บนี้ได้ทันทีเหมือน E-Book หรือดาวน์โหลดเก็บไว้ในเครื่องเพื่อเปิดดูแบบออฟไลน์</p>
                      </div>
                    </div>
                    <div class="pdf-banner-actions">
                      <button type="button" id="pdf-toggle-btn" class="pdf-toggle-btn" onclick="toggleEmbeddedPdf()">👁 เปิดอ่าน PDF บนหน้าเว็บนี้</button>
                      <a class="print-button" href="\${escapeHtml(assetUrl(article.pdfFile))}" target="_blank" rel="noreferrer">↗ เปิดแท็บใหม่</a>
                      <a class="download-button" href="\${escapeHtml(assetUrl(article.pdfFile))}" download>⬇ ดาวน์โหลด PDF</a>
                    </div>
                  </div>
                  <div id="embedded-pdf-shell" class="pdf-viewer-shell" style="display:none;">
                    <div class="pdf-viewer-bar">
                      <span>📄 กำลังแสดงคู่มือ PDF: <b>\${escapeHtml(article.title)}</b></span>
                      <div class="pdf-viewer-tools">
                        <button type="button" onclick="toggleEmbeddedPdf(false)">× ปิดหน้าต่างอ่าน</button>
                      </div>
                    </div>
                    <iframe class="pdf-viewer-frame" src="\${escapeHtml(assetUrl(article.pdfFile))}#view=FitH" title="PDF Reader"></iframe>
                  </div>
                </section>
              \` : ''}

              \${keywords.length ? \`
                <div class="article-keywords">
                  <b>คำค้นและหัวข้อที่เกี่ยวข้อง:</b>
                  <div class="keyword-list">
                    \${keywords.map((kw) => \`<a class="keyword-tag" href="#kw" onclick="navigateTo('articles', { q: '\${escapeHtml(kw)}' }); return false;">#\${escapeHtml(kw)}</a>\`).join('')}
                  </div>
                </div>
              \` : ''}
            </article>

            <aside class="detail-aside">
              <div class="aside-card aside-master-card">
                <div class="aside-master-head">
                  <span class="aside-master-icon">\${CATEGORY_ICONS[(Number(article.categoryId || 1) - 1) % 5]}</span>
                  <div><span class="eyebrow">GUIDE INFO</span><b>รายละเอียดบทความ</b></div>
                </div>
                <div class="aside-stat-tiles">
                  <div class="aside-tile"><small>จำนวนขั้นตอน</small><b>\${steps.length} ขั้นตอน</b></div>
                  <div class="aside-tile is-gold"><small>จำนวนเข้าชม</small><b>\${Number(article.viewCount || 0).toLocaleString('th-TH')} ครั้ง</b></div>
                </div>
                <div class="aside-meta-list">
                  <p>หมวดหมู่ <a href="#cat" onclick="navigateTo('articles', { category: '\${article.categoryId}' }); return false;">\${escapeHtml(article.category?.categoryName || '')}</a></p>
                  <p>เผยแพร่เมื่อ <span>\${formatDate(article.publishedAt || article.createdAt)}</span></p>
                  <p>แก้ไขล่าสุด <span>\${formatDate(article.updatedAt)}</span></p>
                </div>
                \${article.pdfFile ? \`<a class="aside-pdf-cta" href="\${escapeHtml(assetUrl(article.pdfFile))}" download>⬇ ดาวน์โหลดคู่มือ PDF (A4)</a>\` : ''}
              </div>
            </aside>
          </div>
        \`;
      } catch (err) {
        box.innerHTML = \`<div class="notice error-notice"><b>ไม่พบบทความนี้</b><span>\${escapeHtml(err.message)}</span></div>\`;
      }
    }

    function setReaderFontScale(scale, btn) {
      const articleEl = document.getElementById('detail-reader-article');
      if (articleEl) articleEl.className = 'detail-main reader-scale-' + scale;
      btn.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    }

    function toggleEmbeddedPdf(forceState) {
      const shell = document.getElementById('embedded-pdf-shell');
      const btn = document.getElementById('pdf-toggle-btn');
      if (!shell) return;
      const show = typeof forceState === 'boolean' ? forceState : shell.style.display === 'none';
      shell.style.display = show ? 'block' : 'none';
      if (btn) {
        btn.classList.toggle('active', show);
        btn.textContent = show ? '▴ ซ่อนหน้าต่างอ่าน PDF' : '👁 เปิดอ่าน PDF บนหน้าเว็บนี้';
      }
      if (show) document.getElementById('detail-pdf-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    // --- 4. ระบบเข้าสู่ระบบและตั้งรหัสผ่านใหม่ของเจ้าหน้าที่ (Admin Auth) ---
    function switchAuthMode(mode) {
      document.getElementById('tab-mode-login').classList.toggle('active', mode === 'login');
      document.getElementById('tab-mode-reset').classList.toggle('active', mode === 'reset');
      document.getElementById('auth-box-login').style.display = mode === 'login' ? 'block' : 'none';
      document.getElementById('auth-box-reset').style.display = mode === 'reset' ? 'block' : 'none';
    }

    async function submitAdminLogin(e) {
      e.preventDefault();
      const errEl = document.getElementById('admin-login-error');
      errEl.style.display = 'none';
      const username = document.getElementById('admin-login-user').value.trim();
      const password = document.getElementById('admin-login-pass').value;
      try {
        const res = await apiRequest('POST', '/auth/login', { username, password });
        sessionStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(TOKEN_KEY, res.token);
        navigateTo('admin');
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
      }
    }

    async function submitAdminReset(e) {
      e.preventDefault();
      const errEl = document.getElementById('admin-reset-error');
      const noticeEl = document.getElementById('admin-login-notice');
      errEl.style.display = 'none';
      const username = document.getElementById('admin-reset-user').value.trim();
      const fullname = document.getElementById('admin-reset-fullname').value.trim();
      const newPassword = document.getElementById('admin-reset-pass').value;
      try {
        const res = await apiRequest('POST', '/auth/reset-password', { username, fullname, newPassword });
        switchAuthMode('login');
        noticeEl.textContent = '✓ ' + (res.message || 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว');
        noticeEl.style.display = 'block';
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = 'block';
      }
    }

    function logoutAdmin() {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      navigateTo('login');
    }

    // --- 5. ระบบจัดการหลังบ้านสำหรับเจ้าหน้าที่ (Admin Portal) ---
    function switchAdminTab(tab) {
      ['dashboard', 'articles', 'categories', 'settings'].forEach((t) => {
        document.getElementById('adm-nav-' + t)?.classList.toggle('active', t === tab);
        document.getElementById('admin-sub-' + t)?.classList.toggle('is-active', t === tab);
      });
      if (tab === 'dashboard') loadAdminDashboardData();
      if (tab === 'articles') { closeArticleEditor(); loadAdminArticlesData(); }
      if (tab === 'categories') loadAdminCategoriesData();
      if (tab === 'settings') loadAdminSettingsData();
    }

    async function loadAdminPortal() {
      try {
        const me = await apiRequest('GET', '/auth/me', null, true);
        const name = me.admin?.fullname || 'เจ้าหน้าที่ศูนย์ ICT';
        document.getElementById('admin-user-fullname').textContent = name;
        document.getElementById('admin-user-avatar').textContent = name.slice(0, 1);
        switchAdminTab('dashboard');
      } catch {
        logoutAdmin();
      }
    }

    async function loadAdminDashboardData(selectedMonth = '') {
      try {
        const [dash, monthly, insights] = await Promise.all([
          apiRequest('GET', '/admin/dashboard', null, true),
          apiRequest('GET', '/admin/reports/monthly' + (selectedMonth ? '?month=' + encodeURIComponent(selectedMonth) : ''), null, true),
          apiRequest('GET', '/admin/insights?days=30', null, true),
        ]);

        document.getElementById('dash-kpi-grid').innerHTML = \`
          <div class="dash-kpi is-green"><span class="dash-kpi-icon">✓</span><div><small>บทความที่เผยแพร่</small><b>\${dash.publishedCount}</b><p>จากทั้งหมด \${dash.articleCount} บทความ</p></div></div>
          <div class="dash-kpi is-blue"><span class="dash-kpi-icon">◉</span><div><small>ยอดเข้าชมสะสม</small><b>\${Number(dash.totalViews || 0).toLocaleString('th-TH')}</b><p>ครั้งที่มีผู้เปิดอ่านคู่มือ</p></div></div>
          <div class="dash-kpi is-gold"><span class="dash-kpi-icon">★</span><div><small>ความพึงพอใจ</small><b>\${dash.helpfulPercent}%</b><p>มีประโยชน์ \${dash.helpfulCount} จาก \${dash.feedbackCount} โหวต</p></div></div>
          <div class="dash-kpi is-purple"><span class="dash-kpi-icon">▣</span><div><small>หมวดหมู่ความรู้</small><b>\${dash.categoryCount}</b><p>ฐานข้อมูล MySQL</p></div></div>
        \`;

        const monthSelect = document.getElementById('dash-month-select');
        monthSelect.innerHTML = (monthly.availableMonths || []).map((m) => \`<option value="\${escapeHtml(m.value)}" \${m.value === monthly.month ? 'selected' : ''}>\${escapeHtml(m.label)}</option>\`).join('');

        document.getElementById('dash-month-stats').innerHTML = \`
          <div><small>เผยแพร่ในเดือนนี้</small><b>\${monthly.summary.publishedInMonthCount} <span>บทความ</span></b></div>
          <div class="is-accent"><small>ยอดเข้าชมในเดือนนี้</small><b>\${Number(monthly.summary.totalViewsInMonth || 0).toLocaleString('th-TH')} <span>ครั้ง</span></b></div>
          <div><small>การค้นหาในเดือนนี้</small><b>\${Number(monthly.summary.searchesInMonthCount || 0).toLocaleString('th-TH')} <span>ครั้ง</span></b></div>
          <div><small>ความพึงพอใจในเดือนนี้</small><b>\${monthly.summary.satisfactionPercentInMonth}% <span>(\${monthly.summary.feedbackHelpfulInMonth}/\${monthly.summary.feedbackTotalInMonth} โหวต)</span></b></div>
        \`;

        document.getElementById('dash-month-list-title').textContent = 'บทความที่สร้าง/เผยแพร่ในเดือน ' + monthly.monthLabel;
        monthlyArticlesAll = monthly.articlesInMonth || [];
        document.getElementById('dash-month-count-pill').textContent = monthlyArticlesAll.length + ' บทความ';
        monthlyPage = 1;
        renderMonthlyArticlesPage();

        const zeroTerms = insights.zeroResultTerms || [];
        document.getElementById('dash-zero-terms').innerHTML = zeroTerms.length
          ? zeroTerms.slice(0, 5).map((item) => \`
              <li class="dash-term-row">
                <div class="dash-term-main"><b>“\${escapeHtml(item.term)}”</b><small>ค้นหา \${item.count} ครั้ง</small></div>
                <div class="term-row-actions">
                  <button type="button" class="danger-action delete-term-btn" onclick="deleteSearchTerm('\${escapeHtml(item.term)}')">ลบ</button>
                </div>
              </li>
            \`).join('')
          : '<p class="dashboard-empty">ยังไม่มีคำค้นที่ไม่พบผลลัพธ์</p>';

        const topTerms = insights.topTerms || [];
        document.getElementById('dash-top-terms').innerHTML = topTerms.length
          ? topTerms.slice(0, 5).map((item, idx) => \`
              <li class="dash-term-row">
                <span class="rank-badge rank-\${idx + 1}">\${idx + 1}</span>
                <div class="dash-term-main"><b>\${escapeHtml(item.term)}</b></div>
                <span class="dash-term-count">\${item.count} ครั้ง</span>
                <button type="button" class="danger-action delete-term-btn" onclick="deleteSearchTerm('\${escapeHtml(item.term)}')">ลบ</button>
              </li>
            \`).join('')
          : '<p class="dashboard-empty">ยังไม่มีข้อมูลคำค้น</p>';
      } catch (err) {
        document.getElementById('dash-notice-box').innerHTML = \`<div class="admin-alert">\${escapeHtml(err.message)}</div>\`;
      }
    }

    function renderMonthlyArticlesPage() {
      const total = monthlyArticlesAll.length;
      const pageCount = Math.max(1, Math.ceil(total / MONTHLY_PAGE_SIZE));
      monthlyPage = Math.min(Math.max(1, monthlyPage), pageCount);
      const start = (monthlyPage - 1) * MONTHLY_PAGE_SIZE;
      const visible = monthlyArticlesAll.slice(start, start + MONTHLY_PAGE_SIZE);

      document.getElementById('dash-month-article-list').innerHTML = visible.map((item, idx) => \`
        <li class="dash-article-row">
          <span class="dash-row-num">\${start + idx + 1}</span>
          <div class="dash-row-main">
            <a class="dash-row-title" href="#edit" onclick="switchAdminTab('articles'); openArticleEditor(\${item.articleId}); return false;">\${escapeHtml(item.title)}</a>
            <div class="dash-row-meta">
              <span class="status-badge status-\${String(item.status || '').toLowerCase()}">\${item.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</span>
              <span class="category-chip">\${escapeHtml(item.categoryName)}</span>
              <span>\${formatDate(item.publishedAt || item.createdAt)}</span>
            </div>
          </div>
          <div class="dash-row-views"><b>\${Number(item.monthViews || 0).toLocaleString('th-TH')}</b><small>วิวเดือนนี้</small></div>
          <div class="dash-row-actions">
            <a href="#view" onclick="navigateTo('detail', { id: \${item.articleId} }); return false;">ดู</a>
            <a href="#edit" onclick="switchAdminTab('articles'); openArticleEditor(\${item.articleId}); return false;">แก้ไข</a>
          </div>
        </li>
      \`).join('');

      const pager = document.getElementById('dash-month-pagination');
      if (pageCount > 1) {
        pager.style.display = 'flex';
        pager.innerHTML = \`
          <div class="admin-page-summary"><span>แสดง <b>\${start + 1}–\${Math.min(start + MONTHLY_PAGE_SIZE, total)}</b> จากทั้งหมด <b>\${total}</b> บทความ</span></div>
          <div class="admin-page-controls">
            <button type="button" \${monthlyPage <= 1 ? 'disabled' : ''} onclick="monthlyPage--; renderMonthlyArticlesPage();">← ก่อนหน้า</button>
            <div class="admin-page-numbers">
              \${Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => \`<button type="button" class="\${n === monthlyPage ? 'active' : ''}" onclick="monthlyPage=\${n}; renderMonthlyArticlesPage();">\${n}</button>\`).join('')}
            </div>
            <button type="button" \${monthlyPage >= pageCount ? 'disabled' : ''} onclick="monthlyPage++; renderMonthlyArticlesPage();">ถัดไป →</button>
          </div>
        \`;
      } else {
        pager.style.display = 'none';
      }
    }

    function changeDashboardMonth(month) {
      loadAdminDashboardData(month);
    }

    async function deleteSearchTerm(term) {
      if (!confirm('ต้องการลบประวัติคำค้นหา “' + term + '” ใช่หรือไม่?')) return;
      await apiRequest('DELETE', '/admin/search-logs?term=' + encodeURIComponent(term), null, true);
      loadAdminDashboardData(document.getElementById('dash-month-select')?.value || '');
    }

    async function downloadCsvWithAuth(apiPath, filename) {
      const res = await fetch(API_BASE + apiPath, { headers: { Authorization: 'Bearer ' + getAdminToken() } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadAllArticlesCsv() {
      downloadCsvWithAuth('/admin/reports/articles.csv', 'รายงานคลังความรู้ทั้งหมด.csv');
    }

    function downloadMonthlyCsv() {
      const m = document.getElementById('dash-month-select')?.value || '';
      downloadCsvWithAuth('/admin/reports/monthly.csv' + (m ? '?month=' + encodeURIComponent(m) : ''), 'รายงานสรุปประจำเดือน-' + (m || 'ล่าสุด') + '.csv');
    }

    // --- 5.2 จัดการบทความ (Admin Articles CRUD) ---
    async function loadAdminArticlesData() {
      const [articles, categories] = await Promise.all([
        apiRequest('GET', '/admin/articles', null, true),
        apiRequest('GET', '/admin/categories', null, true),
      ]);
      adminArticlesList = articles;
      adminCategoriesList = categories;
      document.getElementById('edit-category').innerHTML = categories.map((c) => \`<option value="\${c.categoryId}">\${escapeHtml(c.categoryName)}</option>\`).join('');
      renderAdminArticlesTable();
    }

    function renderAdminArticlesTable() {
      const q = (document.getElementById('adm-art-search')?.value || '').trim().toLowerCase();
      const rows = adminArticlesList.filter((a) => !q || String(a.title || '').toLowerCase().includes(q));
      document.getElementById('adm-articles-tbody').innerHTML = rows.map((a) => \`
        <tr>
          <td><b>\${escapeHtml(a.title)}</b></td>
          <td>\${escapeHtml(a.category?.categoryName || '—')}</td>
          <td><span class="status-badge status-\${String(a.status || '').toLowerCase()}">\${a.status === 'PUBLISHED' ? 'เผยแพร่แล้ว' : (a.status === 'DRAFT' ? 'ฉบับร่าง' : 'ซ่อน')}</span></td>
          <td>\${Number(a.viewCount || 0).toLocaleString('th-TH')}</td>
          <td>\${formatDate(a.updatedAt)}</td>
          <td>
            <div class="admin-row-actions">
              <a href="#preview" onclick="navigateTo('detail', { id: \${a.articleId} }); return false;">ดู</a>
              <button type="button" onclick="openArticleEditor(\${a.articleId})">แก้ไข</button>
              <button type="button" class="danger-action" onclick="deleteAdminArticle(\${a.articleId})">ลบ</button>
            </div>
          </td>
        </tr>
      \`).join('');
    }

    async function openArticleEditor(articleId) {
      switchAdminTab('articles');
      document.getElementById('admin-articles-list-box').style.display = 'none';
      document.getElementById('admin-article-editor-box').style.display = 'block';
      document.getElementById('editor-error-box').innerHTML = '';
      if (!adminCategoriesList.length) {
        adminCategoriesList = await apiRequest('GET', '/admin/categories', null, true);
        document.getElementById('edit-category').innerHTML = adminCategoriesList.map((c) => \`<option value="\${c.categoryId}">\${escapeHtml(c.categoryName)}</option>\`).join('');
      }
      if (!articleId) {
        document.getElementById('editor-heading').textContent = 'เพิ่มบทความใหม่';
        document.getElementById('edit-article-id').value = '';
        document.getElementById('edit-title').value = '';
        document.getElementById('edit-content').value = '';
        document.getElementById('edit-steps').value = '';
        document.getElementById('edit-keywords').value = '';
        document.getElementById('edit-video').value = '';
        document.getElementById('edit-status').value = 'PUBLISHED';
        document.getElementById('edit-featured').checked = false;
        return;
      }
      const article = await apiRequest('GET', '/admin/articles/' + articleId, null, true);
      document.getElementById('editor-heading').textContent = 'แก้ไขบทความ';
      document.getElementById('edit-article-id').value = article.articleId;
      document.getElementById('edit-title').value = article.title || '';
      document.getElementById('edit-category').value = article.categoryId;
      document.getElementById('edit-status').value = article.status || 'PUBLISHED';
      document.getElementById('edit-content').value = article.content || '';
      document.getElementById('edit-steps').value = Array.isArray(article.steps) ? article.steps.join('\\n') : '';
      document.getElementById('edit-keywords').value = Array.isArray(article.keywords) ? article.keywords.join(', ') : '';
      document.getElementById('edit-video').value = article.videoUrl || '';
      document.getElementById('edit-featured').checked = Boolean(article.featured);
    }

    function closeArticleEditor() {
      document.getElementById('admin-article-editor-box').style.display = 'none';
      document.getElementById('admin-articles-list-box').style.display = 'block';
    }

    async function submitArticleEditor(e) {
      e.preventDefault();
      const id = document.getElementById('edit-article-id').value;
      const fd = new FormData();
      fd.append('title', document.getElementById('edit-title').value.trim());
      fd.append('categoryId', document.getElementById('edit-category').value);
      fd.append('status', document.getElementById('edit-status').value);
      fd.append('content', document.getElementById('edit-content').value.trim());
      fd.append('steps', document.getElementById('edit-steps').value);
      fd.append('keywords', document.getElementById('edit-keywords').value);
      fd.append('videoUrl', document.getElementById('edit-video').value.trim());
      fd.append('featured', String(document.getElementById('edit-featured').checked));
      const imgFiles = document.getElementById('edit-images').files;
      for (let i = 0; i < imgFiles.length; i++) fd.append('images', imgFiles[i]);
      const pdfFile = document.getElementById('edit-pdf').files[0];
      if (pdfFile) fd.append('pdfFile', pdfFile);

      try {
        if (id) await apiRequest('PATCH', '/admin/articles/' + id, fd, true);
        else await apiRequest('POST', '/admin/articles', fd, true);
        closeArticleEditor();
        loadAdminArticlesData();
      } catch (err) {
        document.getElementById('editor-error-box').innerHTML = \`<div class="admin-alert">\${escapeHtml(err.message)}</div>\`;
      }
    }

    async function deleteAdminArticle(articleId) {
      if (!confirm('ต้องการลบบทความนี้ใช่หรือไม่?')) return;
      await apiRequest('DELETE', '/admin/articles/' + articleId, null, true);
      loadAdminArticlesData();
    }

    // --- 5.3 จัดการหมวดหมู่ (Category Manager) ---
    async function loadAdminCategoriesData() {
      const categories = await apiRequest('GET', '/admin/categories', null, true);
      adminCategoriesList = categories;
      document.getElementById('adm-categories-tbody').innerHTML = categories.map((c) => \`
        <tr>
          <td><b>\${escapeHtml(c.categoryName)}</b></td>
          <td>\${escapeHtml(c.description || '—')}</td>
          <td>\${c._count?.articles || 0}</td>
          <td>
            <div class="admin-row-actions">
              <button type="button" onclick="editCategoryRow(\${c.categoryId})">แก้ไข</button>
              <button type="button" class="danger-action" onclick="deleteCategoryRow(\${c.categoryId})">ลบ</button>
            </div>
          </td>
        </tr>
      \`).join('');
    }

    function editCategoryRow(id) {
      const cat = adminCategoriesList.find((c) => c.categoryId === id);
      if (!cat) return;
      document.getElementById('cat-form-title').textContent = 'แก้ไขหมวดหมู่';
      document.getElementById('cat-edit-id').value = cat.categoryId;
      document.getElementById('cat-edit-name').value = cat.categoryName;
      document.getElementById('cat-edit-desc').value = cat.description || '';
    }

    function resetCategoryForm() {
      document.getElementById('cat-form-title').textContent = 'เพิ่มหมวดหมู่';
      document.getElementById('cat-edit-id').value = '';
      document.getElementById('cat-edit-name').value = '';
      document.getElementById('cat-edit-desc').value = '';
    }

    async function submitCategoryForm(e) {
      e.preventDefault();
      const id = document.getElementById('cat-edit-id').value;
      const payload = {
        categoryName: document.getElementById('cat-edit-name').value.trim(),
        description: document.getElementById('cat-edit-desc').value.trim(),
      };
      if (id) await apiRequest('PATCH', '/admin/categories/' + id, payload, true);
      else await apiRequest('POST', '/admin/categories', payload, true);
      resetCategoryForm();
      loadAdminCategoriesData();
    }

    async function deleteCategoryRow(id) {
      if (!confirm('ต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) return;
      try {
        await apiRequest('DELETE', '/admin/categories/' + id, null, true);
        loadAdminCategoriesData();
      } catch (err) {
        alert(err.message);
      }
    }

    // --- 5.4 ตั้งค่าข้อมูลติดต่อ (Contact Settings) ---
    async function loadAdminSettingsData() {
      const c = await apiRequest('GET', '/settings/contact');
      ['phone', 'lineId', 'lineUrl', 'email', 'location', 'hours', 'note'].forEach((k) => {
        const el = document.getElementById('set-' + k);
        if (el) el.value = c[k] || '';
      });
    }

    async function submitContactSettings(e) {
      e.preventDefault();
      const payload = {};
      ['phone', 'lineId', 'lineUrl', 'email', 'location', 'hours', 'note'].forEach((k) => {
        payload[k] = (document.getElementById('set-' + k)?.value || '').trim();
      });
      await apiRequest('PUT', '/admin/settings/contact', payload, true);
      document.getElementById('settings-notice-box').innerHTML = '<div class="admin-alert admin-alert-success">บันทึกข้อมูลติดต่อเรียบร้อยแล้ว</div>';
    }

    // --- Modal QR Code LINE & Lightbox รูปภาพ ---
    function openLineQrModal() { document.getElementById('line-qr-modal').style.display = 'grid'; }
    function closeLineQrModal() { document.getElementById('line-qr-modal').style.display = 'none'; }
    function openImageLightbox(src) {
      document.getElementById('lightbox-img').src = src;
      document.getElementById('image-lightbox').style.display = 'grid';
    }
    function closeImageLightbox() { document.getElementById('image-lightbox').style.display = 'none'; }

    // --- เริ่มต้นระบบเมื่อเปิดไฟล์ HTML ---
    document.addEventListener('DOMContentLoaded', () => {
      initStaticAssets();
      updateSavedBadges();
      setLanguage(currentLang);
      if (getAdminToken()) {
        const lbl = document.getElementById('header-staff-label');
        if (lbl) lbl.textContent = 'ไปที่ระบบจัดการ';
      }
      loadHomeView();
    });
  </script>
</body>
</html>
`

fs.writeFileSync(path.join(rootDir, 'ict-knowledge-base.html'), singleFileHtml, 'utf8')
fs.writeFileSync(path.join(rootDir, 'html-pages/single-file.html'), singleFileHtml, 'utf8')
console.log('Generated ict-knowledge-base.html and html-pages/single-file.html successfully.')
