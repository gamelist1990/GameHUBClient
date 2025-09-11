<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ErrorPage from "./ErrorPage.vue";
import Notification from './components/Notification.vue'
import { useNetwork, fetchNoCache } from './utils/network'

const REMOTE_URL = "https://pexserver.github.io/HUB/gui.html";

type Status = "checking" | "offline" | "ok" | "error";
const status = ref<Status>("checking");
const checkMessage = ref<string>("接続を確認しています...");


// App側の簡易ラッパーは内部で `fetchNoCache` を使う
function fetchWithTimeout(url: string, timeout = 7000) {
  return fetchNoCache(url, { method: 'GET', timeout, cacheBusting: true })
}

async function checkRemote(): Promise<boolean> {
  status.value = "checking";
  checkMessage.value = "接続を確認しています...";

  if (!navigator.onLine) {
    status.value = "offline";
    checkMessage.value = "オフラインです。オフラインページを表示します。";
    return false;
  }

  try {
    const res = await fetchWithTimeout(REMOTE_URL, 8000);
    if (res && res.ok) {
      status.value = "ok";
      // フェッチ完了時点で念のためオンラインかを再確認してから遷移/新タブを開く
      // (ajax が返ってきた直後にオフラインになるレースを回避)
      if (!navigator.onLine) {
        // オフラインになっていたら遷移しない
        status.value = 'offline';
        checkMessage.value = '接続が切断されました。再接続をお試しください。';
        return false;
      } else {
        // オンラインなら通常の置き換えで遷移
        try {
          window.location.replace(REMOTE_URL);
        } catch (e) {
          console.warn("自動リダイレクトに失敗しました:", e);
        }
        return true;
      }
    } else {
      status.value = "error";
      checkMessage.value = `リモートページを取得できませんでした (HTTP ${res?.status ?? "?"})`;
      return false;
    }
  } catch (e) {
    status.value = "error";
    checkMessage.value = "リモートページに接続できませんでした。通信を確認してください。";
    return false;
  }
}


const notification = ref({ show: false, message: '', type: 'info' as 'success'|'error'|'info' })

async function retry() {
  const ok = await checkRemote()
  if (ok) {
    notification.value = { show: true, message: '再接続に成功しました。', type: 'success' }
  } else {
    notification.value = { show: true, message: '再接続に失敗しました。', type: 'error' }
  }
}

function onlineHandler() {
  checkRemote();
}

function offlineHandler() {
  // オフライン検知: ステータスを更新して ErrorPage を表示する
  status.value = "offline";
  checkMessage.value = "オフラインになりました。";
}

const { isOnline } = useNetwork()

onMounted(() => {
  // 初回チェック
  checkRemote();
})

// ネットワーク状態の変化を監視してハンドラを呼ぶ
watch(isOnline, (online) => {
  if (online) onlineHandler()
  else offlineHandler()
})
</script>

<template>
  <div id="app-root" class="app-root">
    <ErrorPage :status="status" :message="checkMessage" :remoteUrl="REMOTE_URL" @retry="retry" />
    <Notification :show="notification.show" :message="notification.message" :type="notification.type" :duration="3000" @close="notification.show = false" />
  </div>
</template>

<style scoped>
.app-root {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #202124;
  font-family: Roboto, Arial, Helvetica, sans-serif;
}
.center {
  text-align: center;
}
.card {
  background: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(60,64,67,0.15), 0 8px 24px rgba(60,64,67,0.08);
  max-width: 720px;
  width: 90%;
}
.headline {
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 8px 0;
}
.subtext {
  color: #5f6368;
  margin-bottom: 20px;
}
.spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 4px solid rgba(60,64,67,0.08);
  border-top-color: #1a73e8;
  animation: spin 1s linear infinite;
  margin: 16px auto 24px auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn-primary {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.btn-ghost {
  background: transparent;
  color: #1a73e8;
  border: none;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.ok h1, .offline h1, .error h1 { margin-bottom: 8px; }
.ok p, .offline p, .error p { margin: 0 0 12px 0; }
</style>