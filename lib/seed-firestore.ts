/**
 * Firestore Seeder
 *
 * Firestore Structure:
 *   cmg-camp-manager (collection)
 *     └── root (document)
 *           ├── zones       (subcollection)
 *           ├── rooms       (subcollection)
 *           ├── workers     (subcollection)
 *           ├── visitors    (subcollection)
 *           └── dashboard   (subcollection)
 *
 * Run via the SeedButton component at /admin/seed (dev only).
 * All users (including anonymous) read/write to the same path.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function rootCol(sub: string) {
  return collection(db, ROOT, ROOT_DOC, sub);
}

export function rootDoc(sub: string, id: string) {
  return doc(db, ROOT, ROOT_DOC, sub, id);
}

/* ─── Mock data ──────────────────────────────────────────────── */

const ZONES_DATA = [
  { id: "zone-a", label: "Zone A — Block 1", order: 0 },
  { id: "zone-b", label: "Zone B — Block 2", order: 1 },
  { id: "zone-c", label: "Zone C — Block 3", order: 2 },
];

const ROOMS_DATA = [
  { id: "a101", number: "A-101", zoneId: "zone-a", occupied: 0, capacity: 4, status: "empty" },
  { id: "a102", number: "A-102", zoneId: "zone-a", occupied: 4, capacity: 4, status: "full" },
  { id: "a103", number: "A-103", zoneId: "zone-a", occupied: 1, capacity: 2, status: "partial" },
  { id: "a104", number: "A-104", zoneId: "zone-a", occupied: 3, capacity: 4, status: "partial" },
  { id: "a105", number: "A-105", zoneId: "zone-a", occupied: 0, capacity: 4, status: "empty" },
  { id: "a106", number: "A-106", zoneId: "zone-a", occupied: 0, capacity: 0, status: "maintenance" },
  { id: "a107", number: "A-107", zoneId: "zone-a", occupied: 2, capacity: 4, status: "partial" },
  { id: "a108", number: "A-108", zoneId: "zone-a", occupied: 4, capacity: 4, status: "full" },
  { id: "a109", number: "A-109", zoneId: "zone-a", occupied: 0, capacity: 2, status: "empty" },
  { id: "a110", number: "A-110", zoneId: "zone-a", occupied: 2, capacity: 4, status: "partial" },
  { id: "a111", number: "A-111", zoneId: "zone-a", occupied: 4, capacity: 4, status: "full" },
  { id: "a112", number: "A-112", zoneId: "zone-a", occupied: 0, capacity: 0, status: "maintenance" },
  { id: "b201", number: "B-201", zoneId: "zone-b", occupied: 3, capacity: 4, status: "partial" },
  { id: "b202", number: "B-202", zoneId: "zone-b", occupied: 4, capacity: 4, status: "full" },
  { id: "b203", number: "B-203", zoneId: "zone-b", occupied: 1, capacity: 4, status: "partial" },
  { id: "b204", number: "B-204", zoneId: "zone-b", occupied: 2, capacity: 2, status: "full" },
  { id: "b205", number: "B-205", zoneId: "zone-b", occupied: 0, capacity: 4, status: "empty" },
  { id: "b206", number: "B-206", zoneId: "zone-b", occupied: 4, capacity: 4, status: "full" },
  { id: "b207", number: "B-207", zoneId: "zone-b", occupied: 0, capacity: 0, status: "maintenance" },
  { id: "b208", number: "B-208", zoneId: "zone-b", occupied: 2, capacity: 4, status: "partial" },
  { id: "b209", number: "B-209", zoneId: "zone-b", occupied: 0, capacity: 4, status: "empty" },
  { id: "b210", number: "B-210", zoneId: "zone-b", occupied: 4, capacity: 4, status: "full" },
  { id: "c301", number: "C-301", zoneId: "zone-c", occupied: 5, capacity: 6, status: "partial" },
  { id: "c302", number: "C-302", zoneId: "zone-c", occupied: 6, capacity: 6, status: "full" },
  { id: "c303", number: "C-303", zoneId: "zone-c", occupied: 0, capacity: 6, status: "empty" },
  { id: "c304", number: "C-304", zoneId: "zone-c", occupied: 3, capacity: 6, status: "partial" },
  { id: "c305", number: "C-305", zoneId: "zone-c", occupied: 6, capacity: 6, status: "full" },
  { id: "c306", number: "C-306", zoneId: "zone-c", occupied: 0, capacity: 0, status: "maintenance" },
  { id: "c307", number: "C-307", zoneId: "zone-c", occupied: 2, capacity: 6, status: "partial" },
  { id: "c308", number: "C-308", zoneId: "zone-c", occupied: 0, capacity: 6, status: "empty" },
];

