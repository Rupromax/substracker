import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest, ApiResponse } from './types'

// 導入 Cloudflare Workers 類型
/// <reference types="@cloudflare/workers-types" />

type Bindings = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// 安全標頭中間件
app.use('*', async (c, next) => {
    // 添加安全標頭
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('Content-Security-Policy', "frame-ancestors 'none'")
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    // 設置正確的 Content-Type
    c.header('Content-Type', 'application/json; charset=utf-8')

    // 添加快取控制標頭
    if (c.req.method === 'GET') {
        c.header('Cache-Control', 'public, max-age=300') // 5分鐘快取
    } else {
        c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    }

    await next()
})

// CORS 設定
app.use('*', cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5173',
        'https://rupromax.github.io'
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

// 錯誤處理中間件
app.onError((err, c) => {
    console.error('API Error:', err)
    return c.json({
        success: false,
        error: err.message || 'Internal Server Error',
        message: '服務器內部錯誤'
    } as ApiResponse, 500)
})

// 數據驗證函數
function validateSubscription(data: any): string[] {
    const errors: string[] = []

    // 添加調試日誌
    console.log('=== Backend Validation Debug ===')
    console.log('Received data:', JSON.stringify(data, null, 2))
    console.log('Date fields check:')
    console.log('  next_billing_date:', data.next_billing_date)
    console.log('  nextBilling:', data.nextBilling)
    console.log('  next_billing:', data.next_billing)
    console.log('  renewalDate:', data.renewalDate)
    console.log('  renewal_date:', data.renewal_date)
    console.log('===============================')

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('訂閱名稱是必填項')
    }

    // 檢查多種可能的日期字段名稱，並接受任何存在的日期字段
    const nextBillingDate = data.next_billing_date || data.nextBilling || data.next_billing || data.renewalDate || data.renewal_date ||
        data.nextBillingDate || data.next_billing_Date || data.NextBilling

    console.log('Selected nextBillingDate:', nextBillingDate)
    console.log('Type of nextBillingDate:', typeof nextBillingDate)

    // 如果沒有找到任何日期字段，跳過驗證（讓數據庫處理）
    if (nextBillingDate && typeof nextBillingDate === 'string') {
        // 處理 ISO 日期格式 (YYYY-MM-DDTHH:mm:ss.sssZ) 或簡單日期格式 (YYYY-MM-DD)
        let dateToValidate = nextBillingDate
        if (nextBillingDate.includes('T')) {
            // 如果是 ISO 格式，提取日期部分
            dateToValidate = nextBillingDate.split('T')[0]
        }

        // 驗證日期格式 YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(dateToValidate)) {
            errors.push('續約日期格式必須是 YYYY-MM-DD')
        } else {
            const date = new Date(dateToValidate)
            if (isNaN(date.getTime())) {
                errors.push('續約日期格式無效')
            }
        }
    }

    if (data.price === undefined || data.price === null || typeof data.price !== 'number' || data.price < 0) {
        errors.push('價格必須是非負數')
    }

    if (!data.currency || typeof data.currency !== 'string') {
        errors.push('貨幣代碼是必填項')
    }

    // 檢查多種可能的計費週期字段名稱
    const billingCycle = data.billing_cycle || data.billingCycle

    console.log('Billing cycle check:', billingCycle, 'Valid values:', ['monthly', 'yearly'].includes(billingCycle))

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
        errors.push('計費週期必須是 monthly 或 yearly')
    }

    if (data.status && !['active', 'paused', 'cancelled'].includes(data.status)) {
        errors.push('狀態必須是 active、paused 或 cancelled')
    }

    console.log('Validation errors:', errors)
    return errors
}

// D1 數據庫服務類
class SubscriptionService {
    private db: D1Database

    constructor(db: D1Database) {
        this.db = db
    }

    async getAll(): Promise<Subscription[]> {
        try {
            const result = await this.db.prepare(`
                SELECT * FROM subscriptions
                ORDER BY next_billing_date ASC
            `).all()

            // 確保沒有 null 值，轉換為空字符串
            return result.results.map((item: any) => ({
                id: item.id,
                name: item.name || '',
                description: item.description || '',
                price: item.price || 0,
                currency: item.currency || 'TWD',
                billing_cycle: item.billing_cycle || 'monthly',
                next_billing_date: item.next_billing_date || '',
                status: item.status || 'active',
                category: item.category || '',
                website: item.website || '',
                created_at: item.created_at || new Date().toISOString(),
                updated_at: item.updated_at || new Date().toISOString()
            })) as Subscription[]
        } catch (error) {
            console.error('獲取訂閱列表失敗:', error)
            throw new Error('獲取訂閱列表失敗')
        }
    }

