# Flo App

體重同體脂記錄網頁應用，幫助用戶追蹤健康進度。

## 功能特點

- ✅ 體重/體脂記錄（滑動輸入 + 上次數據比較）
- ✅ 目標設置同進度追蹤
- ✅ 朋友互動（查看朋友進度）
- ✅ 響記錄結果頁面（變化比較 + 目標進度）
- ✅ 新用戶 Onboarding 引導流程

## 用戶流程

### 新用戶註冊
```
/register → /welcome → /record-first → /first-target → /dashboard
```

### 現有用戶登入
```
/login → /dashboard
```

### 記錄流程
```
/dashboard → 打開 Drawer → 填寫數據 → 保存
                     ↓
            有舊記錄？→ /result (顯示變化)
            冇舊記錄？→ 刷新 Dashboard
```

## 技術棧

- **Framework**: Nuxt 4
- **UI Library**: Nuxt UI v4
- **Backend**: Nuxt Hub (PGlite + Blob)
- **Auth**: 用戶名/密碼認證 (Session Cookie)
- **Database**: PostgreSQL (PGlite)

## 項目結構

```
app/
├── components/          # Vue 組件
│   ├── MeasurementForm.vue   # 記錄表單 (Tabs)
│   └── SlideInput.vue        # 滑動輸入組件
├── layouts/
│   ├── default.vue      # 主佈局（有導航）
│   ├── auth.vue         # 認證頁佈局
│   └── onboarding.vue   # 引導流程佈局（無導航）
├── pages/
│   ├── login.vue        # 登入
│   ├── register.vue     # 註冊
│   ├── welcome.vue      # 歡迎/個人資料
│   ├── record-first.vue # 第一個記錄
│   ├── first-target.vue # 第一個目標
│   ├── dashboard.vue    # 儀表板
│   ├── result.vue       # 記錄結果比較
│   ├── record.vue       # 記錄頁面
│   ├── friends.vue      # 朋友列表
│   └── settings.vue     # 設定
├── composables/
│   └── useAuth.ts       # 認證邏輯
└── middleware/
    └── auth.global.ts   # 全局 Auth 中間件

server/
├── api/
│   ├── auth/           # 認證 API
│   ├── profile/        # 用戶資料 API
│   ├── measurements/   # 記錄 API
│   ├── targets/        # 目標 API
│   └── seed/           # 初始化數據
└── db/
    ├── schema.ts       # Drizzle Schema
    └── migrations/     # 數據庫遷移
```

## 頁面說明

| 頁面 | 路徑 | 佈局 | 說明 |
|------|------|------|------|
| 登入 | `/login` | auth | 用戶登入 |
| 註冊 | `/register` | auth | 新用戶註冊 |
| 歡迎 | `/welcome` | onboarding | 填寫個人資料 (Step 1) |
| 第一個記錄 | `/record-first` | onboarding | 記錄初始數據 (Step 2) |
| 第一個目標 | `/first-target` | onboarding | 設置目標 (Step 3) |
| 儀表板 | `/dashboard` | default | 主頁面 + 新增記錄 Drawer |
| 結果頁 | `/result` | onboarding | 記錄後顯示變化比較 |
| 記錄 | `/record` | default | 記錄頁面 |
| 朋友 | `/friends` | default | 朋友列表 |
| 設定 | `/settings` | default | 個人設定 |

## 開發

### 安裝依賴
```bash
pnpm install
```

### 本地開發
```bash
pnpm dev
```

### 初始化測試數據
```bash
curl -X POST http://localhost:3000/api/seed
```

測試帳戶：
- 用戶名：`sean`
- 密碼：`password123`

## 文檔

- [功能規格](./flo-app%20docs/02-Features/功能規格.md)
- [數據庫設計](./flo-app%20docs/04-Design/數據庫設計.md)

## 技術注意事項

### Database Insert 修復
由於 Drizzle ORM + PGlite 對 `decimal` 類型處理有問題，API 端點改用原生 PGlite client：

```typescript
const client = (db as any).$client
const result = await client.query(sql, params)
```

## License
MIT
