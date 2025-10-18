# 數據庫設置指南

## 概述

此後端現在使用 Cloudflare D1 數據庫（SQLite）來存儲訂閱數據，而不是之前的 KV 存儲。

## 數據庫結構

### subscriptions 表

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly','yearly')),
  next_billing_date TEXT NOT NULL,              -- YYYY-MM-DD
  status TEXT NOT NULL DEFAULT 'active',        -- active | paused | cancelled
  category TEXT,
  website TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
```

### 索引

- `idx_subs_next_billing`: 按下次計費日期排序
- `idx_subs_status`: 按狀態篩選

## 設置步驟

### 1. 確保 D1 數據庫已配置

檢查 `wrangler.toml` 文件中的 D1 配置：

```toml
[[d1_databases]]
binding = "DB"
database_name = "subs-db"
database_id = "your-database-id"
```

### 2. 初始化數據庫

有兩種方式初始化數據庫：

#### 方式一：使用 API 端點（推薦）

```bash
curl -X POST http://localhost:8787/api/init-db
```

#### 方式二：使用 Wrangler CLI

```bash
wrangler d1 execute subs-db --file=./migrations/001_initial_schema.sql
```

### 3. 啟動開發服務器

```bash
npm run dev
```

### 4. 測試數據庫連接

運行測試腳本：

```bash
node test-db.js
```

## API 端點

### 數據庫管理

- `POST /api/init-db` - 初始化數據庫表結構

### 訂閱管理

- `GET /api/subscriptions` - 獲取所有訂閱
- `GET /api/subscriptions/:id` - 獲取單個訂閱
- `POST /api/subscriptions` - 創建新訂閱
- `PUT /api/subscriptions/:id` - 更新訂閱
- `DELETE /api/subscriptions/:id` - 刪除訂閱

## 數據格式

### 創建訂閱請求

```json
{
  "name": "Netflix",
  "description": "串流媒體服務",
  "price": 15.99,
  "currency": "USD",
  "billing_cycle": "monthly",
  "next_billing_date": "2024-02-15",
  "status": "active",
  "category": "娛樂",
  "website": "https://netflix.com"
}
```

### 訂閱響應

```json
{
  "id": 1,
  "name": "Netflix",
  "description": "串流媒體服務",
  "price": 15.99,
  "currency": "USD",
  "billing_cycle": "monthly",
  "next_billing_date": "2024-02-15",
  "status": "active",
  "category": "娛樂",
  "website": "https://netflix.com",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## 遷移注意事項

### 從 KV 存儲遷移

如果您之前使用 KV 存儲，需要：

1. 導出現有的 KV 數據
2. 轉換數據格式以匹配新的數據庫結構
3. 使用 API 創建新的訂閱記錄

### 字段映射

| 舊字段 (KV)        | 新字段 (D1)         | 說明                    |
| ------------------ | ------------------- | ----------------------- |
| `id` (string)      | `id` (number)       | 自動遞增的整數 ID       |
| `renewAt`          | `next_billing_date` | 日期格式改為 YYYY-MM-DD |
| `billingCycle`     | `billing_cycle`     | 移除 'weekly' 選項      |
| `note`             | `description`       | 重命名字段              |
| `notifyBeforeDays` | -                   | 已移除                  |
| `status`           | `status`            | 新增 'paused' 狀態      |
| -                  | `category`          | 新增分類字段            |
| -                  | `website`           | 新增網站字段            |

## 故障排除

### 常見問題

1. **數據庫連接失敗**

   - 檢查 `wrangler.toml` 中的 D1 配置
   - 確保數據庫 ID 正確

2. **表不存在錯誤**

   - 運行數據庫初始化腳本
   - 檢查 SQL 語法是否正確

3. **數據類型錯誤**
   - 確保日期格式為 YYYY-MM-DD
   - 檢查必填字段是否提供

### 調試

啟用詳細日誌：

```bash
wrangler dev --log-level debug
```

檢查數據庫內容：

```bash
wrangler d1 execute subs-db --command="SELECT * FROM subscriptions;"
```
