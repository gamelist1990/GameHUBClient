# GameHUB

## 概要
GameHUB はブラウザ（およびデスクトップ）上で様々なゲームを楽しめるクライアントアプリケーションです。本リポジトリはフロントエンド（Vite + Vue 3）および Tauri を使ったデスクトップビルドのソースコードを含みます。

## 主要技術
- フロントエンド: Vue 3, Vite, TypeScript
- デスクトップ: Tauri (Rust)

（リポジトリのルートに `package.json`、`src-tauri/`、`Cargo.toml` が存在します）

## 必要条件
- Node.js / bun / pnpm などの JavaScript 実行環境
- Rust と Cargo（Tauri のデスクトップビルドを行う場合）

## 使い方（開発）
まず依存関係をインストールします（プロジェクトで使っているパッケージマネージャに合わせて選んでください）。

PowerShell の例:

```powershell
# bun を使う場合
bun install

# npm を使う場合
npm install
```

開発サーバーを起動:

```powershell
# フロントエンドの開発サーバー (Vite)
bun run dev
# または
npm run dev
```

Tauri デスクトップアプリを開発モードで起動する場合:

```powershell
# ルートで
bun run tauri dev
# または npm run tauri dev
```

## ビルド（配布用）
フロントエンドとデスクトップバンドルをビルドします。

```powershell
# フロントエンドビルド
bun run build

# デスクトップビルド
bun run tauri build
```

## 貢献
プルリクエストや issue を歓迎します。開発フローに関する簡単なガイド:

1. 新しいブランチを作る
2. 小さな単位で変更を行う
3. テスト・ビルドを確認してから PR を送る

## ライセンス

MIT License

## 備考
README を簡潔に更新しました。リポジトリ内の他のドキュメント（`src-tauri` 内の設定や `package.json` のスクリプト）に合わせて文言を調整することを推奨します。