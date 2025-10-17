# SubsTracker 訂閱管理與提醒系統

這是一個使用 Vue 3 + Vite + Pinia + Tailwind 製作的訂閱管理工具。

## 🔐 預設帳號密碼

- 帳號：`admin`
- 密碼：`123456`

⚠️ **部署到生產環境後請立即修改密碼！**

## 🚀 快速開始

### 開發模式

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 📦 打包部署

```bash
# 方式一：使用一鍵部署腳本（Windows）
deploy.bat

# 方式二：手動打包
npm run build

# 打包完成後，前端文件位於：frontend/dist/
```

## 📖 部署指南

詳細的部署說明請查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署到 Cloudflare

1. **部署前端到 Cloudflare Pages**

   - 上傳 `frontend/dist` 資料夾

2. **部署後端到 Cloudflare Workers**
   ```bash
   cd backend
   npx wrangler login
   npx wrangler deploy
   ```

支援的部署平台：

- ✅ Cloudflare Pages + Workers（推薦）
- ✅ Netlify
- ✅ Vercel
- ✅ GitHub Pages
- ✅ 傳統虛擬主機

## 🛠️ 技術架構

### 前端

- Vue 3
- Vite
- Pinia (狀態管理)
- Vue Router
- Tailwind CSS

### 後端

- Cloudflare Workers
- Hono (Web 框架)
- D1 資料庫
- KV 儲存

## 📁 專案結構

```
SubsTracker/
├── frontend/           # 前端應用
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── router/
│   └── dist/          # 打包後的文件
├── backend/           # 後端 API
│   ├── src/
│   │   └── index.ts
│   └── migrations/    # 資料庫遷移
├── deploy.bat         # 一鍵部署腳本
└── DEPLOYMENT.md      # 詳細部署指南
```

## 📞 需要幫助？

- 📖 查看 [部署指南](./DEPLOYMENT.md)
- 🐛 遇到問題？請檢查 Cloudflare Workers 日誌
