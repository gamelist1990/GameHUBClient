import { ref, onBeforeUnmount } from 'vue'

// シンプルな singleton-like network watcher
const isOnline = ref<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
let listenersCount = 0

function ensureListeners() {
  if (typeof window === 'undefined') return
  if (listenersCount > 0) return
  const onlineHandler = () => { isOnline.value = true }
  const offlineHandler = () => { isOnline.value = false }
  window.addEventListener('online', onlineHandler)
  window.addEventListener('offline', offlineHandler)
  listenersCount++
  // cleanup when module is unloaded is not typically needed, but provide a helper
  const stop = () => {
    if (typeof window === 'undefined') return
    window.removeEventListener('online', onlineHandler)
    window.removeEventListener('offline', offlineHandler)
    listenersCount = Math.max(0, listenersCount - 1)
  }
  return stop
}

export function useNetwork() {
  // Ensure global listeners are attached
  const stop = ensureListeners()
  // Provide a local cleanup hook if used inside components
  onBeforeUnmount(() => { if (stop) stop() })
  return { isOnline }
}

// --- 新規追加: キャッシュを確実に無効化して fetch を行うユーティリティ ---
export type FetchOptions = RequestInit & { timeout?: number; cacheBusting?: boolean }

export async function fetchNoCache(input: RequestInfo, init: FetchOptions = {}): Promise<Response> {
  const { timeout = 6000, cacheBusting = true, ...rest } = init

  const controller = new AbortController()
  const signal = controller.signal

  // ヘッダを明示的に付与してキャッシュを抑止
  // ただしクロスオリジンの場合は非標準ヘッダを送るとプリフライト(OPTIONS)が発生するため
  // サーバー制御で CORS が許可されていない場合に失敗する可能性がある。
  // そのため同一オリジン時のみ追加ヘッダを付与する。
  let fetchInit: RequestInit
  const existingHeaders = new Headers(rest.headers || {})

  // Determine if request is cross-origin. If input is a string and absolute, compare origins.
  let isCrossOrigin = false
  if (typeof window !== 'undefined' && typeof input === 'string') {
    try {
      const reqUrl = new URL(input, window.location.href)
      isCrossOrigin = reqUrl.origin !== window.location.origin
    } catch (e) {
      // If URL parsing fails, assume same-origin
      isCrossOrigin = false
    }
  }

  if (!isCrossOrigin) {
    if (!existingHeaders.has('pragma')) existingHeaders.set('pragma', 'no-cache')
    if (!existingHeaders.has('cache-control')) existingHeaders.set('cache-control', 'no-cache, no-store, must-revalidate')
    fetchInit = { ...rest, cache: 'no-store', signal, headers: existingHeaders }
  } else {
    // Cross-origin: avoid adding non-safelisted headers to prevent preflight
    fetchInit = { ...rest, cache: 'no-store', signal, headers: existingHeaders }
  }

  // URL にクエリを付けてキャッシュを回避（文字列の場合のみ）
  let url: RequestInfo = input
  if (cacheBusting && typeof input === 'string') {
    const sep = input.includes('?') ? '&' : '?'
    url = `${input}${sep}_=${Date.now()}`
  }

  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, fetchInit)
    clearTimeout(timer)
    return res
  } catch (err: any) {
    clearTimeout(timer)
    // タイムアウト（Abort）時
    if (err && err.name === 'AbortError') {
      throw new Error('fetch timeout')
    }
    // navigator.onLine が false なら確実にオフライン
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('offline')
    }
    throw err
  }
}

// 小さなリソースへネットワークリクエストを投げてオンラインを確認するユーティリティ
export async function confirmOnline(checkUrl = '/favicon.ico', timeout = 5000): Promise<boolean> {
  try {
    const res = await fetchNoCache(checkUrl, { method: 'GET', timeout, cacheBusting: true })
    return !!(res && res.ok)
  } catch (err) {
    // 明示的に navigator.onLine が false の場合はオフライン
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false
    // それ以外の fetch エラー（タイムアウトやネットワークエラー）はオフラインと判断
    return false
  }
}