    async getById(id: number): Promise<Subscription | null> {
        try {
            const result = await this.db.prepare(`
                SELECT * FROM subscriptions WHERE id = ?
            `).bind(id).first()

            if (!result) {
                return null
            }

            // 確保沒有 null 值，轉換為空字符串
            return {
                id: result.id,
                name: result.name || '',
                description: result.description || '',
                price: result.price || 0,
                currency: result.currency || 'TWD',
                billing_cycle: result.billing_cycle || 'monthly',
                next_billing_date: result.next_billing_date || '',
                status: result.status || 'active',
                category: result.category || '',
                website: result.website || '',
                created_at: result.created_at || new Date().toISOString(),
                updated_at: result.updated_at || new Date().toISOString()
            } as Subscription
        } catch (error) {
            console.error('獲取訂閱失敗:', error)
            throw new Error('獲取訂閱失敗')
        }
    }

    async create(data: CreateSubscriptionRequest): Promise<Subscription> {
        try {
            console.log('=== Create Subscription Debug ===')
            console.log('Input data:', JSON.stringify(data, null, 2))

            const now = new Date().toISOString()

            // 處理多種可能的日期字段名稱
            const nextBillingDate = data.next_billing_date || (data as any).nextBilling || (data as any).next_billing || (data as any).renewalDate || (data as any).renewal_date

            // 處理計費週期字段名稱
            const billingCycle = data.billing_cycle || (data as any).billingCycle

            console.log('Processed nextBillingDate:', nextBillingDate)
            console.log('Processed billingCycle:', billingCycle)

            // 處理日期格式，確保是 YYYY-MM-DD 格式
            let formattedDate = nextBillingDate
            if (nextBillingDate && nextBillingDate.includes('T')) {
                formattedDate = nextBillingDate.split('T')[0]
            }

            console.log('Formatted date:', formattedDate)

            console.log('About to insert with values:', {
                name: data.name,
                description: data.description || null,
                price: data.price,
                currency: data.currency,
                billingCycle,
                formattedDate,
                status: data.status || 'active',
                category: data.category || null,
                website: data.website || null,
                now
            })

            const result = await this.db.prepare(`
                INSERT INTO subscriptions (
                    name, description, price, currency, billing_cycle,
                    next_billing_date, status, category, website,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                data.name,
                data.description || null,
                data.price,
                data.currency,
                billingCycle,
                formattedDate,
                data.status || 'active',
                data.category || null,
                data.website || null,
                now,
                now
            ).run()

            console.log('Insert result:', result)
            console.log('Insert meta:', result.meta)
            console.log('Last row ID:', result.meta?.last_row_id)

            if (!result.success) {
                console.error('Insert failed:', result)
                throw new Error('創建訂閱失敗')
            }

            // 檢查 last_row_id 是否存在
            let lastRowId = result.meta?.last_row_id

            if (!lastRowId || lastRowId <= 0) {
                console.warn('Invalid last_row_id:', lastRowId, 'trying to get latest record')

                // 備用方案：查詢最新的記錄
                const latestResult = await this.db.prepare(`
                    SELECT id FROM subscriptions
                    WHERE name = ? AND created_at = ?
                    ORDER BY id DESC LIMIT 1
                `).bind(data.name, now).first()

                if (latestResult && latestResult.id) {
                    lastRowId = latestResult.id as number
                    console.log('Found latest record ID:', lastRowId)
                } else {
                    console.error('Cannot find created record')
                    throw new Error('創建訂閱失敗：無法獲取有效的訂閱 ID')
                }
            }

            const subscription = await this.getById(lastRowId)
            if (!subscription) {
                throw new Error('創建後無法獲取訂閱')
            }

            console.log('Created subscription:', subscription)
            return subscription
        } catch (error) {
            console.error('創建訂閱失敗:', error)
            throw new Error('創建訂閱失敗')
        }
    }

    async update(id: number, data: UpdateSubscriptionRequest): Promise<Subscription | null> {
        try {
            const existing = await this.getById(id)
            if (!existing) {
                return null
            }

            const now = new Date().toISOString()

            // 構建動態更新語句
            const updateFields: string[] = []
            const values: any[] = []

            if (data.name !== undefined) {
                updateFields.push('name = ?')
                values.push(data.name)
            }
            if (data.description !== undefined) {
                updateFields.push('description = ?')
                values.push(data.description)
            }
            if (data.price !== undefined) {
                updateFields.push('price = ?')
                values.push(data.price)
            }
            if (data.currency !== undefined) {
                updateFields.push('currency = ?')
                values.push(data.currency)
            }
            // 處理計費週期字段名稱
            const billingCycle = data.billing_cycle || (data as any).billingCycle
            if (billingCycle !== undefined) {
                updateFields.push('billing_cycle = ?')
                values.push(billingCycle)
            }

            // 處理日期字段名稱
            const nextBillingDate = data.next_billing_date || (data as any).nextBilling || (data as any).next_billing || (data as any).renewalDate || (data as any).renewal_date
            if (nextBillingDate !== undefined) {
                // 處理日期格式，確保是 YYYY-MM-DD 格式
                let formattedDate = nextBillingDate
                if (nextBillingDate && nextBillingDate.includes('T')) {
                    formattedDate = nextBillingDate.split('T')[0]
                }
                updateFields.push('next_billing_date = ?')
                values.push(formattedDate)
            }
            if (data.status !== undefined) {
                updateFields.push('status = ?')
                values.push(data.status)
            }
            if (data.category !== undefined) {
                updateFields.push('category = ?')
                values.push(data.category)
            }
            if (data.website !== undefined) {
                updateFields.push('website = ?')
                values.push(data.website)
            }

            updateFields.push('updated_at = ?')
            values.push(now)
            values.push(id)

            const result = await this.db.prepare(`
                UPDATE subscriptions
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `).bind(...values).run()

            if (!result.success) {
                throw new Error('更新訂閱失敗')
            }

            return await this.getById(id)
        } catch (error) {
            console.error('更新訂閱失敗:', error)
            throw new Error('更新訂閱失敗')
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const existing = await this.getById(id)
            if (!existing) {
                return false
            }

            const result = await this.db.prepare(`
                DELETE FROM subscriptions WHERE id = ?
            `).bind(id).run()

            return result.success
        } catch (error) {
            console.error('刪除訂閱失敗:', error)
            throw new Error('刪除訂閱失敗')
        }
    }
}

// 根路徑端點
app.get('/', (c) => {
    return c.json({
        message: 'Subscription Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            subscriptions: '/api/subscriptions',
            subscription: '/api/subscriptions/:id'
        }
    })
})

// 健康檢查端點
app.get('/api/health', (c) => {
    return c.json({
        success: true,
        data: { ok: true, timestamp: new Date().toISOString() },
        message: '服務運行正常'
    } as ApiResponse)
})

// 數據庫初始化端點
app.post('/api/init-db', async (c) => {
    try {
        const db = c.env.DB

        // 執行數據庫初始化腳本 - 使用單行 SQL 語句
        const createTableSQL = `CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, currency TEXT NOT NULL, billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly','yearly')), next_billing_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', category TEXT, website TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')))`

        const createIndex1SQL = `CREATE INDEX IF NOT EXISTS idx_subs_next_billing ON subscriptions (next_billing_date)`
        const createIndex2SQL = `CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions (status)`

        // 分步執行 SQL 語句
        await db.exec(createTableSQL)
        await db.exec(createIndex1SQL)
        await db.exec(createIndex2SQL)

        return c.json({
            success: true,
            data: {
                executed: true,
                message: '數據庫表結構已創建'
            },
            message: '數據庫初始化成功'
        } as ApiResponse)
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : '數據庫初始化失敗',
            message: '數據庫初始化失敗'
        } as ApiResponse, 500)
    }
})

