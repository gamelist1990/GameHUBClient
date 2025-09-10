<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

type Status = 'checking' | 'offline' | 'ok' | 'error'

const { status, message, remoteUrl } = defineProps<{
  status: Status
  message?: string
  remoteUrl?: string
}>()

const emits = defineEmits<{
  (e: 'retry'): void
}>()

function onRetry() {
  emits('retry')
}
</script>

<template>
  <div class="error-root">
    <div class="card">
      <div class="top">
        <div class="icon-wrap">
          <svg v-if="status === 'offline'" class="icon wifi" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M12 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4.7-2.3a6.5 6.5 0 0 0-9.4 0 .75.75 0 0 0 1.06 1.06 5 5 0 0 1 7.28 0 .75.75 0 0 0 1.06-1.06zM18.36 12.64a10.01 10.01 0 0 0-12.72 0 .75.75 0 0 0 1.06 1.06 8.5 8.5 0 0 1 10.6 0 .75.75 0 1 0 1.06-1.06z" />
          </svg>

          <svg v-else-if="status === 'error'" class="icon error-icon" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>

          <svg v-else-if="status === 'checking'" class="icon checking" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4z" />
          </svg>

          <svg v-else class="icon ok" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
          </svg>
        </div>
        <div class="text">
          <h1 class="title">
            <span v-if="status === 'offline'">オフラインです</span>
            <span v-else-if="status === 'error'">通信エラー</span>
            <span v-else-if="status === 'checking'">接続を確認中</span>
            <span v-else>移動中…</span>
          </h1>
          <p class="subtitle">{{ message ?? (status === 'offline' ? 'ネットワークに接続されていません。Wi‑Fiや有線接続を確認してください。' : 'リモートサービスへ接続できません。') }}</p>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="onRetry">
          <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5 0 .39-.04.77-.12 1.13l1.46.43A7 7 0 0 0 19 13c0-3.87-3.13-7-7-7z"/>
          </svg>
          再接続
        </button>

        <a v-if="remoteUrl" :href="remoteUrl" target="_blank" rel="noreferrer" class="btn-ghost">リモートを開く</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout */
.error-root { height: 100vh; display:flex; align-items:center; justify-content:center; background: #f1f3f4; }
.card { width: min(720px, 92%); background: #fff; border-radius: 8px; padding: 28px; box-shadow: 0 2px 6px rgba(60,64,67,0.12); display:flex; flex-direction:column; gap:18px; }
.top { display:flex; gap:18px; align-items:center; }
.icon-wrap { width:72px; height:72px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(26,115,232,0.08); }
.icon { width:40px; height:40px; color:#1a73e8; }
.error-icon { color:#d93025; background: rgba(217,48,37,0.06); }
.checking { color:#f6bf00; }
.ok { color:#188038; }

.text { flex:1; }
.title { margin:0; font-size:20px; font-weight:500; color:#202124; }
.subtitle { margin:6px 0 0 0; color:#5f6368; }

/* Actions */
.actions { display:flex; gap:12px; align-items:center; }
.btn-primary { display:inline-flex; align-items:center; gap:8px; background:#1a73e8; color:white; border:none; padding:10px 16px; border-radius:4px; font-weight:500; cursor:pointer; box-shadow: 0 1px 2px rgba(26,115,232,0.2); }
.btn-primary:active { transform: translateY(1px); }
.btn-icon { width:18px; height:18px; color: rgba(255,255,255,0.95); }
.btn-ghost { color:#1a73e8; text-decoration: none; padding:8px 12px; border-radius:4px; border:1px solid rgba(26,115,232,0.12); }

/* Responsive */
@media (max-width:480px) {
  .top { gap:12px; }
  .icon-wrap { width:56px; height:56px; }
  .icon { width:32px; height:32px; }
  .title { font-size:18px; }
}
</style>
