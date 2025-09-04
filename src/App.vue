<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

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
      // オンラインかつ取得可能ならリダイレクト（iframe は使用しない）
      // replace を使って履歴を残さず遷移
      try {
        window.location.replace(REMOTE_URL);
      } catch (e) {
        // ブラウザ環境やセキュリティ制約でリダイレクトできない場合はそのまま状態を ok にして
        // ユーザーに手動で開いてもらうリンクを表示する
        console.warn("自動リダイレクトに失敗しました:", e);
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
  status.value = "offline";
  checkMessage.value = "オフラインになりました。";
}

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
    <div v-if="status === 'checking'" class="center">
      <p>{{ checkMessage }}</p>
      <div class="spinner" aria-hidden></div>
    </div>

    <div v-else-if="status === 'offline'" class="offline center">
      <h1>オフライン</h1>
      <p>インターネット接続が見つかりません。ネットワークに接続してから再起動してください。</p>
    </div>

    <div v-else-if="status === 'error'" class="error center">
      <h1>通信エラー</h1>
      <p>{{ checkMessage }}</p>
      <button @click="retry">再試行</button>
    </div>

    <div v-else-if="status === 'ok'" class="ok center">
      <h1>リモートページへ移動中…</h1>
      <p>自動的に外部ページへ移動します。移動しない場合は以下のリンクを開いてください。</p>
      <p><a :href="REMOTE_URL" target="_blank" rel="noreferrer">リモートページを開く</a></p>
    </div>
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