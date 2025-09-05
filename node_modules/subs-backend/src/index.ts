import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest, ApiResponse } from './types'

// 導入 Cloudflare Workers 類型
/// <reference types="@cloudflare/workers-types" />

type Bindings = {
  SUBSCRIPTIONS_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 設定
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://ru-web.idv.tw/'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
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
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('訂閱名稱是必填項')
  }
  
  if (!data.renewAt || typeof data.renewAt !== 'string') {
    errors.push('續約日期是必填項')
  } else {
    const renewDate = new Date(data.renewAt)
    if (isNaN(renewDate.getTime())) {
      errors.push('續約日期格式無效')
    }
  }
  
  if (data.price === undefined || data.price === null || typeof data.price !== 'number' || data.price < 0) {
    errors.push('價格必須是非負數')
  }
  
  if (!data.currency || typeof data.currency !== 'string') {
    errors.push('貨幣代碼是必填項')
  }
  
  if (!data.billingCycle || !['monthly', 'yearly', 'weekly'].includes(data.billingCycle)) {
    errors.push('計費週期必須是 monthly、yearly 或 weekly')
  }
  
  return errors
}

// 生成唯一 ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// KV 存儲服務類
class SubscriptionService {
  private kv: KVNamespace

  constructor(kv: KVNamespace) {
    this.kv = kv
  }

  async getAll(): Promise<Subscription[]> {
    try {
      const list = await this.kv.list({ prefix: 'subscription:' })
      const subscriptions: Subscription[] = []
      
      for (const key of list.keys) {
        const value = await this.kv.get(key.name)
        if (value) {
          subscriptions.push(JSON.parse(value))
        }
      }
      
      return subscriptions
    } catch (error) {
      console.error('獲取訂閱列表失敗:', error)
      throw new Error('獲取訂閱列表失敗')
    }
  }

  async getById(id: string): Promise<Subscription | null> {
    try {
      const value = await this.kv.get(`subscription:${id}`)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('獲取訂閱失敗:', error)
      throw new Error('獲取訂閱失敗')
    }
  }

  async create(data: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      
      const subscription: Subscription = {
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
        status: 'active'
      }
      
      await this.kv.put(`subscription:${id}`, JSON.stringify(subscription))
      return subscription
    } catch (error) {
      console.error('創建訂閱失敗:', error)
      throw new Error('創建訂閱失敗')
    }
  }

  async update(id: string, data: UpdateSubscriptionRequest): Promise<Subscription | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) {
        return null
      }
      
      const updated: Subscription = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
      }
      
      await this.kv.put(`subscription:${id}`, JSON.stringify(updated))
      return updated
    } catch (error) {
      console.error('更新訂閱失敗:', error)
      throw new Error('更新訂閱失敗')
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existing = await this.getById(id)
      if (!existing) {
        return false
      }
      
      await this.kv.delete(`subscription:${id}`)
      return true
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

// 訂閱管理 API 路由

// 獲取所有訂閱
app.get('/api/subscriptions', async (c) => {
  try {
    const service = new SubscriptionService(c.env.SUBSCRIPTIONS_KV)
    const subscriptions = await service.getAll()
    
    return c.json({
      success: true,
      data: subscriptions,
      message: '獲取訂閱列表成功'
    } as ApiResponse)
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '獲取訂閱列表失敗',
      message: '獲取訂閱列表失敗'
    } as ApiResponse, 500)
  }
})

// 獲取單個訂閱
app.get('/api/subscriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const service = new SubscriptionService(c.env.SUBSCRIPTIONS_KV)
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
    const body = await c.req.json()
    
    // 數據驗證
    const validationErrors = validateSubscription(body)
    if (validationErrors.length > 0) {
      return c.json({
        success: false,
        error: validationErrors.join(', '),
        message: '數據驗證失敗'
      } as ApiResponse, 400)
    }
    
    const service = new SubscriptionService(c.env.SUBSCRIPTIONS_KV)
    const subscription = await service.create(body as CreateSubscriptionRequest)
    
    return c.json({
      success: true,
      data: subscription,
      message: '創建訂閱成功'
    } as ApiResponse, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '創建訂閱失敗',
      message: '創建訂閱失敗'
    } as ApiResponse, 500)
  }
})

// 更新訂閱
app.put('/api/subscriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
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
    
    const service = new SubscriptionService(c.env.SUBSCRIPTIONS_KV)
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
    const id = c.req.param('id')
    const service = new SubscriptionService(c.env.SUBSCRIPTIONS_KV)
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