# Feature C: Token System

## 概述
建立平台代幣經濟系統，支持 Token Package 創建、購買、交易記錄。

---

## 需求

### 1. Token Package（套餐）
- Admin 創建套餐（名稱、描述、token 數量、價格）
- 用戶瀏覽可購買嘅套餐
- 購買後 token 即時到帳

### 2. User Token 餘額
- 每個用戶有獨立餘額帳戶
- 購買增加、預約課程扣除
- 實時餘額查詢

### 3. Transaction 記錄
- 所有 token 變動都有記錄
- 記錄類型：購買、預約、退款、admin 操作
- 可查看歷史交易

---

## 數據庫 Schema

```sql
-- token_packages (代幣套餐)
CREATE TABLE token_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,  -- markdown
  token_amount INTEGER NOT NULL,
  price_hkd DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES accounts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- user_tokens (用戶代幣餘額)
CREATE TABLE user_tokens (
  user_id UUID PRIMARY KEY REFERENCES accounts(id),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- token_transactions (代幣交易記錄)
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES accounts(id),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'booking', 'refund', 'admin_grant', 'admin_deduct')),
  amount INTEGER NOT NULL,  -- 正數增加，負數減少
  description TEXT,
  related_package_id UUID REFERENCES token_packages(id),
  related_booking_id UUID,  -- 暫時冇 FK，之後加
  created_by UUID REFERENCES accounts(id),  -- 操作人
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API 端點

### Token Packages
```typescript
// GET /api/token-packages
// 返回 active 狀態嘅套餐列表

// GET /api/token-packages/:id
// 單個套餐詳情

// POST /api/admin/token-packages (Admin only)
// Body: { name, description, tokenAmount, priceHkd }

// PUT /api/admin/token-packages/:id (Admin only)
// Body: { name?, description?, tokenAmount?, priceHkd?, status? }
```

### My Tokens (User)
```typescript
// GET /api/my-tokens
// Response: {
//   balance: number,
//   totalEarned: number,
//   totalSpent: number,
//   transactions: TokenTransaction[]
// }
```

### Purchase
```typescript
// POST /api/token-packages/:id/purchase
// Response: {
//   success: true,
//   newBalance: number,
//   transaction: TokenTransaction
// }
```

### Admin Operations
```typescript
// POST /api/admin/users/:id/tokens
// Body: { amount: number, reason: string }
// amount 正數 = 充值，負數 = 扣除
```

---

## 核心邏輯

### 購買流程
```typescript
async function purchasePackage(userId: string, packageId: string) {
  // 1. 檢查套餐是否存在同 active
  const pkg = await getPackage(packageId)
  if (!pkg || pkg.status !== 'active') throw new Error('Package not available')
  
  // 2. 開始事務
  await db.transaction(async (trx) => {
    // 3. 創建 transaction 記錄
    await trx.insert('token_transactions', {
      user_id: userId,
      type: 'purchase',
      amount: pkg.token_amount,
      description: `Purchased ${pkg.name}`,
      related_package_id: packageId
    })
    
    // 4. 增加用戶餘額
    await trx.update('user_tokens', { user_id: userId })
      .set({
        balance: sql`balance + ${pkg.token_amount}`,
        total_earned: sql`total_earned + ${pkg.token_amount}`,
        updated_at: new Date()
      })
  })
}
```

### 扣除 Token（預約課程時）
```typescript
async function deductTokens(userId: string, amount: number, bookingId: string) {
  // 1. 檢查餘額
  const userToken = await getUserToken(userId)
  if (userToken.balance < amount) throw new Error('Insufficient balance')
  
  // 2. 事務扣除
  await db.transaction(async (trx) => {
    await trx.insert('token_transactions', {
      user_id: userId,
      type: 'booking',
      amount: -amount,
      description: 'Course booking',
      related_booking_id: bookingId
    })
    
    await trx.update('user_tokens', { user_id: userId })
      .set({
        balance: sql`balance - ${amount}`,
        total_spent: sql`total_spent + ${amount}`,
        updated_at: new Date()
      })
  })
}
```

---

## 前端頁面

### /my-tokens
```
我的 Token 頁面
├── 餘額卡片
│   ├── 當前餘額（大字）
│   ├── 累計獲得 / 累計使用
│   └── 購買按鈕
├── 交易記錄列表
│   ├── 類型圖標
│   ├── 金額（綠色+ / 紅色-）
│   ├── 描述
│   └── 時間
└── 購買 Modal
    ├── 套餐列表卡片
    ├── 選擇套餐
    └── 確認購買
```

---

## 組件設計

### TokenBalanceCard.vue
```vue
<script setup>
const props = defineProps<{
  balance: number
  totalEarned: number
  totalSpent: number
}>()
</script>
```

### TokenPackageCard.vue
```vue
<script setup>
const props = defineProps<{
  package: TokenPackage
}>()

const emit = defineEmits(['purchase'])

// 點擊購買時 emit 事件
</script>
```

### TransactionList.vue
```vue
<script setup>
const props = defineProps<{
  transactions: TokenTransaction[]
}>()

// 無限滾動加載
</script>
```

---

## 測試要點

- [ ] 餘額唔夠時無法預約課程
- [ ] 購買後餘額正確增加
- [ ] 預約後餘額正確減少
- [ ] Transaction 記錄完整
- [ ] Admin 充值/扣除正確
- [ ] 餘額唔會變負數

---

## 依賴

- ✅ Feature B: Admin Panel（需要 Admin 創建套餐）

---

## 後續被依賴

- Feature E: Course Booking（需要扣除 Token）
