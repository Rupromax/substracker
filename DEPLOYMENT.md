# SubsTracker 部署指南

## 📦 打包完成狀態

### ✅ 前端打包完成

打包後的文件位於：`frontend/dist/`

- `index.html` - 主頁面
- `assets/index-CotAJS0u.css` - 樣式文件
- `assets/index-g0wGPR_A.js` - JavaScript 文件

## 🚀 部署方式

### 方案一：部署到 Cloudflare Pages（推薦）

#### 前端部署

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** > **Create application** > **Pages**
3. 選擇 **Upload assets**
4. 上傳整個 `frontend/dist` 資料夾的內容
5. 設定專案名稱，點擊 **Save and Deploy**

#### 後端部署

```bash
cd backend
npx wrangler deploy
```

**注意事項：**

- 需要先登入 Cloudflare：`npx wrangler login`
- 確保 D1 資料庫和 KV namespace 已經在 Cloudflare 設定好
- 部署後記得更新前端的 API URL

---

### 方案二：部署到其他平台

#### 前端部署選項：

**A. Netlify**

1. 登入 [Netlify](https://www.netlify.com/)
2. 拖曳 `frontend/dist` 資料夾到網站
3. 或透過 CLI：

```bash
npm install -g netlify-cli
cd frontend/dist
netlify deploy --prod
```

**B. Vercel**

```bash
npm install -g vercel
cd frontend/dist
vercel --prod
```

**C. GitHub Pages**

1. 將 `frontend/dist` 內容推送到 `gh-pages` 分支
2. 在 GitHub 倉庫設定中啟用 GitHub Pages

**D. 傳統虛擬主機**

- 將 `frontend/dist` 資料夾內的所有文件上傳到網站根目錄
- 確保伺服器支援 SPA (Single Page Application) 路由

---

## ⚙️ 部署前設定

### 1. 更新 API URL

部署前端前，需要更新 API 端點。編輯 `frontend/src/api.ts`：

```typescript
const API_BASE_URL = "https://your-backend.workers.dev"; // 改成你的後端 URL
```

然後重新打包：

```bash
npm --prefix frontend run build
```

### 2. 更新 CORS 設定

部署後端後，更新 `backend/wrangler.toml` 的 ALLOWED_ORIGINS：

```toml
[vars]
ALLOWED_ORIGINS = "https://your-frontend-domain.com"
```

然後重新部署後端：

```bash
cd backend
npx wrangler deploy
```

---

## 🔧 環境變數設定

### 前端 (如果需要)

在 `frontend/.env` 設定：

```
VITE_API_URL=https://your-backend.workers.dev
```

### 後端

在 Cloudflare Dashboard 設定：

- 進入 Workers & Pages > 選擇你的 worker
- Settings > Variables
- 新增環境變數：
  - `DEFAULT_CURRENCY`: TWD
  - `ALLOWED_ORIGINS`: https://your-frontend-domain.com

---

## 📋 資料庫設定

### D1 資料庫初始化

```bash
cd backend

# 執行資料庫遷移
npx wrangler d1 execute subs-db --file=./migrations/001_initial_schema.sql --remote
```

---

## 🧪 測試部署

部署完成後測試：

1. **測試前端**：訪問你的前端網址
2. **測試後端**：訪問 `https://your-backend.workers.dev/health`
3. **測試登入**：
   - 帳號：`admin`
   - 密碼：`123456`

---

## 📝 快速部署指令

### 完整部署流程

```bash
# 1. 打包前端
npm --prefix frontend run build

# 2. 部署後端到 Cloudflare Workers
cd backend
npx wrangler login
npx wrangler deploy

# 3. 上傳前端到 Cloudflare Pages
# (透過網頁介面上傳 frontend/dist 資料夾)
```

---

## 🔒 安全建議

1. **更改預設密碼**：部署後立即修改 `admin/123456` 這組帳密
2. **設定環境變數**：不要將敏感資訊寫在程式碼中
3. **啟用 HTTPS**：確保前後端都使用 HTTPS
4. **限制 CORS**：只允許你的前端網域訪問後端

---

## 📞 常見問題

**Q: 部署後無法連接 API？**
A: 檢查 CORS 設定和 API URL 是否正確

**Q: 資料庫錯誤？**
A: 確認已執行資料庫遷移腳本

**Q: 登入失敗？**
A: 檢查後端是否正確部署，查看 Cloudflare Workers 日誌

---

## 📂 檔案結構

```
frontend/dist/          # 前端打包後的文件（上傳這個資料夾）
├── index.html
└── assets/
    ├── index-CotAJS0u.css
    └── index-g0wGPR_A.js

backend/               # 後端源碼
├── src/
│   └── index.ts
└── wrangler.toml     # Cloudflare Workers 配置
```

---

## 🎉 完成！

現在你的 SubsTracker 應用已經準備好部署了！選擇適合的平台並按照上述步驟操作即可。
