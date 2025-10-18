export interface Subscription {
  /** 訂閱服務的唯一識別碼 */
  id: number
  
  /** 訂閱服務名稱 */
  name: string
  
  /** 訂閱服務描述 */
  description?: string
  
  /** 訂閱費用 */
  price: number
  
  /** 貨幣代碼 (例如: TWD, USD) */
  currency: string
  
  /** 計費週期 */
  billing_cycle: 'monthly' | 'yearly'
  
  /** 下次計費日期 (YYYY-MM-DD 格式) */
  next_billing_date: string
  
  /** 訂閱狀態 */
  status: 'active' | 'paused' | 'cancelled'
  
  /** 訂閱分類 */
  category?: string
  
  /** 網站連結 */
  website?: string
  
  /** 建立時間 */
  created_at: string
  
  /** 最後更新時間 */
  updated_at: string
}

export interface CreateSubscriptionRequest {
  name: string
  description?: string
  price: number
  currency: string
  billing_cycle?: 'monthly' | 'yearly'
  billingCycle?: 'monthly' | 'yearly' | 'weekly'
  next_billing_date?: string
  nextBilling?: string
  next_billing?: string
  renewalDate?: string
  renewal_date?: string
  status?: 'active' | 'paused' | 'cancelled'
  category?: string
  website?: string
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  // 繼承所有 CreateSubscriptionRequest 的字段，都是可選的
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}