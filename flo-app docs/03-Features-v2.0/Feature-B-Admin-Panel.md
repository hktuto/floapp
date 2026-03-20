# Feature B: Admin Panel

## 概述
創建 Admin 後台，讓 admin 管理用戶、充值/扣除 Token、查看系統統計。

**注意**: Token Package 管理搬去 Feature C，Feature B 只包用戶管理同 Dashboard。

---

## 需求

### 1. Admin Dashboard
- 系統統計概覽
  - 總用戶數
  - Teacher 數量
  - 今日新註冊用戶
  - Token 流通概覽（總發行量、總使用量）

### 2. 用戶管理
- 查看所有用戶列表
- 搜索/篩選用戶（按 role、按註冊時間）
- 修改用戶 role（admin/teacher/user）
- 充值或扣除用戶 Token（直接修改餘額）
- 查看用戶詳情（個人資料、頭像、描述）

---

## 數據庫 Schema

使用現有表，唔需要新表：
- `accounts` - 用戶基本信息
- `user_profiles` - 個人資料（已由 Feature A 添加 role, avatarUrl, description）
- `user_tokens` - Token 餘額（由 Feature C 創建）

---

## API 端點

### Admin Dashboard
```typescript
// GET /api/admin/stats
// Response: {
//   totalUsers: number,
//   teacherCount: number,
//   newUsersToday: number,
//   totalTokensIssued: number,
//   totalTokensUsed: number
// }
```

### 用戶管理
```typescript
// GET /api/admin/users
// Query: { page?, limit?, search?, role? }
// Response: { 
//   users: [{
//     id, type, identifier, isActive,
//     profile: { firstName, lastName, avatarUrl, role, description }
//   }], 
//   total: number 
// }

// GET /api/admin/users/:id
// Response: UserDetail + tokenBalance

// PUT /api/admin/users/:id/role
// Body: { role: 'admin' | 'teacher' | 'user' }
// Response: { success: true }

// POST /api/admin/users/:id/tokens
// Body: { amount: number, reason: string }
// amount: 正數 = 充值，負數 = 扣除
// Response: { success: true, newBalance: number }
```

---

## 前端頁面

### 佈局：AdminLayout
```
/admin (使用 AdminLayout.vue - 側邊導航)
│
├── /dashboard              # 統計儀表板
│   ├── 四個統計卡片（Grid）
│   │   ├── 總用戶數
│   │   ├── Teacher 數量
│   │   ├── 今日新用戶
│   │   └── Token 概覽
│   └── 簡單圖表（可選）
│
└── /users                  # 用戶管理
    ├── 頂部工具欄
    │   ├── 搜索輸入框
    │   └── Role 篩選下拉框
    ├── 用戶列表表格
    │   ├── 頭像（小圓形）
    │   ├── 用戶名（identifier）
    │   ├── Role（Badge 顯示）
    │   ├── Token 餘額
    │   ├── 註冊日期
    │   └── 操作按鈕組
    │       ├── 編輯 Role
    │       ├── Token 充值
    │       └── 查看詳情
    └── 分頁器
```

---

## 組件設計

### AdminLayout.vue
```vue
<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 側邊導航 -->
    <aside class="w-64 bg-white border-r">
      <div class="p-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-scale" class="text-primary" />
          <span class="font-bold">Flo Admin</span>
        </NuxtLink>
      </div>
      
      <nav class="px-2 py-4 space-y-1">
        <NuxtLink 
          to="/admin/dashboard"
          class="flex items-center gap-2 px-3 py-2 rounded-lg"
          active-class="bg-primary-50 text-primary"
        >
          <UIcon name="i-lucide-layout-dashboard" />
          <span>儀表板</span>
        </NuxtLink>
        
        <NuxtLink 
          to="/admin/users"
          class="flex items-center gap-2 px-3 py-2 rounded-lg"
          active-class="bg-primary-50 text-primary"
        >
          <UIcon name="i-lucide-users" />
          <span>用戶管理</span>
        </NuxtLink>
      </nav>
      
      <!-- 返回前台 -->
      <div class="absolute bottom-4 left-4">
        <UButton variant="ghost" to="/dashboard">
          <UIcon name="i-lucide-arrow-left" class="mr-2" />
          返回前台
        </UButton>
      </div>
    </aside>
    
    <!-- 主內容 -->
    <main class="flex-1 overflow-auto">
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
```