// 訂閱管理 API 路由

// 獲取所有訂閱
app.get('/api/subscriptions', async (c) => {
    try {
        console.log('=== GET /api/subscriptions 開始 ===')

        const service = new SubscriptionService(c.env.DB)
        console.log('開始獲取訂閱列表...')
        const subscriptions = await service.getAll()
        console.log('獲取到的訂閱數量:', subscriptions.length)
        console.log('訂閱列表:', JSON.stringify(subscriptions, null, 2))

        const response = {
            success: true,
            data: subscriptions,
            message: '獲取訂閱列表成功'
        } as ApiResponse

        console.log('返回響應:', JSON.stringify(response, null, 2))
        console.log('=== GET /api/subscriptions 結束 ===')

        return c.json(response)
    } catch (error) {
        console.error('=== GET /api/subscriptions 錯誤 ===')
        console.error('Error:', error)
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')

        const errorResponse = {
            success: false,
            error: error instanceof Error ? error.message : '獲取訂閱列表失敗',
            message: '獲取訂閱列表失敗'
        } as ApiResponse

        console.log('返回錯誤響應:', JSON.stringify(errorResponse, null, 2))
        console.log('=== GET /api/subscriptions 錯誤結束 ===')

        return c.json(errorResponse, 500)
    }
})

