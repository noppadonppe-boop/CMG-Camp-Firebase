# 🐛 Bugfix - Infinite Loop ในหน้า BillingPage

## ปัญหา
เมื่อเข้าหน้า BillingPage (การเงิน) หน้าจะโหลดวนลูปไม่หยุด

## สาเหตุ

### Root Cause:
`useEffect` ใน `useAllRoomBilling` มี dependency เป็น `rooms` array

```typescript
// ❌ โค้ดเดิม (มีปัญหา)
useEffect(() => {
  // ... load data
}, [rooms, month]); // rooms เป็น array ที่ถูกสร้างใหม่ทุกครั้ง
```

### ทำไมถึงเกิด Infinite Loop:

1. Component render → `rooms` array ถูกสร้างใหม่
2. `useEffect` เห็นว่า `rooms` เปลี่ยน (reference ใหม่) → ทำงาน
3. `useEffect` ทำงาน → `setState` (setElecMap, setMaintMap)
4. `setState` → Component re-render
5. กลับไปข้อ 1 → **วนลูปไม่หยุด!** 🔄

### ทำไม Array ถึงถูกสร้างใหม่ทุกครั้ง:

```typescript
// ใน BillingPage component
const filteredRooms = rooms.filter(r => ...); // สร้าง array ใหม่ทุกครั้ง render

// ส่งไปให้ useAllRoomBilling
const { elecMap, maintMap, loading } = useAllRoomBilling(filteredRooms, selectedMonth);
```

ทุกครั้งที่ component render, `filteredRooms` จะเป็น array instance ใหม่ แม้ว่าข้อมูลข้างในจะเหมือนเดิม

## วิธีแก้ไข

### ✅ Solution: ใช้ stable string แทน array

```typescript
// ✅ โค้ดใหม่ (แก้ไขแล้ว)
function useAllRoomBilling(rooms: Room[], month: string) {
  // สร้าง stable string จาก room IDs
  const roomIds = rooms.map(r => r.id).sort().join(',');

  useEffect(() => {
    // ... load data
  }, [roomIds, month]); // ใช้ roomIds (string) แทน rooms (array)
}
```

### ทำไมวิธีนี้ได้ผล:

1. `roomIds` เป็น string (primitive type)
2. ถ้า rooms เหมือนเดิม → `roomIds` จะเหมือนเดิม (same value)
3. React จะเปรียบเทียบ string ด้วย value ไม่ใช่ reference
4. ถ้า `roomIds` ไม่เปลี่ยน → `useEffect` ไม่ทำงาน → ไม่วนลูป ✅

### ทำไมต้อง `.sort()`:

```typescript
// ถ้าไม่ sort
['a', 'b', 'c'].join(',') // "a,b,c"
['c', 'b', 'a'].join(',') // "c,b,a" ← ต่างกัน!

// ถ้า sort
['a', 'b', 'c'].sort().join(',') // "a,b,c"
['c', 'b', 'a'].sort().join(',') // "a,b,c" ← เหมือนกัน ✅
```

## การเปลี่ยนแปลง

### ไฟล์: `src/pages/BillingPage.tsx`

```diff
function useAllRoomBilling(rooms: Room[], month: string) {
  const [elecMap, setElecMap] = useState<Record<string, ElectricityRecord | null>>({});
  const [maintMap, setMaintMap] = useState<Record<string, MaintenanceFeeRecord | null>>({});
  const [loading, setLoading] = useState(true);

+ // Create stable room IDs string to avoid infinite loop
+ const roomIds = rooms.map(r => r.id).sort().join(',');

  useEffect(() => {
-   if (rooms.length === 0) { setLoading(false); return; }
+   if (rooms.length === 0) { 
+     setLoading(false); 
+     setElecMap({});
+     setMaintMap({});
+     return; 
+   }
    
    // ... rest of the code
    
-  }, [rooms, month]);
+  }, [roomIds, month]); // ใช้ roomIds แทน rooms

  return { elecMap, maintMap, loading };
}
```

