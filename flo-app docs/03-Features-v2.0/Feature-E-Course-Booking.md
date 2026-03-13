# Feature E: Course Booking

## 概述
User 可以瀏覽課程、預約時間，系統自動處理 Token 扣除同 Instance 生成。

---

## 需求

### 1. 瀏覽課程
- 查看所有公開課程
- 按類型篩選
- 查看課程詳情（Markdown 描述）
- 查看可預約時間

### 2. 預約流程
- 選擇課程同時間
- 檢查 Token 餘額
- 確認預約（扣除 Token）
- 生成 Booking 記錄

### 3. 我的預約
- 日曆視圖顯示已預約課程
- 取消預約（退款政策）
- 查看預約歷史

---

## 數據庫 Schema

```sql
-- course_bookings (預約記錄)
CREATE TABLE course_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES course_instances(id),
  user_id UUID NOT NULL REFERENCES accounts(id),
  token_amount INTEGER NOT NULL,  -- 實際使用的 token
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed', 'no_show')),
  booked_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  note TEXT,  -- 用戶備註
  UNIQUE(instance_id, user_id)  -- 同一時段唔可以重複預約
);

-- 為 course_instances 添加 booked_count 自動更新
-- 使用 trigger 或應用層更新
```

---

## API 端點

### Browse Courses
```typescript
// GET /api/courses
// Query: { 
//   category?: 'yoga' | 'pilates' | ...,
//   teacherId?: string,
//   page?: number,
//   limit?: number 
// }
// Response: { courses: Course[], total: number }

// GET /api/courses/:id
// Response: CourseDetail + teacherInfo

// GET /api/courses/:id/available-slots
// Query: { from?: Date, to?: Date }
// Response: { 
//   slots: [
//     { scheduledAt: Date, availableSpots: number, instanceId?: string }
//   ] 
// }
// 注意：instanceId 可能為 null（尚未生成）
```

### Booking
```typescript
// POST /api/bookings
// Body: { courseId: string, scheduledAt: Date }
// Response: { 
//   success: true,
//   booking: Booking,
//   remainingTokens: number 
// }
// 
// Error Cases:
// - 400: Insufficient balance
// - 400: Course full
// - 400: Already booked
// - 404: Course not found

// GET /api/my-bookings
// Query: { status?, from?, to?, page?, limit? }
// Response: { bookings: BookingWithCourseInfo[], total: number }

// DELETE /api/bookings/:id
// 取消預約
// Response: { success: true, refundedTokens: number }
```

---

## 預約流程詳細

### 1. Frontend 檢查
```typescript
// 用戶點擊預約前
async function checkBeforeBooking(courseId: string, scheduledAt: Date) {
  // 檢查登入狀態
  if (!isLoggedIn) return { error: 'Please login' }
  
  // 檢查 Token 餘額
  const { balance } = await $fetch('/api/my-tokens')
  const course = await $fetch(`/api/courses/${courseId}`)
  
  if (balance < course.tokenCost) {
    return { error: 'Insufficient tokens', need: course.tokenCost, have: balance }
  }
  
  return { ok: true }
}
```

### 2. Backend 處理
```typescript
// server/api/bookings.post.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { courseId, scheduledAt } = await readBody(event)
  
  // 1. 檢查課程
  const course = await getCourse(courseId)
  if (!course || course.status !== 'active') {
    throw createError({ statusCode: 404, message: 'Course not found' })
  }
  
  // 2. 檢查餘額
  const userToken = await getUserToken(session.user.id)
  if (userToken.balance < course.tokenCost) {
    throw createError({ statusCode: 400, message: 'Insufficient balance' })
  }
  
  // 3. 獲取或創建 instance
  const instance = await getOrCreateInstance(courseId, new Date(scheduledAt))
  
  // 4. 檢查名額
  if (instance.booked_count >= course.maxStudents) {
    throw createError({ statusCode: 400, message: 'Course full' })
  }
  
  // 5. 檢查是否已預約
  const existing = await getExistingBooking(instance.id, session.user.id)
  if (existing) {
    throw createError({ statusCode: 400, message: 'Already booked' })
  }
  
  // 6. 事務處理
  const booking = await db.transaction(async (trx) => {
    // 扣除 token
    await deductTokens(session.user.id, course.tokenCost, 'booking')
    
    // 增加 booked_count
    await trx.update('course_instances', { id: instance.id })
      .set({ booked_count: sql`booked_count + 1` })
    
    // 創建 booking
    const [newBooking] = await trx.insert('course_bookings').values({
      instance_id: instance.id,
      user_id: session.user.id,
      token_amount: course.tokenCost
    }).returning()
    
    return newBooking
  })
  
  return { success: true, booking }
})
```

