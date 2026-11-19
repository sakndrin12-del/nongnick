import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEBOUNCE_MS = Number(process.env.AUTO_SYNC_DEBOUNCE_MS) || 8000
const BRANCH = process.env.AUTO_SYNC_BRANCH || 'main'

const IGNORED_SEGMENTS = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  'backups',
  '.agents',
  '.claude',
  '.windsurf',
])

function shouldIgnore(relPath) {
  if (!relPath) return true
  const normalized = relPath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  for (const part of parts) {
    if (IGNORED_SEGMENTS.has(part)) return true
  }
  const base = parts[parts.length - 1]
  if (base === '.env' || (base.startsWith('.env.') && base !== '.env.example')) return true
  if (normalized.startsWith('uploads/') || normalized.startsWith('backend/uploads/')) {
    return base !== '.gitkeep'
  }
  if (base.endsWith('.log') || base.endsWith('.tmp') || base.endsWith('.swp') || base.endsWith('~')) return true
  return false
}

async function runGit(args) {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd: rootDir,
    env: { ...process.env, SKIP_POST_COMMIT_PUSH: '1' },
  })
  return { stdout: stdout.trim(), stderr: stderr.trim() }
}

let timer = null
let isSyncing = false
let pendingSync = false
const changedFiles = new Set()

async function syncToGitHub(reason = 'file change') {
  if (isSyncing) {
    pendingSync = true
    return
  }
  isSyncing = true
  try {
    const { stdout: statusOut } = await runGit(['status', '--porcelain'])
    if (!statusOut) {
      changedFiles.clear()
      return
    }

    await runGit(['add', '-A'])

    const { stdout: stagedOut } = await runGit(['diff', '--cached', '--name-only'])
    if (!stagedOut) {
      changedFiles.clear()
      return
    }

    const files = stagedOut.split(/\r?\n/).filter(Boolean)
    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' })
    const summary = files.length <= 3 ? files.join(', ') : `${files.slice(0, 3).join(', ')} (+${files.length - 3} more)`
    const commitMsg = `chore(auto-sync): update ${summary} [${timestamp}]`

    await runGit(['commit', '-m', commitMsg])
    console.log(`[Auto-Sync] Committed ${files.length} file(s): ${commitMsg}`)

    await runGit(['push', 'origin', BRANCH])
    console.log(`[Auto-Sync] Pushed to origin/${BRANCH} successfully (${reason}).`)
    changedFiles.clear()
  } catch (error) {
    console.error('[Auto-Sync] Error during git sync:', error.stderr || error.message)
  } finally {
    isSyncing = false
    if (pendingSync) {
      pendingSync = false
      scheduleSync('queued changes')
    }
  }
}

function scheduleSync(fileInfo) {
  if (fileInfo) changedFiles.add(fileInfo)
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    syncToGitHub('auto-watch')
  }, DEBOUNCE_MS)
}

console.log(`[Auto-Sync] Watching ${rootDir} for changes (debounce: ${DEBOUNCE_MS / 1000}s -> origin/${BRANCH})...`)

// Perform an initial sync check on startup
await syncToGitHub('startup check')

fs.watch(rootDir, { recursive: true }, (_eventType, filename) => {
  if (!filename) return
  if (shouldIgnore(filename)) return
  console.log(`[Auto-Sync] Detected change: ${filename}`)
  scheduleSync(filename)
})
