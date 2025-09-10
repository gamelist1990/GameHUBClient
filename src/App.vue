<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import ErrorPage from "./ErrorPage.vue";

const REMOTE_URL = "https://pexserver.github.io/HUB/gui.html";

type Status = "checking" | "offline" | "ok" | "error";
const status = ref<Status>("checking");
const checkMessage = ref<string>("接続を確認しています...");
function fetchWithTimeout(url: string, timeout = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { method: "GET", signal: controller.signal }).finally(() => clearTimeout(id));
}

async function checkRemote() {
  status.value = "checking";
  checkMessage.value = "接続を確認しています...";

  if (!navigator.onLine) {
    status.value = "offline";
    checkMessage.value = "オフラインです。オフラインページを表示します。";
    return;
  }

  try {
    const res = await fetchWithTimeout(REMOTE_URL, 8000);
    if (res && res.ok) {
      status.value = "ok";
      // オンラインかつ取得可能ならリモートを別タブで開いて
      // 現在のページ（このランチャー）を残すことでオンライン/オフライン検知を継続する
      try {
        const newWin = window.open(REMOTE_URL, '_blank');
        // ポップアップブロックなどで開けなかった場合は従来どおり遷移
        if (!newWin) {
          window.location.replace(REMOTE_URL);
        }
      } catch (e) {
        console.warn("リモートページを新しいタブで開けませんでした、フォールバックで遷移します:", e);
        try { window.location.replace(REMOTE_URL); } catch (_) { /* ignore */ }
      }
    } else {
      status.value = "error";
      checkMessage.value = `リモートページを取得できませんでした (HTTP ${res?.status ?? "?"})`;
    }
  } catch (e) {
    status.value = "error";
    checkMessage.value = "リモートページに接続できませんでした。通信を確認してください。";
  }
}


function retry() {
  checkRemote();
}

function onlineHandler() {
  checkRemote();
}

function offlineHandler() {
  // オフライン検知: ステータスを更新して ErrorPage を表示する
  status.value = "offline";
  checkMessage.value = "オフラインになりました。";
}
// Note: offline window logic removed. ErrorPage component in the template
// will show the offline UI when `status` is set to 'offline'.

onMounted(() => {
  window.addEventListener("online", onlineHandler);
  window.addEventListener("offline", offlineHandler);
  checkRemote();
});

onBeforeUnmount(() => {
  window.removeEventListener("online", onlineHandler);
  window.removeEventListener("offline", offlineHandler);
});
</script>

<template>
  <div id="app-root" class="app-root">
    <ErrorPage :status="status" :message="checkMessage" :remoteUrl="REMOTE_URL" @retry="retry" />
  </div>
</template>

<style scoped>
.app-root {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
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