---

## 取消政策

### 退款規則（可配置）
```typescript
// 建議規則：
// - 上課前 24 小時取消：全額退款
// - 上課前 12-24 小時：退 50%
// - 上課前 12 小時內：唔退款

function calculateRefund(booking: Booking): number {
  const now = new Date()
  const courseTime = new Date(booking.instance.scheduled_at)
  const hoursDiff = (courseTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (hoursDiff >= 24) return booking.token_amount
  if (hoursDiff >= 12) return Math.floor(booking.token_amount * 0.5)
  return 0
}
```

---

## 前端頁面

### /courses
```
課程列表頁面
├── 標題 + 篩選器
│   └── 類型篩選（Yoga/Pilates/...）
├── 課程卡片網格
│   └── 每個卡片：
│       ├── 課程名稱
│       ├── Teacher 頭像 + 名
│       ├── 類型標籤
│       ├── 價格（Token 圖標 + 數字）
│       └── 預約按鈕
└── 分頁器
```

### /courses/[id]
```
課程詳情頁面
├── 課程名稱 + 類型
├── Teacher 信息
│   ├── 頭像、名、description
├── 課程描述（Markdown 渲染）
├── 課程信息
│   ├── 時長、最大人數、地點
│   └── 價格（Token）
├── 可預約時間
│   ├── 日曆選擇
│   ├── 時間列表
│   └── 預約按鈕
└── 類似課程推薦
```

### /my-bookings
```
我的預約頁面
├── 視圖切換（日曆 / 列表）
├── 日曆視圖
│   └── 顯示預約事件
│       ├── 課程名稱
│       ├── 時間
│       └── 點擊查看詳情
├── 列表視圖
│   └── 預約卡片
│       ├── 課程名稱
│       ├── 時間
│       ├── 狀態（即將開始/已完成/已取消）
│       └── 取消按鈕（如果未到時間）
└── 空狀態（冇預約時）
```

---

## 組件設計

### CourseList.vue
```vue
<script setup>
// 課程列表 + 篩選
const filters = ref({ category: null })
const { data: courses } = useFetch('/api/courses', { query: filters })
</script>
```

### BookingCalendar.vue
```vue
<script setup>
// 日曆視圖顯示預約
// 使用 vue-cal 或自製
const props = defineProps<{
  bookings: Booking[]
}>()
</script>
```

### BookingCard.vue
```vue
<script setup>
// 單個預約卡片
const props = defineProps<{
  booking: BookingWithCourse
}>()

// 顯示取消按鈕（如果允許取消）
const canCancel = computed(() => {
  return booking.status === 'booked' && 
         isBefore(new Date(), subHours(booking.instance.scheduledAt, 1))
})
</script>
```

---

## 測試要點

- [ ] 可以成功預約課程
- [ ] Token 正確扣除
- [ ] 滿員後無法預約
- [ ] 重複預約會被拒絕
- [ ] 取消後 Token 正確退還
- [ ] 日曆正確顯示預約

---

## 依賴

- ✅ Feature C: Token System（需要扣除 Token）
- ✅ Feature D: Course Management（需要課程同 instance）

---

## 後續被依賴

- Feature F: RBAC（需要整合權限控制）
