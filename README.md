SubsTracker 訂閱管理系統
專案說明

這個專案是我在面試準備期間製作的練習作品。
主要使用 Vue 3 開發，並在過程中嘗試整合 Vite、TypeScript 與 Tailwind CSS。
一開始我對 Vite 與 TypeScript 幾乎不熟，但在開發過程中透過 AI 協助、自行查資料與多次測試，逐漸理解它們的專案結構與設定方式，也學會如何在實作中排錯與調整設定。
這讓我從只熟悉前端框架，進一步理解了前端建構工具與型別系統的實際應用。

後端最初設計是使用 Cloudflare KV 作為資料儲存方案，但因為在實作過程中遇到限制，
我改用 Cloudflare D1 資料庫作為後端，這是一個基於 SQLite 的雲端資料庫，
可以更穩定地進行新增、修改、刪除與查詢。
目前專案的資料都儲存在 D1（subs-db）中，用來模擬訂閱項目與提醒紀錄。
雖然目前的資料安全與驗證機制仍在初步階段，但未來會持續改進與優化。

使用說明

下載或 clone 專案後，進入專案目錄

執行以下指令安裝依賴：

npm install


啟動本地開發伺服器：

npm run dev


開啟瀏覽器並前往
http://localhost:5173

專案架構

前端：Vue 3 + Vite + Tailwind CSS
語言：TypeScript
後端：Cloudflare Workers + D1 資料庫（subs-db）
功能：新增、編輯、刪除訂閱項目，計算剩餘天數

專案目錄結構
SubsTracker/
├── frontend/           # 前端應用
│   ├── src/
│   │   ├── components/     # Vue 組件
│   │   ├── pages/          # 頁面
│   │   ├── stores/         # Pinia 狀態管理
│   │   └── router/         # 路由設定
│   └── dist/               # 打包後的靜態文件
│       ├── index.html
│       └── assets/
│           ├── index-CotAJS0u.css
│           └── index-g0wGPR_A.js
│
├── backend/            # 後端 API
│   ├── src/
│   │   └── index.ts         # 主 Worker 檔案
│   ├── migrations/          # D1 資料庫遷移設定
│   └── wrangler.toml        # Cloudflare Workers 配置
│
├── deploy.bat           # 一鍵部署腳本
└── DEPLOYMENT.md        # 詳細部署指南

API 說明

這個專案的後端是使用 Cloudflare Workers 實作的 RESTful API，
資料儲存在 Cloudflare D1 資料庫中，用於模擬訂閱項目與提醒紀錄。

創建訂閱
POST
URL：https://subs-backend.andy9729701.workers.dev/api/subscriptions

獲取訂閱列表
GET
URL：https://subs-backend.andy9729701.workers.dev/api/subscriptions

更新訂閱
PUT
URL：https://subs-backend.andy9729701.workers.dev/api/subscriptions/{id}

刪除訂閱
DELETE
URL：https://subs-backend.andy9729701.workers.dev/api/subscriptions/{id}

這次開發讓我從只熟悉 Vue 前端，到能理解完整的雲端架構與資料流程。
我學會使用 AI 輔助學習新技術、排錯與部署，也理解了 D1 資料庫與 KV 的差異。
未來將持續提升 TypeScript 熟練度、資料安全性與排程通知邏輯，讓系統架構更符合 SaaS 平台的實際運作模式。