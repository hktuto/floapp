# API 文件

## 認證

### POST /api/auth/register
註冊新帳戶

**Body:**
```json
{
  "type": "username",
  "identifier": "sean123",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "註冊成功",
  "account": {
    "id": "uuid",
    "type": "username",
    "identifier": "sean123"
  }
}
```

### POST /api/auth/login
帳戶登入

**Body:**
```json
{
  "type": "username",
  "identifier": "sean123",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "登入成功",
  "account": {
    "id": "uuid",
    "type": "username",
    "identifier": "sean123"
  }
}
```

**Note:** 登入成功後設置 `session` cookie

---

## 用戶資料

### GET /api/profile
獲取用戶資料

**Auth:** Required

### PUT /api/profile
更新用戶資料

**Auth:** Required

**Body:**
```json
{
  "first_name": "Sean",
  "last_name": "Ts",
  "gender": "male",
  "height_cm": 175,
  "birth_date": "1990-01-01",
  "preferences": {
    "theme": "dark",
    "language": "zh-HK",
    "reminder_enabled": true,
    "reminder_time": "08:00"
  }
}
```

---

## 測量記錄

### GET /api/measurements
獲取記錄列表

**Auth:** Required

**Query:**
- `from`: 開始日期 (YYYY-MM-DD)
- `to`: 結束日期 (YYYY-MM-DD)
- `limit`: 數量限制

### POST /api/measurements
創建新記錄

**Auth:** Required

**Body:**
```json
{
  "recorded_at": "2025-03-12",
  "weight_kg": 70.5,
  "body_fat_pct": 18.5,
  "muscle_kg": 32.5,
  "water_pct": 55.0,
  "bone_kg": 3.2,
  "visceral_fat": 8,
  "chest_cm": 95.0,
  "waist_cm": 78.0,
  "hips_cm": 92.0,
  "thigh_cm": 55.0,
  "arm_cm": 32.0,
  "note": "運動後測量"
}
```

### GET /api/measurements/:id
獲取單一記錄

**Auth:** Required

### PUT /api/measurements/:id
更新記錄

**Auth:** Required

### DELETE /api/measurements/:id
刪除記錄

**Auth:** Required

---

## 目標

### GET /api/targets
獲取目標列表

**Auth:** Required

### POST /api/targets
創建新目標

**Auth:** Required

**Body:**
```json
{
  "target_type": "weight",
  "target_value": 65.0,
  "target_date": "2025-06-01"
}
```

### PUT /api/targets/:id
更新目標

**Auth:** Required

### DELETE /api/targets/:id
刪除目標

**Auth:** Required

### POST /api/targets/:id/complete
標記目標為達成

**Auth:** Required

---

## 朋友

### GET /api/friends
獲取朋友列表

**Auth:** Required

### POST /api/friends/request
發送朋友請求

**Auth:** Required

**Body:**
```json
{
  "identifier": "friend_username"
}
```

### POST /api/friends/accept
接受朋友請求

**Auth:** Required

**Body:**
```json
{
  "friendship_id": "uuid"
}
```

### POST /api/friends/reject
拒絕朋友請求

**Auth:** Required

### DELETE /api/friends/:id
刪除朋友

**Auth:** Required

---

## 附件

### POST /api/attachments
上傳附件

**Auth:** Required

**Body:** FormData (file)

### GET /api/attachments/:id
獲取附件

**Auth:** Required

### DELETE /api/attachments/:id
刪除附件

**Auth:** Required

---

## 認證說明

所有 API（除了 `/api/auth/*`）都需要登入。
透過 `session` cookie 進行認證。