// 獲取單個訂閱
app.get('/api/subscriptions/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        if (isNaN(id)) {
            return c.json({
                success: false,
                error: '無效的訂閱ID',
                message: '訂閱ID必須是數字'
            } as ApiResponse, 400)
        }

        const service = new SubscriptionService(c.env.DB)
        const subscription = await service.getById(id)

        if (!subscription) {
            return c.json({
                success: false,
                error: '訂閱不存在',
                message: '找不到指定的訂閱'
            } as ApiResponse, 404)
        }

        return c.json({
            success: true,
            data: subscription,
            message: '獲取訂閱成功'
        } as ApiResponse)
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : '獲取訂閱失敗',
            message: '獲取訂閱失敗'
        } as ApiResponse, 500)
    }
})

// 創建新訂閱
app.post('/api/subscriptions', async (c) => {
    try {
        console.log('=== POST /api/subscriptions 開始 ===')
        console.log('Request headers:', c.req.header())

        const body = await c.req.json()
        console.log('Received request body:', JSON.stringify(body, null, 2))

        // 數據驗證
        const validationErrors = validateSubscription(body)
        console.log('Validation errors:', validationErrors)

        if (validationErrors.length > 0) {
            console.log('返回驗證錯誤響應')
            return c.json({
                success: false,
                error: validationErrors.join(', '),
                message: '數據驗證失敗'
            } as ApiResponse, 400)
        }

        console.log('開始創建訂閱...')
        const service = new SubscriptionService(c.env.DB)
        const subscription = await service.create(body as CreateSubscriptionRequest)
        console.log('訂閱創建成功:', subscription)

        const response = {
            success: true,
            data: subscription,
            message: '創建訂閱成功'
        } as ApiResponse

        console.log('返回成功響應:', JSON.stringify(response, null, 2))
        console.log('=== POST /api/subscriptions 結束 ===')

        return c.json(response, 201)
    } catch (error) {
        console.error('=== POST /api/subscriptions 錯誤 ===')
        console.error('Error:', error)
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')

        const errorResponse = {
            success: false,
            error: error instanceof Error ? error.message : '創建訂閱失敗',
            message: '創建訂閱失敗'
        } as ApiResponse

        console.log('返回錯誤響應:', JSON.stringify(errorResponse, null, 2))
        console.log('=== POST /api/subscriptions 錯誤結束 ===')

        return c.json(errorResponse, 500)
    }
})

// 更新訂閱
app.put('/api/subscriptions/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        if (isNaN(id)) {
            return c.json({
                success: false,
                error: '無效的訂閱ID',
                message: '訂閱ID必須是數字'
            } as ApiResponse, 400)
        }

        const body = await c.req.json()

        // 數據驗證（部分更新，所以只驗證提供的字段）
        const validationErrors = validateSubscription({ ...body, name: body.name || 'temp' })
        if (body.name && validationErrors.some(err => err.includes('訂閱名稱'))) {
            return c.json({
                success: false,
                error: '訂閱名稱不能為空',
                message: '數據驗證失敗'
            } as ApiResponse, 400)
        }

        const service = new SubscriptionService(c.env.DB)
        const subscription = await service.update(id, body as UpdateSubscriptionRequest)

        if (!subscription) {
            return c.json({
                success: false,
                error: '訂閱不存在',
                message: '找不到指定的訂閱'
            } as ApiResponse, 404)
        }

        return c.json({
            success: true,
            data: subscription,
            message: '更新訂閱成功'
        } as ApiResponse)
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : '更新訂閱失敗',
            message: '更新訂閱失敗'
        } as ApiResponse, 500)
    }
})

// 刪除訂閱
app.delete('/api/subscriptions/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        if (isNaN(id)) {
            return c.json({
                success: false,
                error: '無效的訂閱ID',
                message: '訂閱ID必須是數字'
            } as ApiResponse, 400)
        }

        const service = new SubscriptionService(c.env.DB)
        const deleted = await service.delete(id)

        if (!deleted) {
            return c.json({
                success: false,
                error: '訂閱不存在',
                message: '找不到指定的訂閱'
            } as ApiResponse, 404)
        }

        return c.json({
            success: true,
            data: { id },
            message: '刪除訂閱成功'
        } as ApiResponse)
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : '刪除訂閱失敗',
            message: '刪除訂閱失敗'
        } as ApiResponse, 500)
    }
})

export default app