const WORKERS_DATA = [
  { id: "w001", firstName: "สมชาย",   lastName: "ใจดี",       gender: "male",   nationality: "ไทย",    phone: "081-234-5678", subcontractor: "Alpha Construction Co.", jobRole: "General Worker",    roomId: "a101", zoneId: "zone-a", docType: "national-id", idNumber: "1-1234-56789-01-2" },
  { id: "w002", firstName: "วนิดา",   lastName: "พรหมพันธ์",  gender: "female", nationality: "ไทย",    phone: "089-876-5432", subcontractor: "Beta Workforce Ltd.",     jobRole: "Foreman",           roomId: "a103", zoneId: "zone-a", docType: "national-id", idNumber: "1-2345-67890-12-3" },
  { id: "w003", firstName: "อรุณ",    lastName: "ทองชัย",     gender: "male",   nationality: "ไทย",    phone: "062-111-2233", subcontractor: "Gamma Labour Services",  jobRole: "Skilled Technician",roomId: "c301", zoneId: "zone-c", docType: "national-id", idNumber: "1-3456-78901-23-4" },
  { id: "w004", firstName: "ณัฐพร",   lastName: "บัวลา",      gender: "female", nationality: "เมียนมา",phone: "095-444-6677", subcontractor: "Alpha Construction Co.", jobRole: "General Worker",    roomId: "b201", zoneId: "zone-b", docType: "passport",    idNumber: "MM-123456" },
  { id: "w005", firstName: "บุญเลิศ", lastName: "ยามาดา",     gender: "male",   nationality: "ไทย",    phone: "083-999-0011", subcontractor: "Delta Staffing Group",   jobRole: "Electrician",       roomId: "a103", zoneId: "zone-a", docType: "national-id", idNumber: "1-4567-89012-34-5" },
  { id: "w006", firstName: "ลัดดา",   lastName: "ศรีสุข",     gender: "female", nationality: "กัมพูชา",phone: "086-777-8899", subcontractor: "Epsilon Manpower Co.",   jobRole: "General Worker",    roomId: "b203", zoneId: "zone-b", docType: "work-permit",  idNumber: "WP-654321" },
  { id: "w007", firstName: "กิตติพงษ์","lastName": "ไชย",    gender: "male",   nationality: "ไทย",    phone: "091-222-3344", subcontractor: "Beta Workforce Ltd.",     jobRole: "Safety Officer",    roomId: "c301", zoneId: "zone-c", docType: "national-id", idNumber: "1-5678-90123-45-6" },
  { id: "w008", firstName: "สุพัตรา", lastName: "นคร",        gender: "female", nationality: "ไทย",    phone: "094-555-6677", subcontractor: "Gamma Labour Services",  jobRole: "Foreman",           roomId: "b201", zoneId: "zone-b", docType: "national-id", idNumber: "1-6789-01234-56-7" },
];

const VISITORS_DATA = [
  { id: "v001", name: "Somjit Klaewkla",  purpose: "Family Visit",       visitingWorker: "สมชาย ใจดี",      room: "A-101", phone: "081-234-5678", checkedOut: false },
  { id: "v002", name: "Niran Phetsri",    purpose: "Document Delivery",  visitingWorker: "วนิดา พรหมพันธ์", room: "B-203", phone: "089-876-5432", checkedOut: false },
  { id: "v003", name: "Ladda Sukjai",     purpose: "Family Visit",       visitingWorker: "อรุณ ทองชัย",     room: "C-301", phone: "062-111-2233", checkedOut: false },
  { id: "v004", name: "Prasong Boonmak", purpose: "Contractor Meeting", visitingWorker: "กิตติพงษ์ ไชย",  room: "B-201", phone: "095-444-6677", checkedOut: false },
  { id: "v005", name: "Malinee Wongsuk", purpose: "Medical Check",      visitingWorker: "บุญเลิศ ยามาดา",  room: "A-103", phone: "083-999-0011", checkedOut: false },
];