## การทดสอบ

### ✅ Test Cases:

1. **เปิดหน้า BillingPage**
   - ✅ ควรโหลดข้อมูลครั้งเดียว
   - ✅ ไม่ควรวนลูป
   - ✅ ดู console ควรเห็น "📊 [Billing] Loading data..." เพียงครั้งเดียว

2. **เปลี่ยนเดือน**
   - ✅ ควรโหลดข้อมูลใหม่
   - ✅ ดู console ควรเห็น "📊 [Billing] Loading data..." อีกครั้ง

3. **เปลี่ยน Camp filter**
   - ✅ ควรโหลดข้อมูลใหม่ (เพราะ rooms เปลี่ยน)
   - ✅ ดู console ควรเห็น "📊 [Billing] Loading data..." อีกครั้ง

4. **ไม่มีห้อง (empty rooms)**
   - ✅ ควรแสดง "ไม่พบห้องพัก"
   - ✅ ไม่ควร error

### วิธีทดสอบ:

1. เปิด DevTools → Console
2. เข้าหน้า BillingPage
3. ดู console logs:
   ```
   📊 [Billing] Loading data for 50 rooms, month: 2026-05
   ✅ Room A-101: elec=✓, maint=✓
   ✅ Room A-102: elec=✓, maint=✗
   ...
   ✅ [Billing] Data loaded successfully
   ```
4. ถ้าเห็น log ซ้ำๆ หลายครั้ง → ยังมีปัญหา
5. ถ้าเห็น log เพียงครั้งเดียว → แก้ไขสำเร็จ ✅

## บทเรียนที่ได้

### ❌ อย่าทำ:

```typescript
// ❌ ใช้ array/object เป็น dependency โดยตรง
useEffect(() => {
  // ...
}, [rooms, users, data]); // array/object ถูกสร้างใหม่ทุกครั้ง
```

### ✅ ควรทำ:

```typescript
// ✅ วิธีที่ 1: ใช้ stable string
const roomIds = rooms.map(r => r.id).sort().join(',');
useEffect(() => {
  // ...
}, [roomIds]);

// ✅ วิธีที่ 2: ใช้ useMemo
const memoizedRooms = useMemo(() => rooms, [rooms.length, rooms.map(r => r.id).join(',')]);
useEffect(() => {
  // ...
}, [memoizedRooms]);

// ✅ วิธีที่ 3: ใช้ primitive values
useEffect(() => {
  // ...
}, [rooms.length, selectedId]);

// ✅ วิธีที่ 4: ใช้ refreshKey
const [refreshKey, setRefreshKey] = useState(0);
useEffect(() => {
  // ...
}, [refreshKey]);
```

## Related Issues

### ไฟล์อื่นที่อาจมีปัญหาเดียวกัน:

ตรวจสอบแล้ว ไฟล์อื่นไม่มีปัญหา เพราะ:
- ✅ `useCamps` - ใช้ `refreshKey`
- ✅ `useZones` - ใช้ `refreshKey`
- ✅ `useRoomHistory` - ใช้ `roomId` (string)
- ✅ `useInspectionLogs` - ใช้ `campId`, `limitCount` (primitives)
- ✅ `useMeterReadings` - ใช้ `billingMonth?.getFullYear()`, `billingMonth?.getMonth()` (primitives)

## Performance Impact

### ก่อนแก้ไข:
- ❌ Infinite loop
- ❌ CPU 100%
- ❌ หน้าค้าง
- ❌ Firebase reads ไม่หยุด

### หลังแก้ไข:
- ✅ โหลดครั้งเดียว
- ✅ CPU ปกติ
- ✅ หน้าทำงานได้
- ✅ Firebase reads ตามที่คาดหวัง

## References

- [React useEffect Dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- [React useMemo](https://react.dev/reference/react/useMemo)
- [JavaScript Array Reference vs Value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

---

**Fixed:** 2026-05-08  
**Status:** ✅ Resolved  
**Severity:** Critical (P0)
