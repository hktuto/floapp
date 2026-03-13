# Flo App - Agent Guide

## 項目簡介
Flo App 係一個體重/體脂記錄網頁應用。

## 技術棧
- **Framework:** Nuxt 4
- **UI:** Nuxt UI v4
- **Database:** NuxtHub v0.10 + Drizzle ORM + PGlite
- **Storage:** Nuxt Hub Blob
- **Auth:** identifier + hash (Session Cookie)

## Nuxt 4 目錄結構

```
.project root/
├── app/                    # 前端 Vue 應用
│   ├── components/         # Vue 組件
│   │   ├── SlideInput.vue       # 滑動輸入組件
│   │   └── MeasurementForm.vue  # 記錄表單 (Tabs)
│   ├── pages/              # 頁面路由
│   │   ├── index.vue
│   │   ├── login.vue            # 登入
│   │   ├── register.vue         # 註冊
│   │   ├── welcome.vue          # 歡迎/個人資料 (Step 1)
│   │   ├── record-first.vue     # 第一個記錄 (Step 2)
│   │   ├── first-target.vue     # 第一個目標 (Step 3)
│   │   ├── dashboard.vue        # 儀表板 + Drawer 表單
│   │   ├── result.vue           # 記錄結果比較
│   │   ├── record.vue
│   │   ├── friends.vue
│   │   └── settings.vue
│   ├── layouts/            # 頁面佈局
│   │   ├── default.vue     # 主佈局（有導航）
│   │   ├── auth.vue        # 認證頁佈局
│   │   └── onboarding.vue  # 引導流程佈局（無導航）
│   ├── middleware/         # 前端中間件
│   │   └── auth.global.ts  # 全局 Auth 中間件
│   ├── composables/
│   │   └── useAuth.ts      # 認證邏輯
│   └── app.vue
├── server/                 # Nitro 服務器
│   ├── api/                # API 路由 (重要: 唔係 app/server/api/)
│   │   ├── auth/           # 認證 API
│   │   ├── measurements/   # 記錄 API
│   │   ├── targets/        # 目標 API
│   │   └── seed/           # 初始化數據
│   └── db/
│       ├── schema.ts       # Drizzle Schema
│       └── migrations/
└── flo-app docs/           # 文檔
```

### 重要提醒
- **API 位置:** `server/api/` ✅ 唔係 `app/server/api/` ❌
- **Nitro Server:** 所有後端 API 喺 `server/` 文件夾
- **Vue App:** 前端代碼喺 `app/` 文件夾

## 頁面流程

### 新用戶註冊流程
```
/register → /welcome → /record-first → /first-target → /dashboard
   Step 0      Step 1        Step 2         Step 3
```

### 記錄流程（Dashboard）
```
Dashboard → 打開 Drawer → 填寫數據 → 保存
                              ↓
                    有舊記錄？→ /result (顯示變化比較)
                    冇舊記錄？→ 刷新 Dashboard
```

### 路由保護
- **Public**: `/`, `/login`, `/register`
- **Private**: 其他所有頁面（需登入）
- **未登入**: 自動跳轉 `/login`

## 佈局系統

| 佈局 | 用途 | 特點 |
|------|------|------|
| `default` | 主頁面 | 有頂部導航 + 底部導航(mobile) |
| `auth` | 登入/註冊 | 簡單居中卡片 |
| `onboarding` | 引導流程 | 無導航，有 Step Indicator |

## 組件

### SlideInput
- 位置: `app/components/SlideInput.vue`
- Props: `label`, `precision`, `step`, `min`, `max`, `previousValue`
- 功能: 滑動調整數值、差距顯示、雙擊輸入

### MeasurementForm
- 位置: `app/components/MeasurementForm.vue`
- 功能: 記錄表單
- 結構: Tabs（身體組成 + 身體圍度）

## Auth 系統

### useAuth Composable
```typescript
const { 
  user, account, isLoggedIn, isLoading, error,
  login, register, logout, fetchUser, checkAuth 
} = useAuth()
```

### Auth Middleware
- 文件: `app/middleware/auth.global.ts`
- 保護所有 private routes
- 使用 cookie `session` 檢查登入狀態

## Database

### Tables
1. **accounts** - 帳戶
2. **user_profiles** - 用戶資料
3. **measurement_records** - 測量記錄
4. **targets** - 目標設定
5. **friendships** - 朋友關係

### Database Insert 修復 (重要!)
由於 Drizzle ORM + PGlite 對 `decimal` 類型處理有問題，改用原生 PGlite client：

```typescript
// 正確做法
const client = (db as any).$client
const result = await client.query(sql, params)

// 錯誤做法 (會報錯)
await db.insert(schema.table).values({...})
```

## 開發

```bash
pnpm dev                    # 開發服務器
npx nuxt typecheck          # TypeScript 檢查
```

### 初始化測試數據
```bash
curl -X POST http://localhost:3000/api/seed
```

測試帳戶：
- Username: `sean`, `alex`, `sam`
- Password: `password123`

## 關鍵文件
- `nuxt.config.ts` - Nuxt 配置
- `server/db/schema.ts` - Drizzle ORM schema
- `app/middleware/auth.global.ts` - Auth 中間件
- `app/composables/useAuth.ts` - Auth 邏輯

## 常見錯誤
1. **API 404:** 檢查係咪放錯喺 `app/server/api/` 而唔係 `server/api/`
2. **Database insert 錯誤:** 使用原生 PGlite client，唔好用 Drizzle insert
3. **Server port 被佔用:** Kill 所有 nuxt dev process 再重新開
