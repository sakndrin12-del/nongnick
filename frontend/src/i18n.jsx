/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const CATEGORY_TRANSLATIONS = {
  'คอมพิวเตอร์และอุปกรณ์': {
    name: 'Computers & Devices',
    description: 'Basic usage, maintenance, and troubleshooting for computers, peripherals, and operating systems.',
  },
  'ระบบเครือข่ายและอินเทอร์เน็ต': {
    name: 'Network & Internet',
    description: 'Connecting to wireless networks (Wi-Fi), internet, intranet, and configuring IP/DNS/VPN.',
  },
  'โปรแกรมและซอฟต์แวร์': {
    name: 'Programs & Software',
    description: 'Guides for office applications, online meetings, file management, and data backup.',
  },
  'เครื่องพิมพ์และอุปกรณ์ต่อพ่วง': {
    name: 'Printers & Peripherals',
    description: 'Installing and using network printers, scanners, and digital Maker Space equipment at the ICT Center.',
  },
  'ระบบสารสนเทศและบริการออนไลน์': {
    name: 'Information Systems & Online Services',
    description: 'Using Khon Kaen ICT Learning Center services (kkict.net), municipal systems, and cybersecurity.',
  },
}

const KEYWORD_TRANSLATIONS = {
  'เครือข่าย': 'Network',
  'คอมพิวเตอร์': 'Computer',
  'เครื่องช้า': 'Slow PC',
  'เครื่องค้าง': 'Frozen PC',
  'จอภาพ': 'Monitor',
  'เมาส์': 'Mouse',
  'คีย์บอร์ด': 'Keyboard',
  'อุปกรณ์': 'Devices',
  'อินเทอร์เน็ต': 'Internet',
  'ไร้สาย': 'Wireless',
  'เน็ตช้า': 'Slow Internet',
  'เน็ตหลุด': 'Disconnected',
  'ความปลอดภัย': 'Security',
  'เอกสาร': 'Documents',
  'กู้ไฟล์': 'File Recovery',
  'ประชุมออนไลน์': 'Online Meeting',
  'ไมโครโฟน': 'Microphone',
  'กล้อง': 'Camera',
  'สำรองข้อมูล': 'Data Backup',
  'เครื่องพิมพ์': 'Printer',
  'พิมพ์ไม่ออก': 'Print Error',
  'กระดาษติด': 'Paper Jam',
  'หมึกพิมพ์': 'Toner & Ink',
  'สแกนเนอร์': 'Scanner',
  'สแกนเอกสาร': 'Document Scan',
  'อบรมคอมพิวเตอร์': 'IT Training',
  'รหัสผ่าน': 'Password',
  'ลืมรหัสผ่าน': 'Forgot Password',
  'รีเซ็ตรหัสผ่าน': 'Password Reset',
  'บัญชีผู้ใช้': 'User Account',
  'เบราว์เซอร์': 'Browser',
  'ไวรัส': 'Virus',
  'อีเมล': 'Email',
}

