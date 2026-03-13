# Feature A: User Profile Enhancement

## 概述
擴展 User Profile，添加 Avatar 頭像、Description 自我介紹、Role 角色欄位。

---

## 需求

### 1. Avatar 頭像
- 用戶可以上傳頭像圖片
- 支持圖片裁切（1:1 正方形）
- 存儲到 Nuxt Hub Blob
- 顯示於：Settings 頁面、Navbar

### 2. Description 自我介紹
- 支持 Markdown 格式
- 字數限制：500 字
- 顯示於：用戶公開頁面（如果有）

### 3. Role 角色欄位
- 類型：`admin` | `teacher` | `user`
- 預設值：`user`
- **暫時只做欄位存儲，唔做權限控制**（留俾 Feature F）

---

## 數據庫 Schema

```sql
-- user_profiles 表添加欄位
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS (
  avatar_url TEXT,
  description TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'teacher', 'user'))
);
```

---

## API 端點

### Avatar
```typescript
// POST /api/avatar/upload
// Content-Type: multipart/form-data
// Body: { image: File }
// Response: { success: true, url: string }

// DELETE /api/avatar/delete
// Response: { success: true }
```

### Profile Update
```typescript
// PUT /api/profile
// Body: { 
//   firstName?, lastName?, gender?, heightCm?, birthDate?,
//   description?  // 新增
// }
```

### Get Profile (Response 新增欄位)
```typescript
// GET /api/profile
// Response: {
//   firstName, lastName, ...,
//   avatar_url,      // 新增
//   description,     // 新增
//   role             // 新增
// }
```

---

## 前端頁面

### 1. Settings 頁面擴展
```
/settings
├── 個人資料（原有）
├── 頭像區域（新增）
│   ├── 當前頭像預覽
│   ├── 上傳按鈕
│   └── 裁切 Modal
└── 自我介紹（新增）
    ├── Markdown 編輯器（簡單 textarea）
    └── 實時預覽
```

### 2. Navbar 擴展
```
右上角用戶圖標
├── 如有頭像：顯示圓形頭像
└── 如冇頭像：顯示預設圖標（i-lucide-user）
```

---

## 組件設計

### AvatarUpload.vue
```vue
<script setup>
const props = defineProps<{
  modelValue?: string  // 當前頭像 URL
}>()

const emit = defineEmits<['update:modelValue']>()

// 功能：
// 1. 點擊上傳圖片
// 2. 打開裁切 Modal
// 3. 裁切後上傳到 Blob
// 4. 返回 URL 更新父組件
</script>
```

### MarkdownEditor.vue（簡單版）
```vue
<script setup>
const props = defineProps<{
  modelValue: string
  maxLength?: number  // default 500
}>()

// 功能：
// 1. Textarea 輸入
// 2. 字數統計
// 3. Markdown 預覽（marked library）
</script>
```

---

## 技術要點

### 1. 圖片處理
```bash
# 安裝裁切組件
pnpm add vue-advanced-cropper
```

### 2. Blob 上傳
```typescript
// server/api/avatar/upload.post.ts
import { useHubBlob } from '@nuxthub/blob'

export default defineEventHandler(async (event) => {
  const blob = useHubBlob()
  const form = await readFormData(event)
  const image = form.get('image') as File
  
  // 驗證：文件類型、大小（< 2MB）
  
  // 上傳到 Blob
  const result = await blob.put(`avatars/${userId}.jpg`, image)
  
  return { success: true, url: result.pathname }
})
```

### 3. Markdown 渲染
```bash
# 安裝 marked
pnpm add marked
pnpm add -D @types/marked
```

---

## 測試要點

- [ ] 上傳大於 2MB 圖片應該報錯
- [ ] 非圖片文件應該報錯
- [ ] 裁切後頭像比例係 1:1
- [ ] Markdown 正確渲染（標題、列表、鏈接）
- [ ] Description 超過 500 字應該截斷或報錯
- [ ] 數據庫 role 欄位只有 'admin'/'teacher'/'user' 三個可能值

---

## 部署注意

1. 運行 migration 添加新欄位
2. 確保 Blob 存儲已啟用（nuxt.config.ts）
3. 現有用戶 role 預設為 'user'

---

## 後續依賴

- Feature B (Admin Panel) 需要 role 欄位做管理
- Feature F (RBAC) 需要 role 欄位做權限控制