### StatCard.vue
```vue
<script setup>
const props = defineProps<{
  title: string
  value: number
  icon: string
  trend?: number  // 趨勢百分比
}>()
</script>

<template>
  <UCard>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">{{ title }}</p>
        <p class="text-2xl font-bold">{{ value }}</p>
        <p v-if="trend" class="text-xs">
          <span :class="trend > 0 ? 'text-green-600' : 'text-red-600'">
            {{ trend > 0 ? '+' : '' }}{{ trend }}%
          </span>
          vs 上週
        </p>
      </div>
      
      <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
        <UIcon :name="icon" class="text-primary text-xl" />
      </div>
    </div>
  </UCard>
</template>
```

### UserTable.vue
```vue
<script setup>
const props = defineProps<{
  users: AdminUser[]
  loading?: boolean
}>()

const emit = defineEmits(['edit-role', 'recharge', 'view'])

// 分頁、排序邏輯
const page = ref(1)
const pageSize = ref(10)
</script>

<template>
  <div class="space-y-4">
    <!-- 工具欄 -->
    <div class="flex gap-4">
      <UInput 
        placeholder="搜索用戶名..."
        icon="i-lucide-search"
      />
      
      <USelect 
        placeholder="篩選 Role"
        :options="[
          { label: '全部', value: '' },
          { label: 'Admin', value: 'admin' },
          { label: 'Teacher', value: 'teacher' },
          { label: 'User', value: 'user' }
        ]"
      />
    </div>
    
    <!-- 表格 -->
    <UTable :rows="users" :loading="loading">
      <template #avatar-data="{ row }">
        <UAvatar :src="row.profile.avatarUrl" :alt="row.identifier" />
      </template>
      
      <template #role-data="{ row }">
        <UBadge 
          :color="{
            admin: 'red',
            teacher: 'blue',
            user: 'gray'
          }[row.profile.role]"
        >
          {{ row.profile.role }}
        </UBadge>
      </template>
      
      <template #actions-data="{ row }">
        <UDropdown :items="[
          { label: '編輯 Role', icon: 'i-lucide-user-cog', click: () => emit('edit-role', row) },
          { label: 'Token 充值', icon: 'i-lucide-coins', click: () => emit('recharge', row) },
          { label: '查看詳情', icon: 'i-lucide-eye', click: () => emit('view', row) }
        ]">
          <UButton variant="ghost" icon="i-lucide-more-vertical" />
        </UDropdown>
      </template>
    </UTable>
    
    <!-- 分頁 -->
    <UPagination v-model="page" :total="total" :page-size="pageSize" />
  </div>
</template>
```

### EditRoleModal.vue
```vue
<script setup>
const props = defineProps<{
  user: User | null
}>()

const emit = defineEmits(['close', 'save'])

const selectedRole = ref(props.user?.profile.role || 'user')

function onSave() {
  emit('save', props.user?.id, selectedRole.value)
}
</script>

<template>
  <UModal :open="!!user" @close="$emit('close')">
    <UCard>
      <template #header>修改用戶角色</template>
      
      <div class="space-y-4">
        <p>用戶: {{ user?.identifier }}</p>
        
        <URadioGroup v-model="selectedRole"
          :options="[
            { label: 'Admin', value: 'admin', description: '系統管理員，可訪問所有功能' },
            { label: 'Teacher', value: 'teacher', description: '可創建課程同管理學生' },
            { label: 'User', value: 'user', description: '普通用戶，可預約課程' }
          ]"
        />
      </div>
      
      <template #footer>
        <UButton variant="ghost" @click="$emit('close')">取消</UButton>
        <UButton color="primary" @click="onSave">保存</UButton>
      </template>
    </UCard>
  </UModal>
</template>
```

