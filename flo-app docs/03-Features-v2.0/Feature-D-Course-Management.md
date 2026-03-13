# Feature D: Course Management

## 概述
Teacher 可以創建、管理課程，支持設置重複規則。

---

## 需求

### 1. 課程創建
- Teacher 創建新課程
- 設置課程信息（名稱、描述、類型、時長）
- 設置 Token 價格
- 設置上課地點（線上/線下）
- 設置最大學生人數

### 2. 重複規則
- 支持每週重複（例如每週一三五）
- 設置開始日期同結束日期
- 設置具體時間
- 可排除特定日期（假期）

### 3. 課程管理
- 查看自己創建嘅課程列表
- 編輯/下架課程
- 查看課程預約情況

---

## 數據庫 Schema

```sql
-- courses (課程模板)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES accounts(id),
  title TEXT NOT NULL,
  description TEXT,  -- markdown
  category TEXT CHECK (category IN ('yoga', 'pilates', 'boxing', 'swimming', 'hiit', 'dance', 'other')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  token_cost INTEGER NOT NULL DEFAULT 1,
  max_students INTEGER NOT NULL DEFAULT 10,
  location_type TEXT DEFAULT 'offline' CHECK (location_type IN ('online', 'offline')),
  location_address TEXT,  -- 線下地址或線上鏈接
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  -- 重複規則
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,  -- 見下方格式
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- course_instances (課程實例 - Lazy 生成)
CREATE TABLE course_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  scheduled_at TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  booked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- course_students (課程學生名單)
CREATE TABLE course_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  user_id UUID NOT NULL REFERENCES accounts(id),
  enrolled_by UUID REFERENCES accounts(id),  -- 誰加人
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'removed', 'completed')),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  removed_at TIMESTAMP,
  UNIQUE(course_id, user_id)
);
```

### recurring_pattern 格式
```json
{
  "type": "weekly",
  "days": [1, 3, 5],        // 週一、三、五 (0=週日)
  "time": "10:00",          // 24小時制
  "start_date": "2025-04-01",
  "end_date": "2025-06-30",
  "exclude_dates": ["2025-04-18", "2025-05-01"]  // 跳過的日期
}
```

---

## API 端點

### Teacher - Course CRUD
```typescript
// GET /api/teacher/courses
// 獲取當前 teacher 嘅課程列表

// POST /api/teacher/courses
// Body: {
//   title, description, category,
//   durationMinutes, tokenCost, maxStudents,
//   locationType, locationAddress,
//   isRecurring, recurringPattern
// }

// GET /api/teacher/courses/:id
// 課程詳情 + 預約統計

// PUT /api/teacher/courses/:id
// 編輯課程信息

// DELETE /api/teacher/courses/:id
// 下架課程（soft delete，改 status）
```

### Course Students
```typescript
// GET /api/teacher/courses/:id/students
// 獲取課程學生列表

// POST /api/teacher/courses/:id/students
// Body: { userId, note? }
// Teacher 主動添加學生

// DELETE /api/teacher/courses/:id/students/:userId
// 移除學生
```

### Public - Browse Courses
```typescript
// GET /api/courses
// Query: { category?, teacherId?, page?, limit? }
// 瀏覽所有 active 課程

// GET /api/courses/:id
// 課程詳情（公開信息）

// GET /api/courses/:id/available-slots
// Query: { startDate?, endDate? }
// 返回未來可預約嘅時段列表
```

---

## Lazy Instance 生成邏輯

### Frontend 計算可用時段
```typescript
// 根據 course.recurring_pattern 計算所有可能時段
function generateAvailableSlots(
  pattern: RecurringPattern,
  bookedInstances: CourseInstance[],
  maxStudents: number
): Date[] {
  const slots: Date[] = []
  const { days, time, start_date, end_date, exclude_dates } = pattern
  
  let current = new Date(start_date)
  const end = new Date(end_date)
  
  while (current <= end) {
    // 檢查是否喺 exclude_dates
    if (exclude_dates.includes(format(current, 'yyyy-MM-dd'))) {
      current = addDays(current, 1)
      continue
    }
    
    // 檢查是否喺指定星期幾
    if (days.includes(current.getDay())) {
      const [hours, minutes] = time.split(':')
      const slot = setHours(setMinutes(current, minutes), hours)
      
      // 檢查呢個時段係咪已滿
      const existing = bookedInstances.find(i => 
        isSameDay(new Date(i.scheduled_at), slot)
      )
      
      if (!existing || existing.booked_count < maxStudents) {
        slots.push(slot)
      }
    }
    
    current = addDays(current, 1)
  }
  
  return slots
}
```

### API 創建 Instance（Booking 時）
```typescript
// 當用戶預約時，如果不存在 instance 則創建
async function getOrCreateInstance(courseId: string, scheduledAt: Date) {
  // 檢查是否已有 instance
  let instance = await db.query.courseInstances.findFirst({
    where: and(
      eq(courseInstances.courseId, courseId),
      eq(courseInstances.scheduledAt, scheduledAt)
    )
  })
  
  // 如果不存在則創建
  if (!instance) {
    const [newInstance] = await db.insert(courseInstances).values({
      courseId,
      scheduledAt,
      status: 'open',
      bookedCount: 0
    }).returning()
    instance = newInstance
  }
  
  return instance
}
```

---

## 前端頁面

### /teacher/courses
```
Teacher 課程管理
├── 標題 + 創建按鈕
├── 課程列表卡片
│   ├── 課程名稱
│   ├── 類型標籤
│   ├── 價格（Token）
│   ├── 重複規則摘要
│   ├── 狀態（上架/下架）
│   └── 操作（編輯、查看學生）
└── 創建/編輯 Modal
    ├── 基本信息（名稱、描述 Markdown）
    ├── 課程設置（時長、Token、人數）
    ├── 地點設置
    └── 重複規則設置
        ├── 是否重複
        ├── 選擇星期幾
        ├── 時間選擇
        └── 日期範圍
```

### /teacher/courses/[id]/students
```
課程學生管理
├── 課程信息摘要
├── 學生列表
│   ├── 頭像、用戶名
│   ├── 加入時間
│   ├── 狀態
│   └── 操作（移除）
└── 添加學生按鈕
    └── 搜索用戶 Modal
```

---

## 組件設計

### CourseForm.vue
```vue
<script setup>
// 課程創建/編輯表單
// 包含重複規則設置
</script>
```

### RecurringPatternInput.vue
```vue
<script setup>
// 重複規則輸入
// - 星期幾選擇（多選）
// - 時間選擇
// - 日期範圍
// - 排除日期
</script>
```

### CourseCard.vue
```vue
<script setup>
// 課程卡片
// 顯示重複規則摘要（如：每週一三五 10:00）
</script>
```

---

## 測試要點

- [ ] 可以創建重複課程
- [ ] Frontend 正確計算所有可能時段
- [ ] Booking 時正確創建 instance
- [ ] 滿員後唔可以再預約同一時段
- [ ] Teacher 可以添加/移除學生
- [ ] 下架課程唔再顯示喺列表

---

## 依賴

- ✅ Feature A: User Profile Enhancement（需要 role=teacher）

---

## 後續被依賴

- Feature E: Course Booking（需要課程同 instance）
