# 🔥 Firebase Read Optimization Plan

## ปัญหาที่พบ

### 1. Real-time Subscriptions มากเกินไป
- ทุก hook ใช้ `onSnapshot` ซึ่งฟังการเปลี่ยนแปลงตลอดเวลา
- BillingPage subscribe subcollection ของทุกห้องพร้อมกัน (50 rooms × 2 = 100 subscriptions)
- ทำให้เกิด Read operations สูงมาก

### 2. ประมาณการ Read Operations
- Dashboard: ~200 reads/session
- RoomsPage: ~160 reads/session  
- **BillingPage: ~5,000+ reads/session** ⚠️
- VisitorsPage: ~20 reads/session
- **รวม: ~5,400+ reads/session**

ถ้ามี 10 users × 10 sessions/day = **540,000 reads/day** 🔥

---

## แนวทางแก้ไข

### ✅ 1. เปลี่ยนจาก onSnapshot → getDocs (ข้อมูลที่ไม่ต้องการ real-time)

#### ข้อมูลที่ควรใช้ getDocs:
- ✅ **Billing data** (electricityHistory, maintenanceFeeHistory) - อ่านครั้งเดียวตอนโหลดหน้า
- ✅ **Inspection logs** - ข้อมูลประวัติ ไม่ต้อง real-time
- ✅ **Room history** (occupancyHistory) - ข้อมูลประวัติ
- ✅ **Camps, Zones** - ข้อมูลไม่ค่อยเปลี่ยน

#### ข้อมูลที่ควรใช้ onSnapshot (real-time):
- ✅ **Visitors** - ต้องเห็นการเข้า-ออกแบบ real-time
- ✅ **Dashboard stats** - ต้องเห็นสถิติแบบ real-time
- ✅ **Rooms, Workers** - ต้องเห็นการเปลี่ยนแปลงทันที

---

### ✅ 2. Lazy Loading สำหรับ Subcollections

แทนที่จะโหลด subcollection ของทุกห้องพร้อมกัน:
```typescript
// ❌ แบบเดิม - โหลดทุกห้องพร้อมกัน
useAllRoomBilling(allRooms, month) // 50 rooms × 2 = 100 subscriptions

// ✅ แบบใหม่ - โหลดเฉพาะเมื่อต้องการ
useRoomBilling(selectedRoomId, month) // 1 room × 2 = 2 subscriptions
```

---

### ✅ 3. Caching & Pagination

```typescript
// เก็บ cache ข้อมูลที่โหลดแล้ว
const [cache, setCache] = useState<Map<string, Data>>(new Map());

// Pagination สำหรับข้อมูลจำนวนมาก
query(collection(...), limit(20))
```

---

### ✅ 4. Debounce & Throttle

```typescript
// Debounce search/filter
const debouncedSearch = useMemo(
  () => debounce((value) => setSearch(value), 300),
  []
);
```

---

## การแก้ไขแบบเร่งด่วน (Quick Wins)

### 🎯 Priority 1: BillingPage (ลด ~90% reads)

**ปัญหา:** โหลด subcollection ของทุกห้องพร้อมกัน

**แก้ไข:**
1. เปลี่ยนจาก `onSnapshot` → `getDocs` 
2. โหลดเฉพาะเดือนที่เลือก
3. เพิ่ม loading state และ cache

```typescript
// ❌ เดิม: onSnapshot (real-time)
const unsub = onSnapshot(query(...), (snap) => { ... });

// ✅ ใหม่: getDocs (one-time read)
const snap = await getDocs(query(...));
const data = snap.docs.map(d => d.data());
```

**ผลลัพธ์:** ลดจาก ~5,000 reads → ~500 reads (ลด 90%)

---

### 🎯 Priority 2: RoomsPage Modal (ลด ~70% reads)

**ปัญหา:** เปิด modal → subscribe subcollection ทันที

**แก้ไข:**
1. เปลี่ยน history hooks เป็น `getDocs`
2. โหลดเฉพาะเมื่อเปิด tab history

```typescript
// ใช้ getDocs แทน onSnapshot สำหรับ history
async function loadHistory(roomId: string) {
  const snap = await getDocs(query(...));
  return snap.docs.map(d => d.data());
}
```

**ผลลัพธ์:** ลดจาก ~160 reads → ~50 reads (ลด 70%)

---

### 🎯 Priority 3: Camps & Zones Context (ลด ~50% reads)

**ปัญหา:** Subscribe ข้อมูลที่ไม่ค่อยเปลี่ยน

**แก้ไข:**
1. โหลดครั้งเดียวตอน mount
2. Refresh เฉพาะเมื่อมีการเปลี่ยนแปลง (manual)

```typescript
// ใช้ getDocs + manual refresh
const [camps, setCamps] = useState<Camp[]>([]);

async function loadCamps() {
  const snap = await getDocs(query(...));
  setCamps(snap.docs.map(d => d.data()));
}

useEffect(() => { loadCamps(); }, []);
```

**ผลลัพธ์:** ลดจาก continuous reads → one-time read

---

## สรุปผลลัพธ์ที่คาดหวัง

| หน้า | ก่อนแก้ไข | หลังแก้ไข | ลดลง |
|------|-----------|-----------|------|
| BillingPage | ~5,000 reads | ~500 reads | **90%** |
| RoomsPage | ~160 reads | ~50 reads | **70%** |
| Dashboard | ~200 reads | ~200 reads | 0% (ต้อง real-time) |
| Visitors | ~20 reads | ~20 reads | 0% (ต้อง real-time) |
| **รวม** | **~5,400 reads** | **~800 reads** | **85%** |

### ประหยัด Quota:
- ก่อน: 540,000 reads/day (10 users)
- หลัง: **81,000 reads/day** 
- **ประหยัด: 459,000 reads/day (85%)**

---

## ขั้นตอนการแก้ไข

### Phase 1: Critical (ทำทันที)
1. ✅ แก้ BillingPage - เปลี่ยน useAllRoomBilling เป็น getDocs
2. ✅ แก้ RoomsPage - เปลี่ยน history hooks เป็น getDocs

### Phase 2: Important (ทำภายใน 1 สัปดาห์)
3. ✅ แก้ Camps/Zones Context - เปลี่ยนเป็น getDocs + manual refresh
4. ✅ เพิ่ม caching mechanism

### Phase 3: Nice to have (ทำเมื่อมีเวลา)
5. ✅ เพิ่ม pagination สำหรับ lists
6. ✅ เพิ่ม debounce สำหรับ search/filter
7. ✅ Monitor และ optimize ต่อ

---

## Monitoring

เพิ่ม logging เพื่อติดตาม reads:
```typescript
console.log('[Firebase Read]', collectionName, 'count:', docs.length);
```

ตรวจสอบใน Firebase Console:
- Firestore → Usage tab
- ดู Read operations per day
- ตั้ง Budget alerts

---

## Notes

- ⚠️ **อย่าลืม cleanup subscriptions** ใน useEffect return
- ⚠️ **ทดสอบให้ดี** ก่อน deploy เพราะเปลี่ยนจาก real-time → manual refresh
- ⚠️ **แจ้ง users** ว่าบางหน้าต้อง refresh manual (ถ้าจำเป็น)
