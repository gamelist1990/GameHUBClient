<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

type Status = 'checking' | 'offline' | 'ok' | 'error'

const props = defineProps<{
  status: Status
  message?: string
}>()

const emits = defineEmits<{ (e: 'retry'): void }>()

const title = computed(() => {
  switch (props.status) {
    case 'offline': return 'オフライン'
    case 'error': return '通信エラー'
    case 'checking': return '接続を確認中…'
    default: return '準備中…'
  }
})

const emoji = computed(() => {
  switch (props.status) {
    case 'offline': return '📴'
    case 'error': return '⚠️'
    case 'checking': return '⏳'
    default: return '✅'
  }
})

const defaultMessage = computed(() => {
  return props.status === 'offline'
    ? 'ネットワークに接続されていません。ネットワーク接続を確認してください。'
    : 'リモートサービスに接続できません。'
})

function onRetry() {
  emits('retry')
}
</script>

<template>
  <div class="error-root" role="alertdialog" aria-labelledby="err-title" aria-describedby="err-desc">
    <div class="mac-card">
      

      <div class="content">
        <div class="icon-wrap" :class="props.status" aria-hidden>
          <span class="emoji">{{ emoji }}</span>
        </div>

        <div class="text">
          <h1 id="err-title">{{ title }}</h1>
          <p id="err-desc" class="desc">{{ props.message ?? defaultMessage }}</p>
        </div>

        <div class="actions">
          <button class="btn-secondary" @click="onRetry">再接続</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide native scrollbars globally for the app container; still allow scroll via wheel/trackpad. */
/* WebKit browsers. */
::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

/* Firefox. */
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.error-root {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f3f4f6, #e6edf3);
  padding: 28px;
  box-sizing: border-box;
}

.mac-card {
  width: min(720px, 94%);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(16, 24, 40, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(16, 24, 40, 0.06);
  overflow: hidden;
}



.content {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 20px 28px 28px;
}

.icon-wrap {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(180deg, #fafafa, #e9eef6);
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
}

.icon-wrap .emoji {
  font-size: 44px;
  line-height: 1;
  display: inline-block;
}

.text {
  flex: 1;
  min-width: 0;
}

.text h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.desc {
  margin: 8px 0 0 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-secondary {
  background: #007aff;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 6px 12px rgba(0, 122, 255, 0.15);
  cursor: pointer;
}

.btn-secondary:active {
  transform: translateY(1px);
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.06);
  padding: 9px 12px;
  border-radius: 8px;
  color: #0f172a;
  cursor: pointer;
}

/* Status color cues. */
.icon-wrap.offline {
  background: linear-gradient(180deg, #fff1f0, #fee2e2);
}

.icon-wrap.error {
  background: linear-gradient(180deg, #fff1f0, #fee2e2);
}

.icon-wrap.checking {
  background: linear-gradient(180deg, #fffaf0, #fffbeb);
}

.icon-wrap.ok {
  background: linear-gradient(180deg, #f0fdf4, #ecfdf5);
}

@media (max-width: 600px) {
  .content {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    justify-content: flex-end;
  }

  .icon-wrap {
    margin: 0 auto 8px;
  }
}
</style>

<style>
/* Ensure the app root and document fill the viewport so the background covers the whole page. */
html,
body,
#app {
  height: 100%;
  margin: 0;
}

/* Apply the same background gradient to the document so it covers the full viewport. */
body {
  background: linear-gradient(180deg, #f3f4f6, #e6edf3);
}
</style>
