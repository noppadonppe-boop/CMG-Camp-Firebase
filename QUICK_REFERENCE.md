# 🚀 Quick Reference - Firebase Optimization

## 📋 Checklist การทดสอบ

### ก่อน Deploy
- [ ] ตรวจสอบ console ไม่มี error
- [ ] ทดสอบทุกหน้าที่แก้ไข
- [ ] ตรวจสอบ Firebase Console → Usage (baseline)

### หลัง Deploy
- [ ] ทดสอบ BillingPage - เปลี่ยนเดือน
- [ ] ทดสอบ RoomsPage - เปิด modal ดู history
- [ ] ทดสอบ CampsPage - เพิ่ม/แก้ไข camp
- [ ] ตรวจสอบ Firebase Console → Usage (หลัง 1 ชม)
- [ ] ตรวจสอบ Firebase Console → Usage (หลัง 24 ชม)

---

## 🔧 วิธีแก้ปัญหาเบื้องต้น

### ปัญหา: ข้อมูลไม่อัพเดท
**สาเหตุ:** หน้านั้นเปลี่ยนเป็น one-time read แล้ว

**วิธีแก้:**
1. กด F5 refresh หน้าเว็บ
2. หรือปิด/เปิดหน้าใหม่

### ปัญหา: Loading ช้า
**สาเหตุ:** โหลดข้อมูลจำนวนมาก

**วิธีแก้:**
1. ตรวจสอบ console logs
2. ดูว่า query ไหนช้า
3. พิจารณาเพิ่ม pagination

### ปัญหา: Quota ยังเกิน
**สาเหตุ:** อาจมี hooks อื่นที่ยังใช้ onSnapshot

**วิธีแก้:**
1. ตรวจสอบ console logs
2. ดู Network tab ใน DevTools
3. หา hooks ที่ยังใช้ onSnapshot
4. พิจารณาเปลี่ยนเป็น getDocs

---

## 📊 การ Monitor

### Firebase Console
```
Firebase Console → Firestore → Usage
```
ดู:
- Read operations (ควรลดลง 80-85%)
- Active connections (ควรลดลง 95%)

### Browser Console
เปิด DevTools → Console → ดู logs:
```
📖 [Read] Camps: 5 records
📖 [Read] Zones: 10 records
✅ [Billing] Data loaded successfully
```

### Network Tab
เปิด DevTools → Network → Filter: `firestore`
- ดูจำนวน requests
- ดูขนาดข้อมูล

---

## 🎯 เป้าหมาย Quota

### ก่อนแก้ไข:
- 540,000 reads/day (10 users)
- 109 active subscriptions

### หลังแก้ไข (เป้าหมาย):
- **81,000 reads/day** (ลด 85%)
- **3 active subscriptions** (ลด 97%)

### Firebase Free Tier:
- 50,000 reads/day (FREE)
- 20,000 writes/day (FREE)
- 20,000 deletes/day (FREE)

**หมายเหตุ:** ถ้ายังเกิน → ต้อง upgrade เป็น Blaze Plan

---

## 🔄 เมื่อไหร่ควรใช้ onSnapshot vs getDocs

### ใช้ onSnapshot (Real-time):
✅ Dashboard stats  
✅ Visitors (security)  
✅ Rooms & Workers (collaborative)  
✅ Users (approval)  
✅ Invoices (payment status)  

### ใช้ getDocs (One-time):
✅ History/Logs  
✅ Reports  
✅ Billing data  
✅ Master data (camps, zones)  
✅ Archived data  

---

## 💻 Code Examples

### ❌ แบบเดิม (Real-time):
```typescript
useEffect(() => {
  const unsub = onSnapshot(query(...), (snap) => {
    setData(snap.docs.map(d => d.data()));
  });
  return unsub;
}, []);
```

### ✅ แบบใหม่ (One-time):
```typescript
useEffect(() => {
  let isCancelled = false;
  
  async function loadData() {
    const snap = await getDocs(query(...));
    if (!isCancelled) {
      setData(snap.docs.map(d => d.data()));
      console.log(`📖 [Read] Data: ${snap.docs.length} records`);
    }
  }
  
  loadData();
  return () => { isCancelled = true; };
}, []);
```

---

## 📞 ติดต่อ/ช่วยเหลือ

### ถ้าพบปัญหา:
1. ตรวจสอบ console logs
2. ตรวจสอบ Network tab
3. ดูไฟล์ `OPTIMIZATION_SUMMARY.md`
4. ดูไฟล์ `FIREBASE_READ_OPTIMIZATION.md`

### ถ้ายังแก้ไม่ได้:
- เปิด issue ใน repo
- แนบ console logs
- แนบ screenshot จาก Firebase Console

---

**Last Updated:** 2026-05-08  
**Version:** 1.0