### TokenRechargeModal.vue
```vue
<script setup>
const props = defineProps<{
  user: User | null
}>()

const emit = defineEmits(['close', 'save'])

const amount = ref(0)
const reason = ref('')

// 正數 = 充值，負數 = 扣除
const isDeduction = computed(() => amount.value < 0)

function onSave() {
  emit('save', props.user?.id, amount.value, reason.value)
}

// 快捷按鈕
const quickAmounts = [10, 50, 100, 500]
</script>

<template>
  <UModal :open="!!user" @close="$emit('close')">
    <UCard>
      <template #header>{{ isDeduction ? '扣除' : '充值' }} Token</template>
      
      <div class="space-y-4">
        <p>用戶: {{ user?.identifier }}</p>
        <!-- 快捷按鈕 -->
        <div class="flex gap-2">
          <UButton
            v-for="amt in quickAmounts"
            :key="amt"
            variant="soft"
            size="sm"
            @click="amount = amt"
          >
            +{{ amt }}
          </UButton>
        </div>
        
        <!-- 數量輸入 -->
        <UFormField label="數量（負數 = 扣除）">
          <UInput 
            v-model.number="amount" 
            type="number"
            :color="isDeduction ? 'red' : 'green'"
          />
        </UFormField>
        
        <!-- 原因 -->
        <UFormField label="原因 / 備註">
          <UTextarea v-model="reason" placeholder="例如：活動獎勵、退款..." />
        </UFormField>
        
        <!-- 預覽 -->
        <p class="text-sm">
          操作後餘額: 
          <span :class="isDeduction ? 'text-red-600' : 'text-green-600'">
            {{ (user?.tokenBalance || 0) + amount }}
          </span>
        </p>
      </div>
      
      <template #footer>
        <UButton variant="ghost" @click="$emit('close')">取消</UButton>
        <UButton 
          :color="isDeduction ? 'red' : 'primary'"
          @click="onSave"
        >
          {{ isDeduction ? '確認扣除' : '確認充值' }}
        </UButton>
      </template>
    </UCard>
  </UModal>
</template>
```

---

## 權限控制

### middleware/admin.ts
```typescript
export default defineNuxtRouteMiddleware(async () => {
  const { user, isLoggedIn } = useAuth()
  
  // 未登入
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
  
  // 非 admin
  if (user.value?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
```

### 頁面配置
```vue
<!-- pages/admin/dashboard.vue -->
<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>

<!-- pages/admin/users.vue -->
<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>
```

---

## 測試要點

- [ ] 非 admin 訪問 /admin 會被重定向到 /dashboard
- [ ] Admin 可以查看 Dashboard 統計
- [ ] 用戶列表正確顯示頭像、role、token 餘額
- [ ] 可以成功修改用戶 role
- [ ] Token 充值後餘額正確更新
- [ ] Token 扣除後餘額唔會變負數（檢查餘額是否足匱）
- [ ] 搜索同篩選功能正常

---

## 部署注意

1. 確保第一個 admin 用戶已設置：
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE account_id = 'xxx';
   ```

2. Admin 頁面路由受保護，唔會被普通用戶訪問

---

## 依賴

- ✅ Feature A: User Profile Enhancement
  - role 欄位
  - avatarUrl 欄位
  - description 欄位

- ✅ Feature C: Token System（需要 user_tokens 表同 API）
  - Admin Token 充值/扣除 API
  - 查詢用戶餘額

---

## 後續被依賴

- 無（Feature B 係獨立嘅管理後台）
