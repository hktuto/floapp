# Feature F: Role-Based Access Control

## 概述
實現基於角色嘅訪問控制，保護 Admin/Teacher/User 各級頁面同功能。

---

## 需求

### 1. Middleware 權限控制
- Global middleware 檢查登入狀態
- Role-based middleware 檢查角色權限
- 自動重定向到對應頁面

### 2. 頁面級保護
- `/admin/*` - Admin only
- `/teacher/*` - Teacher only
- `/courses/book` - Login required

### 3. 組件級權限
- 根據角色顯示/隱藏功能
- 動態導航菜單

---

## Middleware 設計

### 1. Auth Middleware（已存在，需更新）
```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Public routes
  const publicRoutes = ['/', '/login', '/register']
  if (publicRoutes.includes(to.path)) return
  
  // Check auth
  const { checkAuth } = useAuth()
  const user = await checkAuth()
  
  if (!user) {
    return navigateTo('/login')
  }
  
  // 暫時唔檢查 role，只檢查登入
  // 具體 role 檢查由各頁面 middleware 處理
})
```

### 2. Admin Middleware
```typescript
// middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  
  if (user.value?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
```

### 3. Teacher Middleware
```typescript
// middleware/teacher.ts
export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  
  if (!['admin', 'teacher'].includes(user.value?.role)) {
    return navigateTo('/dashboard')
  }
})
```

---

## 頁面權限配置

```typescript
// nuxt.config.ts 或頁面內配置
// pages/admin/dashboard.vue
definePageMeta({
  layout: 'admin',
  middleware: ['admin']  // 使用 admin middleware
})

// pages/teacher/courses.vue
definePageMeta({
  layout: 'teacher',
  middleware: ['teacher']
})

// pages/courses/index.vue
definePageMeta({
  middleware: ['auth']  // 只需登入
})
```

---

## 導航菜單動態化

### Default Layout 導航
```vue
<!-- layouts/default.vue -->
<script setup>
const { user, isLoggedIn } = useAuth()

const navigation = computed(() => {
  const items = [
    { label: '儀表板', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
    { label: '記錄', to: '/record', icon: 'i-lucide-scale' },
  ]
  
  // Teacher 額外菜單
  if (user.value?.role === 'teacher') {
    items.push({ 
      label: '我嘅課程', 
      to: '/teacher/courses', 
      icon: 'i-lucide-calendar' 
    })
  }
  
  // Admin 額外菜單
  if (user.value?.role === 'admin') {
    items.push({ 
      label: '管理後台', 
      to: '/admin/dashboard', 
      icon: 'i-lucide-settings' 
    })
  }
  
  items.push(
    { label: '朋友', to: '/friends', icon: 'i-lucide-users' },
    { label: '設定', to: '/settings', icon: 'i-lucide-settings' }
  )
  
  return items
})
</script>
```

---

## 組件級權限

### RoleGuard.vue
```vue
<script setup>
const props = defineProps<{
  allowedRoles: ('admin' | 'teacher' | 'user')[]
}>()

const { user } = useAuth()
const hasPermission = computed(() => {
  return props.allowedRoles.includes(user.value?.role)
})
</script>

<template>
  <slot v-if="hasPermission" />
  <slot v-else name="fallback">
    <UAlert title="無權限訪問此內容" />
  </slot>
</template>
```

### 使用示例
```vue
<template>
  <!-- 只有 Admin 可見 -->
  <RoleGuard :allowed-roles="['admin']">
    <UButton>刪除用戶</UButton>
  </RoleGuard>
  
  <!-- Admin 同 Teacher 可見 -->
  <RoleGuard :allowed-roles="['admin', 'teacher']">
    <UButton>創建課程</UButton>
  </RoleGuard>
</template>
```

---

## API 權限保護

### Server Middleware
```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // 檢查 API 路徑是否需要認證
  const protectedPrefixes = ['/api/admin', '/api/teacher', '/api/my']
  
  const needsAuth = protectedPrefixes.some(prefix => 
    event.path.startsWith(prefix)
  )
  
  if (!needsAuth) return
  
  // 檢查 session
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  // 檢查 role
  if (event.path.startsWith('/api/admin') && session.user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  
  if (event.path.startsWith('/api/teacher') && 
      !['admin', 'teacher'].includes(session.user.role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
})
```

---

## 權限矩陣

| 功能 | Admin | Teacher | User |
|------|-------|---------|------|
| 訪問 /admin | ✅ | ❌ | ❌ |
| 修改用戶 role | ✅ | ❌ | ❌ |
| Token 充值 | ✅ | ❌ | ❌ |
| 創建 Token Package | ✅ | ⚠️ | ❌ |
| 訪問 /teacher | ✅ | ✅ | ❌ |
| 創建課程 | ✅ | ✅ | ❌ |
| 管理課程學生 | ✅ | ✅ | ❌ |
| 瀏覽課程 | ✅ | ✅ | ✅ |
| 預約課程 | ✅ | ✅ | ✅ |
| 查看自己預約 | ✅ | ✅ | ✅ |
| 編輯自己資料 | ✅ | ✅ | ✅ |

⚠️ = 可配置，暫時只限 Admin

---

## 測試要點

- [ ] User 無法訪問 /admin
- [ ] User 無法訪問 /teacher
- [ ] Teacher 可以訪問 /teacher
- [ ] Teacher 無法訪問 /admin
- [ ] Admin 可以訪問所有頁面
- [ ] 未登入重定向到 /login
- [ ] API 返回正確 403 狀態碼

---

## 依賴

- ✅ Feature A: User Profile Enhancement（需要 role 欄位）
- ✅ All other features（整合所有權限控制）

---

## 實施建議

此 Feature 應該最後實施，因為需要整合所有其他 Feature 嘅權限點。

或者可以分階段：
1. **階段 1**: 先實現基本 role 檢查（A-C 完成後）
2. **階段 2**: 完善所有頁面保護（D-E 完成後）