const DASHBOARD_DATA = [
  {
    id: "main",
    campName: "Main Camp",
    stats: { totalWorkers: 320, present: 214, roomsOccupied: 47, roomsTotal: 60, alerts: 3 },
    logs: [
      { id: 1, name: "สมชาย ใจดี",      initials: "สช", avatarColor: "bg-blue-500",    time: "08:42", direction: "In",  role: "คนงาน" },
      { id: 2, name: "วนิดา พรหมพันธ์", initials: "วน", avatarColor: "bg-pink-500",    time: "08:39", direction: "In",  role: "หัวหน้างาน" },
      { id: 3, name: "อรุณ ทองชัย",     initials: "อร", avatarColor: "bg-emerald-500", time: "08:15", direction: "Out", role: "คนงาน" },
      { id: 4, name: "ณัฐพร บัวลา",     initials: "ณพ", avatarColor: "bg-violet-500",  time: "07:58", direction: "In",  role: "คนงาน" },
      { id: 5, name: "ชัยพร สุข",       initials: "ชพ", avatarColor: "bg-orange-500",  time: "07:45", direction: "Out", role: "เจ้าหน้าที่" },
      { id: 6, name: "ลัดดา ศรีสุข",    initials: "ลด", avatarColor: "bg-teal-500",    time: "07:30", direction: "In",  role: "คนงาน" },
    ],
    chartData: [
      { day: "จ.", count: 180 }, { day: "อ.", count: 210 }, { day: "พ.", count: 195 },
      { day: "พฤ.", count: 220 }, { day: "ศ.", count: 214 }, { day: "ส.", count: 140 }, { day: "อา.", count: 90 },
    ],
  },
  {
    id: "rayong",
    campName: "Rayong Camp",
    stats: { totalWorkers: 180, present: 132, roomsOccupied: 28, roomsTotal: 40, alerts: 1 },
    logs: [
      { id: 1, name: "ประเสริฐ วงศ์สุข", initials: "ปส", avatarColor: "bg-cyan-500",   time: "08:50", direction: "In",  role: "คนงาน" },
      { id: 2, name: "มาลี สมบูรณ์",     initials: "มล", avatarColor: "bg-rose-500",   time: "08:33", direction: "In",  role: "เจ้าหน้าที่" },
      { id: 3, name: "กิตติพงษ์ ไชย",   initials: "กต", avatarColor: "bg-amber-500",  time: "08:20", direction: "Out", role: "คนงาน" },
      { id: 4, name: "สุพัตรา นคร",      initials: "สพ", avatarColor: "bg-lime-600",   time: "08:05", direction: "In",  role: "หัวหน้างาน" },
      { id: 5, name: "บุญเลิศ ยามาดา",   initials: "บล", avatarColor: "bg-indigo-500", time: "07:50", direction: "In",  role: "คนงาน" },
    ],
    chartData: [
      { day: "จ.", count: 110 }, { day: "อ.", count: 125 }, { day: "พ.", count: 118 },
      { day: "พฤ.", count: 130 }, { day: "ศ.", count: 132 }, { day: "ส.", count: 85 }, { day: "อา.", count: 60 },
    ],
  },
  {
    id: "chonburi",
    campName: "Chonburi Camp",
    stats: { totalWorkers: 95, present: 61, roomsOccupied: 14, roomsTotal: 20, alerts: 0 },
    logs: [
      { id: 1, name: "ธนกิจ รุ่งโรจน์",  initials: "ธก", avatarColor: "bg-sky-500",     time: "08:55", direction: "In",  role: "คนงาน" },
      { id: 2, name: "อรวรรณ เพชรรัตน์", initials: "อว", avatarColor: "bg-fuchsia-500", time: "08:40", direction: "Out", role: "คนงาน" },
      { id: 3, name: "จิรวัฒน์ แสงสุข",  initials: "จว", avatarColor: "bg-green-600",   time: "08:22", direction: "In",  role: "เจ้าหน้าที่" },
      { id: 4, name: "นิรันดร์ ใจดี",    initials: "นร", avatarColor: "bg-red-500",     time: "08:10", direction: "In",  role: "คนงาน" },
    ],
    chartData: [
      { day: "จ.", count: 55 }, { day: "อ.", count: 60 }, { day: "พ.", count: 58 },
      { day: "พฤ.", count: 63 }, { day: "ศ.", count: 61 }, { day: "ส.", count: 40 }, { day: "อา.", count: 28 },
    ],
  },
];

/* ─── Seeder ─────────────────────────────────────────────────── */

async function clearCollection(colName: string) {
  const snap = await getDocs(rootCol(colName));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function seedFirestore(): Promise<void> {
  // Ensure root document exists
  await setDoc(doc(db, ROOT, ROOT_DOC), {
    _description: "CMG Camp Manager — root document",
    seededAt: new Date().toISOString(),
  });

  // Clear & seed zones
  await clearCollection("zones");
  const zoneBatch = writeBatch(db);
  for (const z of ZONES_DATA) {
    zoneBatch.set(rootDoc("zones", z.id), z);
  }
  await zoneBatch.commit();

  // Clear & seed rooms
  await clearCollection("rooms");
  const roomBatch = writeBatch(db);
  for (const r of ROOMS_DATA) {
    roomBatch.set(rootDoc("rooms", r.id), r);
  }
  await roomBatch.commit();

  // Clear & seed workers
  await clearCollection("workers");
  const workerBatch = writeBatch(db);
  for (const w of WORKERS_DATA) {
    workerBatch.set(rootDoc("workers", w.id), w);
  }
  await workerBatch.commit();

  // Clear & seed visitors
  await clearCollection("visitors");
  const visitorBatch = writeBatch(db);
  for (const v of VISITORS_DATA) {
    visitorBatch.set(rootDoc("visitors", v.id), {
      ...v,
      timeIn: new Date(Date.now() - Math.random() * 5 * 60 * 60 * 1000).toISOString(),
    });
  }
  await visitorBatch.commit();

  // Clear & seed dashboard
  await clearCollection("dashboard");
  const dashBatch = writeBatch(db);
  for (const d of DASHBOARD_DATA) {
    dashBatch.set(rootDoc("dashboard", d.id), d);
  }
  await dashBatch.commit();

  console.log("✅ Firestore seeded successfully under cmg-camp-manager/root/*");
}
