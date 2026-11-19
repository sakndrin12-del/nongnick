import axios from 'axios'
import { useEffect } from 'react'

const isLocalhost = typeof window === 'undefined' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const apiBase = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3000/api' : '/api')
const client = axios.create({
  baseURL: apiBase,
  timeout: 10000,
})

export function assetUrl(value) {
  if (!value || /^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  const origin = new URL(apiBase, window.location.origin).origin
  return new URL(value, origin).toString()
}

export function getAdminToken() {
  try { return window.sessionStorage.getItem('ict-admin-token') } catch { return null }
}

export function setAdminToken(token) {
  try { window.sessionStorage.setItem('ict-admin-token', token); return true } catch { return false }
}

export function clearAdminToken() {
  try { window.sessionStorage.removeItem('ict-admin-token') } catch { /* Storage may be blocked. */ }
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | คลังความรู้ ICT ศูนย์ ICT ขอนแก่น` : 'คลังความรู้ ICT | ศูนย์ ICT ขอนแก่น'
  }, [title])
}

client.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Lets the server count one view/search per browser even when a whole office shares one public IP.
  if (/^\/articles\/(?:search|\d+)(?:[/?]|$)/.test(config.url || '')) config.headers['X-Visitor-Id'] = feedbackKey()
  return config
})

// When an admin session expires mid-work, send the user back to the login page instead of showing raw errors.
client.interceptors.response.use(undefined, (error) => {
  const url = error.config?.url || ''
  if (error.response?.status === 401 && url.startsWith('/admin/') && getAdminToken()) {
    clearAdminToken()
    if (!window.location.pathname.startsWith('/admin/login')) window.location.assign('/admin/login?expired=1')
  }
  return Promise.reject(error)
})

const UPLOAD_TIMEOUT_MS = 120000
const uploadConfig = (body) => (typeof FormData !== 'undefined' && body instanceof FormData ? { timeout: UPLOAD_TIMEOUT_MS } : undefined)

function messageFrom(error) {
  if (error.response?.status === 404) return 'ไม่พบข้อมูลที่ต้องการ'
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  return error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

export const api = {
  async get(path) {
    try { return (await client.get(path)).data } catch (error) { throw new Error(messageFrom(error), { cause: error }) }
  },
  async post(path, body) {
    try { return (await client.post(path, body, uploadConfig(body))).data } catch (error) { throw new Error(messageFrom(error), { cause: error }) }
  },
  async put(path, body) {
    try { return (await client.put(path, body)).data } catch (error) { throw new Error(messageFrom(error), { cause: error }) }
  },
  async patch(path, body) {
    try { return (await client.patch(path, body, uploadConfig(body))).data } catch (error) { throw new Error(messageFrom(error), { cause: error }) }
  },
  async delete(path) {
    try { return (await client.delete(path)).data } catch (error) { throw new Error(messageFrom(error), { cause: error }) }
  },
  async download(path, filename) {
    try {
      const response = await client.get(path, { responseType: 'blob', timeout: 60000 })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { throw new Error(messageFrom(error), { cause: error }) }
  },
}

// Keep an opaque browser id for one-vote-per-article behavior; the server stores only its hash.
export function feedbackKey() {
  const storageKey = 'ict-feedback-voter'
  let key = null
  try { key = window.localStorage.getItem(storageKey) } catch { /* Use a short-lived key when storage is blocked. */ }
  if (!key) {
    key = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    try { window.localStorage.setItem(storageKey, key) } catch { /* Server-side uniqueness remains active. */ }
  }
  return key
}

export function parseMediaLink(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null
  try {
    const url = new URL(rawUrl.trim())
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null
    const host = url.hostname.toLowerCase().replace(/^www\./, '')

    let ytId = null
    if (host === 'youtu.be') {
      ytId = url.pathname.split('/').filter(Boolean)[0] || null
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') {
        ytId = url.searchParams.get('v')
      } else {
        const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/)
        if (match) ytId = match[1]
      }
    }
    if (ytId && /^[a-zA-Z0-9_-]{11}$/.test(ytId)) {
      return {
        type: 'youtube',
        href: url.href,
        embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0`,
        provider: 'YouTube',
        hostname: host,
      }
    }

    if (host === 'drive.google.com') {
      const driveMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
      if (driveMatch) {
        return {
          type: 'gdrive',
          href: url.href,
          embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
          provider: 'Google Drive',
          hostname: host,
        }
      }
    }

    if (/\.(?:mp4|webm|ogg)$/i.test(url.pathname)) {
      return {
        type: 'video',
        href: url.href,
        provider: 'วิดีโอ',
        hostname: host,
      }
    }

    return {
      type: 'link',
      href: url.href,
      provider: host.includes('facebook.com') || host.includes('fb.watch') ? 'Facebook Video' : host.includes('tiktok.com') ? 'TikTok' : host,
      hostname: host,
    }
  } catch {
    return null
  }
}
