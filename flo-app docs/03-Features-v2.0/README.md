# Flo App v2.0 - Feature List

將擴展功能拆分為 6 個獨立可執行嘅 Feature，可以逐個開發同部署。

---

## Feature 列表

| # | Feature | 說明 | 估計時間 | 依賴 |
|---|---------|------|---------|------|
| A | [User Profile Enhancement](./Feature-A-User-Profile.md) | Avatar、Description、Role 欄位 | 3h | - |
| B | [Admin Panel](./Feature-B-Admin-Panel.md) | 用戶管理、Token 充值、統計 | 4h | A |
| C | [Token System](./Feature-C-Token-System.md) | Package、餘額、交易、購買 | 5h | B |
| D | [Course Management](./Feature-D-Course-Management.md) | Teacher 創建課程、重複規則 | 5h | A |
| E | [Course Booking](./Feature-E-Course-Booking.md) | User 預約、Lazy Instance、日曆 | 6h | C, D |
| F | [Role-Based Access Control](./Feature-F-RBAC.md) | 權限控制、頁面保護 | 3h | All |

**總計**: 約 26 小時

---

## 執行順序建議

```
Phase 1: Foundation
├── Feature A: User Profile Enhancement
└── Feature F: RBAC (基礎部分)

Phase 2: Admin & Token
├── Feature B: Admin Panel
└── Feature C: Token System

Phase 3: Course System
├── Feature D: Course Management
└── Feature E: Course Booking
```

---

## 每個 Feature 包含

- ✅ 詳細需求說明
- ✅ 數據庫 Schema 變更
- ✅ API 端點設計
- ✅ 前端頁面規劃
- ✅ 測試要點
- ✅ 部署注意事項

可以逐個 Feature Review 同開發！