const ARTICLE_TRANSLATIONS = {
  'การตั้งค่า IP และ DNS บน Windows 11 สำหรับเครือข่ายสำนักงาน': {
    title: 'Configuring IP Address and DNS on Windows 11 for Office Networks',
    content: `Introduction\nConfiguring the correct IP Address and DNS Server enables your computer to communicate reliably with internal municipal networks and access the internet smoothly. Unless assigned a static IP by an ICT officer, you should use Automatic (DHCP) mode to avoid IP conflicts.\n\nImportant Note\nIf your computer shares a printer or connects to specialized municipal systems, please record your existing IP and DNS settings before making changes so you have a reference when contacting Khon Kaen ICT Center staff.`,
    steps: [
      'Click the Start button, open Settings (gear icon), and select Network & internet on the left menu.',
      'Select your active connection type: Wi-Fi (wireless) or Ethernet (LAN cable).',
      'Click the active network name, scroll down to IP assignment, and click Edit.',
      'Choose Automatic (DHCP) for standard use, or Manual if you received a static IP configuration sheet from an ICT officer.',
      'Under DNS server assignment, choose Automatic (DHCP) or enter the municipal DNS address, then click Save.',
      'Open a web browser and visit www.kkict.net to verify that your internet connection is working properly.',
    ],
  },
  'แนวทางตรวจสอบและแก้ไขเมื่อคอมพิวเตอร์ทำงานช้าหรือค้างบ่อย': {
    title: 'How to Diagnose and Fix a Slow or Frequently Freezing Computer',
    content: `Introduction\nA computer that responds slowly, takes a long time to open applications, or freezes during work is commonly caused by running too many programs simultaneously, low free space on the system drive (Drive C:), or background Windows updates.\n\nImportant Note\nChecking system resources yourself helps distinguish software issues that can be fixed immediately from hardware wear (such as hard drive or RAM issues) that should be inspected by an ICT technician.`,
    steps: [
      'Save all open documents and close unused applications and browser tabs.',
      'Press Ctrl + Shift + Esc to open Task Manager and check the Processes tab to see which app is using high CPU, Memory, or Disk.',
      'Open This PC and check Drive C: free space — keep at least 15–20 GB free for smooth operation.',
      'Run Windows Disk Cleanup or Storage Sense to remove temporary files and empty the Recycle Bin.',
      'Restart the computer once (choose Restart rather than Shut down) to clear cached system memory.',
      'If the computer still freezes or makes unusual hardware noises, note any error messages and contact the ICT Center.',
    ],
  },
  'การตรวจสอบเมื่อจอภาพไม่แสดงผล เมาส์หรือคีย์บอร์ดไม่ตอบสนอง': {
    title: 'Troubleshooting Blank Monitors and Unresponsive Mice or Keyboards',
    content: `Introduction\nWhen you turn on a computer and the screen stays dark, displays "No Signal", or the mouse and keyboard do not respond, the most common causes are loose cables, unstable USB port power, or an incorrect display input source.\n\nImportant Note\nBefore requesting a hardware repair, follow the standard external connection checks below, which resolve over 80% of common office and training room cases.`,
    steps: [
      'Check the power indicator lights on both the computer case and the monitor corner. If off, inspect the power plug and UPS.',
      'Firmly reseat the video cable (HDMI, DisplayPort, or VGA) on both the back of the monitor and the computer case.',
      'Press the Input / Source button on the monitor to ensure it matches the connected cable port.',
      'If the mouse or keyboard is unresponsive, unplug the USB cable and plug it directly into a rear USB port on the computer case.',
      'For wireless mice or keyboards, check the ON/OFF switch underneath and replace the batteries.',
      'Press Windows + Ctrl + Shift + B together to reset the graphics driver. If the screen remains dark, contact an ICT technician.',
    ],
  },
  'แนวทางแก้ไขเมื่อเชื่อมต่อเครือข่ายไร้สาย (Wi-Fi) ไม่ได้': {
    title: 'How to Fix Wireless Network (Wi-Fi) Connection Issues',
    content: `Introduction\nIf your computer or mobile device cannot detect the Wi-Fi signal, fails to connect, or shows "Connected, no internet", the issue may come from airplane mode being enabled, an expired cached IP address, or a changed wireless profile.\n\nImportant Note\nMake sure you are connecting to the official wireless network name (SSID) provided by Khon Kaen ICT Center and have your authorized user credentials ready.`,
    steps: [
      'Verify that Wi-Fi is turned ON and Airplane Mode is turned OFF on your device.',
      'If connected with no internet, click Disconnect, wait 10 seconds, and reconnect.',
      'If connection still fails, right-click the Wi-Fi network name, select Forget, and reconnect with your password.',
      'Open Command Prompt and run "ipconfig /release" followed by "ipconfig /renew" to request a fresh IP address.',
      'Restart your device and test opening a web page to confirm if the login portal appears.',
      'If multiple devices in the same room cannot connect, notify ICT Center staff to inspect the local Access Point.',
    ],
  },
  'ตรวจสอบเมื่ออินเทอร์เน็ตใช้งานได้ช้าหรือสัญญาณขาดช่วง': {
    title: 'Troubleshooting Slow or Intermittent Internet Connections',
    content: `Introduction\nSlow web browsing, buffering video calls, or frequent connection drops can be caused by weak wireless signal strength through walls, heavy background downloads, or a damaged LAN cable.\n\nImportant Note\nComparing connection speed near the router versus your desk helps identify whether the issue is signal coverage or internet bandwidth.`,
    steps: [
      'Check the Wi-Fi signal bars on your device. If only 1–2 bars appear, move closer to the Access Point or use a LAN cable.',
      'Pause large cloud sync tasks, video streams, or large file downloads running in the background.',
      'If using a LAN cable, check that the RJ-45 connector clip locks firmly and the cable jacket is not pinched or frayed.',
      'Clear your web browser cache or test opening the site in an Incognito/Private window.',
      'Test another website (such as www.kkict.net) to see whether the slowdown affects all sites or only one specific server.',
      'Report the room location and time of slowdown to ICT Center staff if the problem persists.',
    ],
  },
  'การเชื่อมต่อเครือข่ายเสมือน (VPN) และการเข้าใช้ระบบภายในจากภายนอก': {
    title: 'Connecting to VPN and Accessing Internal Municipal Systems Remotely',
    content: `Introduction\nA Virtual Private Network (VPN) creates an encrypted tunnel allowing authorized municipal staff to securely access internal intranet systems and shared resources when working outside the office.\n\nImportant Note\nNever share your VPN account credentials and always disconnect the VPN session immediately after finishing your work.`,
    steps: [
      'Ensure your device is connected to a stable internet connection before launching the VPN client.',
      'Open the municipal VPN client or Windows built-in VPN settings configured by the ICT Center.',
      'Select the official ICT Center VPN profile and enter your authorized username and password.',
      'Complete Two-Factor Authentication (2FA / OTP) if prompted by the security gateway.',
      'Wait until the status displays "Connected" before opening internal municipal web applications.',
      'Click Disconnect in the VPN client as soon as you finish your remote tasks.',
    ],
  },
  'การบันทึกเอกสารราชการ การแปลงไฟล์ PDF และการกู้คืนไฟล์ฉบับก่อนหน้า': {
    title: 'Saving Official Documents, Exporting to PDF, and Recovering Previous Versions',
    content: `Introduction\nFormatting and exporting official documents to PDF/A or standard PDF ensures that Thai fonts, signatures, and page layouts remain intact on every computer without shifting.\n\nImportant Note\nEnable AutoSave or save your work every 10–15 minutes to prevent data loss from unexpected power outages.`,
    steps: [
      'In Microsoft Word or LibreOffice Writer, press Ctrl + S regularly and verify that standard Thai government fonts (e.g., TH Sarabun PSK) are used.',
      'To export as PDF, click File > Save As (or Export) and choose PDF (*.pdf) as the file format.',
      'Open the exported PDF file to inspect page breaks, tables, and Thai vowel/tone mark alignment before sending.',
      'If a file was closed without saving, open the app and go to File > Info > Manage Document > Recover Unsaved Documents.',
      'To restore an overwritten file, right-click the file in Windows Explorer, choose Properties > Previous Versions, and select an earlier timestamp.',
    ],
  },
  'การเตรียมอุปกรณ์และแก้ไขปัญหาเสียง/กล้องในการประชุมออนไลน์': {
    title: 'Preparing Equipment and Fixing Audio/Camera Issues in Online Meetings',
    content: `Introduction\nTesting your microphone, speakers, and webcam 10–15 minutes before an online meeting (Zoom, Google Meet, or Microsoft Teams) prevents delays and echo issues during official conferences.\n\nImportant Note\nIf two computers sit in the same room during a meeting, only one device should have its microphone and speakers active to avoid audio feedback.`,
    steps: [
      'Connect your headset, microphone, and webcam securely before opening the meeting application.',
      'In Zoom, Google Meet, or Teams, open Audio & Video Settings and select the correct Microphone and Speaker device names.',
      'Speak into the microphone and watch the input level bar move to confirm sound is being captured.',
      'If the camera shows a black screen, check the physical privacy shutter on the webcam lens and close other apps using the camera.',
      'Check Windows Privacy Settings > Camera / Microphone to ensure browser and desktop apps have permission.',
      'Keep your microphone muted whenever you are not speaking to reduce background noise.',
    ],
  },
  'แนวทางการสำรองข้อมูลไฟล์งานสำคัญตามหลัก 3-2-1 Backup': {
    title: 'Backing Up Critical Work Files Using the 3-2-1 Backup Rule',
    content: `Introduction\nThe 3-2-1 Backup principle protects official municipal documents against hardware failure, accidental deletion, and ransomware by maintaining multiple independent copies.\n\nImportant Note\nAlways disconnect your external backup drive after copying files so that ransomware cannot encrypt your offline backup.`,
    steps: [
      'Organize important work files into clearly dated folders separated from temporary downloads.',
      'Keep at least 3 copies of critical data: 1 primary working copy on your PC and 2 backup copies.',
      'Store backups on 2 different storage media types, such as an External Hard Drive/Flash Drive and authorized Cloud Storage.',
      'Keep 1 backup copy offline or offsite, disconnecting the external drive immediately after backup completes.',
      'Test opening your backed-up files once a month to verify that the archives are readable and intact.',
    ],
  },
  'ฉบับร่าง: คู่มือการใช้ซอฟต์แวร์ออกแบบ 3 มิติเบื้องต้นสำหรับห้อง Maker Space': {
    title: 'Draft: Basic 3D Design Software Guide for the Maker Space Lab',
    content: `Introduction\nThis beginner guide introduces 3D modeling preparation and STL/OBJ slicing workflows for participants using the 3D printers at Khon Kaen ICT Center Maker Space.\n\nImportant Note\nAlways verify model dimensions in millimeters (mm) before exporting to the slicer software.`,
    steps: [
      'Launch the 3D design software and set the workspace measurement unit to Millimeters (mm).',
      'Ensure the base of your 3D model sits flat on the build plane so it adheres properly during printing.',
      'Export the finished model in .STL or .3MF format and inspect it in the slicing software with an ICT staff member.',
    ],
  },
  'แก้ปัญหาสั่งพิมพ์งานผ่านเครื่องพิมพ์เครือข่าย (Network Printer) ไม่ออก': {
    title: 'Troubleshooting Network Printer Not Printing Issues',
    content: `Introduction\nWhen you send a document to a shared network printer and nothing prints, the most common causes are selecting the wrong printer name, a stuck print queue, or the printer being offline.\n\nImportant Note\nAvoid clicking Print repeatedly when a job is delayed, as queued jobs will print all at once when the connection recovers.`,
    steps: [
      'Check the printer screen and power light to confirm it is turned on, has paper loaded, and shows no error light.',
      'Verify that your computer is connected to the same office network (LAN or office Wi-Fi) as the printer.',
      'In the Print dialog, ensure you selected the correct network printer name and that its status says Ready (not Offline).',
      'Open Windows Settings > Bluetooth & devices > Printers & scanners, select the printer, and click Open print queue.',
      'If an old document is stuck in Error/Paused state, right-click it and choose Cancel, or restart the Print Spooler service.',
      'Print a single test page to verify normal operation.',
    ],
  },
  'การเปลี่ยนตลับหมึก การแก้ไขกระดาษติด และการดูแลคุณภาพงานพิมพ์': {
    title: 'Replacing Ink/Toner, Clearing Paper Jams, and Maintaining Print Quality',
    content: `Introduction\nFaded printouts, streaks, or paper jam alerts can be safely resolved by following proper paper loading and jam removal procedures without damaging internal printer rollers.\n\nImportant Note\nNever use sharp metal objects or excessive force when pulling jammed paper, and always pull gently in the direction of paper feed.`,
    steps: [
      'Before loading paper, fan the paper stack and align the paper guides snugly against the edges without bending the sheets.',
      'If a Paper Jam occurs, turn off the printer, open the service cover, and gently pull the jammed sheet out with both hands to avoid tearing.',
      'Check that no small torn paper scraps remain inside the rollers before closing the cover.',
      'If printouts have faded lines, open Printer Preferences > Maintenance and run Head Cleaning / Nozzle Check.',
      'When replacing toner or ink cartridges, use the exact model specified for the printer and remove the protective seal tape completely.',
    ],
  },
  'วิธีการสแกนเอกสารเป็นไฟล์ PDF เพื่อแนบในระบบงานอิเล็กทรอนิกส์': {
    title: 'How to Scan Documents to PDF for Electronic Office Systems',
    content: `Introduction\nScanning multi-page official documents at the proper resolution produces clear, readable PDF files that stay within upload size limits for e-office systems.\n\nImportant Note\nA resolution of 200–300 DPI in Grayscale or Color is ideal for official documents — sharp text without oversized files.`,
    steps: [
      'Remove all staples and paperclips from the document pages before placing them on the scanner glass or ADF feeder.',
      'Place the document face-down aligned with the corner arrow marker on the scanner glass.',
      'Open the scanner software on the computer, choose Document / PDF mode, and set resolution to 200 or 300 DPI.',
      'Click Preview to verify the crop area and orientation, then click Scan.',
      'For multi-page documents, select "Add page" so all pages are combined into a single PDF file, then save with a clear file name.',
    ],
  },
  'ข้อปฏิบัติในการเข้าใช้งานอุปกรณ์ห้อง Maker Space (3D Printer และ CNC Laser)': {
    title: 'Guidelines for Using Maker Space Equipment (3D Printer & CNC Laser)',
    content: `Introduction\nThe Maker Space at Khon Kaen ICT Learning Center provides 3D printers and digital fabrication tools for students, staff, and citizens under safety supervision.\n\nImportant Note\nAlways notify on-duty ICT Center staff before starting a 3D print or laser cutting job and never touch heated nozzles or moving parts.`,
    steps: [
      'Book your session and register with the ICT Center staff before using Maker Space equipment.',
      'Have an ICT officer inspect your 3D file (.STL/.G-code) or vector file and verify material compatibility.',
      'Stay in the lab during the initial first-layer print to confirm proper bed adhesion.',
      'Wait for the build plate and nozzle to cool down below 40°C before removing finished 3D prints.',
      'Clean the workstation and return tools to their designated storage spots after finishing.',
    ],
  },
  'การเข้าใช้บริการศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น (kkict.net)': {
    title: 'Using Khon Kaen Municipality ICT Learning Center Services (kkict.net)',
    content: `Introduction\nThe Khon Kaen Municipality ICT Skill Development and Learning Center (KKICT) provides free public computer zones, high-speed internet, IT training courses, and meeting spaces for citizens and municipal personnel.\n\nImportant Note\nBring your National ID card or official employee ID card when registering to use computer stations or training rooms.`,
    steps: [
      'Visit www.kkict.net to check training schedules, news, and available digital learning services.',
      'Present your ID card at the service counter to register and receive a station number or Wi-Fi login ticket.',
      'Log in at the assigned computer station and save your personal work to your own USB drive or cloud account before logging out.',
      'For group training or room reservations, submit a request through the ICT Center counter or contact channels in advance.',
    ],
  },
  'แนวทางตรวจสอบและแก้ไขเมื่อเข้าใช้ระบบสารสนเทศไม่ได้': {
    title: 'Troubleshooting When You Cannot Access Municipal Information Systems',
    content: `Introduction\nIf an internal web system or online service fails to load, shows a security certificate warning, or loops back to the login screen, follow these steps to isolate browser cache or network issues.\n\nImportant Note\nSome internal municipal systems require connecting via the office intranet or VPN and work best on Google Chrome or Microsoft Edge.`,
    steps: [
      'Verify that the website URL is spelled correctly and uses https:// as specified by the agency.',
      'Check that your computer clock, date, and time zone (UTC+07:00 Bangkok) are accurate, as wrong dates cause SSL errors.',
      'Press Ctrl + Shift + Delete in your browser to clear cached files and cookies, or test in an Incognito/Private window.',
      'Disable pop-up blockers for the municipal domain if report windows or forms fail to open.',
      'If an error code (such as 403, 404, or 500) appears, take a screenshot showing the URL and contact the ICT Center.',
    ],
  },
  'ขั้นตอนการตั้งและขอรีเซ็ตรหัสผ่านอย่างมั่นคงปลอดภัย': {
    title: 'How to Create a Strong Password and Request a Secure Password Reset',
    content: `Introduction\nUsing a strong, unique password for official systems protects municipal data and personal accounts from unauthorized access.\n\nImportant Note\nICT Center officers will never ask for your current password via chat or phone. Change your temporary password immediately after a reset.`,
    steps: [
      'Create a password at least 8–12 characters long combining uppercase letters, lowercase letters, numbers, and symbols.',
      'Avoid using personal data such as your birth date, phone number, or username as your password.',
      'If you forget your password, use the "Forgot Password / Reset Password" menu on the login screen and verify your registered details.',
      'If your account is locked after multiple failed attempts, wait 15 minutes or contact an ICT administrator to verify your identity.',
      'Log out of all shared or public computers immediately after finishing your session.',
    ],
  },
  'วิธีสังเกตและป้องกันอีเมลหลอกลวง (Phishing) และไวรัสเรียกค่าไถ่ (Ransomware)': {
    title: 'How to Spot and Prevent Phishing Emails and Ransomware Attacks',
    content: `Introduction\nPhishing emails and fake links often impersonate banks, government agencies, or delivery services to trick users into entering passwords or opening malicious attachments (.exe, .scr, .zip) that encrypt computer files.\n\nImportant Note\nIf you accidentally click a suspicious link or notice files changing extensions abnormally, disconnect your LAN cable and turn off Wi-Fi immediately, then alert the ICT Center.`,
    steps: [
      'Inspect the sender email address carefully — look out for misspelled domain names or free webmail addresses claiming to be official agencies.',
      'Hover your mouse over links (without clicking) to preview the actual destination URL before opening.',
      'Never open unexpected attachments with extensions like .exe, .bat, .vbs, or password-protected .zip files from unknown senders.',
      'Keep Windows Security / Antivirus and your web browser updated to the latest version.',
      'If you suspect an infection, disconnect from the network immediately (unplug LAN / disable Wi-Fi) and call the ICT Center.',
    ],
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return window.localStorage.getItem('ict-lang') === 'en' ? 'en' : 'th' } catch { return 'th' }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    try { window.localStorage.setItem('ict-lang', lang) } catch { /* Ignore storage errors. */ }
  }, [lang])

  const value = useMemo(() => {
    const isEn = lang === 'en'
    const t = (th, en) => (isEn ? en : th)
    const setLang = (next) => setLangState(next === 'en' ? 'en' : 'th')
    const toggleLang = () => setLangState((curr) => (curr === 'en' ? 'th' : 'en'))

    const formatDate = (dateVal) => {
      if (!dateVal) return isEn ? 'Unpublished' : 'ยังไม่เผยแพร่'
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'th-TH', { dateStyle: 'medium' }).format(new Date(dateVal))
    }

    const translateCategoryName = (name) => {
      if (!isEn || !name) return name
      return CATEGORY_TRANSLATIONS[name]?.name || name
    }

    const translateCategory = (cat) => {
      if (!cat || !isEn) return cat
      const found = CATEGORY_TRANSLATIONS[cat.categoryName]
      if (!found) return cat
      return {
        ...cat,
        categoryName: found.name,
        description: found.description || cat.description,
      }
    }

    const translateKeyword = (kw) => {
      if (!isEn || !kw) return kw
      return KEYWORD_TRANSLATIONS[kw] || kw
    }

    const translateArticle = (article) => {
      if (!article || !isEn) return article
      const preset = ARTICLE_TRANSLATIONS[article.title]
      const translatedCategory = article.category
        ? { ...article.category, categoryName: translateCategoryName(article.category.categoryName) }
        : article.category
      const translatedKeywords = Array.isArray(article.keywords)
        ? article.keywords.map(translateKeyword)
        : article.keywords
      if (preset) {
        return {
          ...article,
          title: preset.title,
          content: preset.content,
          steps: preset.steps,
          keywords: translatedKeywords,
          category: translatedCategory,
        }
      }
      return {
        ...article,
        content: (article.content || '')
          .replace(/^เกริ่นนำ/gm, 'Introduction')
          .replace(/^ข้อควรทราบ/gm, 'Important Note')
          .replace(/^คำแนะนำ/gm, 'Recommendation')
          .replace(/^สาเหตุ/gm, 'Cause'),
        keywords: translatedKeywords,
        category: translatedCategory,
      }
    }

    const translateContact = (contact) => {
      if (!contact || !isEn) return contact
      return {
        ...contact,
        location: contact.location
          ? contact.location
              .replace('ชั้น 2 ตลาดสดเทศบาล 1 ถนนกลางเมือง ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', '2nd Floor, Municipal Fresh Market 1, Klang Mueang Rd., Nai Mueang, Mueang Khon Kaen, Khon Kaen 40000')
              .replace('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น', 'Khon Kaen Municipality ICT Skill Development & Learning Center')
              .replace('ถ.ประชาสำราญ ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000', 'Prachasamran Rd., Nai Mueang, Mueang Khon Kaen, Khon Kaen 40000')
          : contact.location,
        hours: contact.hours
          ? contact.hours
              .replace('อังคาร – อาทิตย์', 'Tuesday – Sunday')
              .replace('วันอังคาร - วันอาทิตย์', 'Tuesday – Sunday')
              .replace('วันจันทร์ - วันศุกร์', 'Monday – Friday')
              .replace('เวลา', '')
              .replace('น.', '')
              .replace('(หยุดวันจันทร์และวันหยุดนักขัตฤกษ์)', '(Closed on Mondays & Public Holidays)')
              .trim()
          : contact.hours,
        note: contact.note
          ? contact.note
              .replace('ศูนย์พัฒนาทักษะและการเรียนรู้ ICT เทศบาลนครขอนแก่น บริการพื้นที่การเรียนรู้ ห้องอบรมคอมพิวเตอร์ และให้คำปรึกษาด้านไอที', 'Khon Kaen Municipality ICT Skill Development & Learning Center provides digital learning spaces, computer training rooms, and IT consultation.')
              .replace('ติดต่อสอบถามข้อมูลการอบรม จองห้องปฏิบัติการคอมพิวเตอร์ หรือแจ้งปัญหาการใช้งานระบบเครือข่ายและอุปกรณ์ไอทีในเวลาทำการ', 'Contact us during service hours for IT training inquiries, computer lab reservations, or network & IT troubleshooting.')
          : contact.note,
      }
    }

    return {
      lang,
      isEn,
      setLang,
      toggleLang,
      t,
      formatDate,
      translateCategoryName,
      translateCategory,
      translateKeyword,
      translateArticle,
      translateContact,
    }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}

export function LanguageSwitch({ className = '' }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label="เลือกภาษา / Select language">
      <button
        type="button"
        className={lang === 'th' ? 'active' : ''}
        onClick={() => setLang('th')}
        aria-pressed={lang === 'th'}
        title="ภาษาไทย"
      >
        TH
      </button>
      <button
        type="button"
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="English"
      >
        EN
      </button>
    </div>
  )
}
