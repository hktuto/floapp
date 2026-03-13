# Feature B: Admin Panel

## 概述
創建 Admin 後台，讓 admin 管理用戶、充值/扣除 Token、查看系統統計。

---

## 需求

### 1. Admin Dashboard
- 系統統計概覽
  - 總用戶數
  - 總課程數
  - 今日預約數
  - Token 流通統計

### 2. 用戶管理
- 查看所有用戶列表
- 搜索/篩選用戶
- 修改用戶 role（admin/teacher/user）
- 充值或扣除用戶 Token
- 查看用戶詳情

### 3. Token Package 管理
- 創建 Token 套餐
- 編輯/下架套餐
- 設置套餐價格同 token 數量

---

## 數據庫 Schema

```sql
-- 使用現有表，唔需要新表
-- 需要 Feature A 嘅 role 欄位
```

---

## API 端點

### Admin Dashboard
```typescript
// GET /api/admin/stats
// Response: {
//   totalUsers: number,
//   totalCourses: number,
//   todayBookings: number,
//   totalTokensInCirculation: number
// }
```

### 用戶管理
```typescript
// GET /api/admin/users
// Query: { page?, limit?, search?, role? }
// Response: { users: [], total: number }

// GET /api/admin/users/:id
// Response: UserDetail + tokenBalance + bookingsCount

// PUT /api/admin/users/:id/role
// Body: { role: 'admin' | 'teacher' | 'user' }
// Response: { success: true }

// POST /api/admin/users/:id/tokens
// Body: { amount: number, reason: string }
// Response: { success: true, newBalance: number }
```

### Token Package 管理
```typescript
// GET /api/admin/token-packages
// Response: TokenPackage[]

// POST /api/admin/token-packages
// Body: { name, description, tokenAmount, priceHkd, status }

// PUT /api/admin/token-packages/:id
// Body: { name?, description?, tokenAmount?, priceHkd?, status? }

// DELETE /api/admin/token-packages/:id
// Response: { success: true }
```

---

## 前端頁面

```
/admin
├── /dashboard              # 統計儀表板
│   ├── 總用戶數卡片
│   ├── 總課程數卡片
│   ├── 今日預約數卡片
│   └── Token 流通圖表
│
├── /users                  # 用戶管理
│   ├── 搜索欄 + 篩選器
│   ├── 用戶列表表格
│   │   ├── 頭像、用戶名、Role、Token 餘額
│   │   └── 操作按鈕（編輯、充值、查看）
│   └── 編輯 Modal
│       ├── Role 選擇
│       └── Token 充值/扣除
│
└── /token-packages         # Token 套餐管理
    ├── 創建按鈕
    ├── 套餐列表卡片
    │   ├── 名稱、描述、Token 數、價格
    │   └── 狀態（上架/下架）
    └── 編輯 Modal
```

---

## 組件設計

### AdminLayout.vue
```vue
<!-- Admin 專用佈局 -->
<template>
  <div class="flex h-screen">
    <!-- 側邊導航 -->
    <aside>
      <NuxtLink to="/admin/dashboard">儀表板</NuxtLink>
      <NuxtLink to="/admin/users">用戶管理</NuxtLink>
      <NuxtLink to="/admin/token-packages">Token 套餐</NuxtLink>
    </aside>
    
    <!-- 主內容 -->
    <main>
      <slot />
    </main>
  </div>
</template>
```

### UserTable.vue
```vue
<!-- 用戶列表表格 -->
<script setup>
const props = defineProps<{
  users: User[]
}>()

// 支持排序、分頁
</script>
```

### TokenRechargeModal.vue
```vue
<!-- Token 充值 Modal -->
<script setup>
const amount = ref(0)
const reason = ref('')

// 正數 = 充值，負數 = 扣除
// 確認時調用 API
</script>
```

---

## 權限控制

```typescript
// middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  
  // 檢查是否為 admin
  if (user.value?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
```

---

## 測試要點

- [ ] 非 admin 訪問 /admin 會被重定向
- [ ] 可以成功修改用戶 role
- [ ] Token 充值後餘額正確更新
- [ ] Token 扣除後餘額唔會變負數
- [ ] 創建套餐後可以喺列表睇到
- [ ] 下架套餐後用戶唔可以購買

---

## 部署注意

1. 確保第一個 admin 用戶已設置（手動改數據庫 role）
2. Admin 頁面路由需要保護

---

## 依賴

- ✅ Feature A: User Profile Enhancement（需要 role 欄位）
- ✅ Feature C: Token System（需要 token 相關 API）

---

## 後續被依賴

- Feature C: Token System（需要 Admin 創建套餐）
