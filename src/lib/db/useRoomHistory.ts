import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

// ─── Occupancy Record ────────────────────────────────────────────────────────
export interface OccupancyRecord {
  id: string;
  workerName: string;
  action: "checkin" | "checkout";
  date: Timestamp | null;
  recordedBy?: string;
}

export function useOccupancyHistory(roomId: string) {
  const [records, setRecords] = useState<OccupancyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, ROOT, ROOT_DOC, "rooms", roomId, "occupancyHistory"),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as OccupancyRecord)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [roomId]);

  return { records, loading };
}

export async function addOccupancyRecord(
  roomId: string,
  data: Omit<OccupancyRecord, "id" | "date">
) {
  await addDoc(
    collection(db, ROOT, ROOT_DOC, "rooms", roomId, "occupancyHistory"),
    { ...data, date: serverTimestamp() }
  );
}

// ─── Electricity Record ───────────────────────────────────────────────────────
export interface ElectricityRecord {
  id: string;
  meterReading: number;   // หน่วย kWh
  totalCost: number;      // บาท (meterReading * 8)
  month: string;          // "YYYY-MM"
  note?: string;
  date: Timestamp | null;
  recordedBy?: string;
}

export function useElectricityHistory(roomId: string) {
  const [records, setRecords] = useState<ElectricityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, ROOT, ROOT_DOC, "rooms", roomId, "electricityHistory"),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ElectricityRecord)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [roomId]);

  return { records, loading };
}

export async function addElectricityRecord(
  roomId: string,
  data: Omit<ElectricityRecord, "id" | "date">
) {
  await addDoc(
    collection(db, ROOT, ROOT_DOC, "rooms", roomId, "electricityHistory"),
    { ...data, date: serverTimestamp() }
  );
}

// ─── Maintenance Fee Record ────────────────────────────────────────────────────
export interface MaintenanceFeeRecord {
  id: string;
  month: string;          // "YYYY-MM"
  charged: boolean;       // true = เก็บค่าบำรุงรักษา
  costPerPerson: number;  // ฿150/คน
  occupants: number;      // จำนวนคนในเดือนนั้น
  totalCost: number;      // costPerPerson * occupants (0 ถ้า !charged)
  note?: string;
  date: Timestamp | null;
}

export function useMaintenanceFeeHistory(roomId: string) {
  const [records, setRecords] = useState<MaintenanceFeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, ROOT, ROOT_DOC, "rooms", roomId, "maintenanceFeeHistory"),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceFeeRecord)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [roomId]);

  return { records, loading };
}

export async function addMaintenanceFeeRecord(
  roomId: string,
  data: Omit<MaintenanceFeeRecord, "id" | "date">
) {
  await addDoc(
    collection(db, ROOT, ROOT_DOC, "rooms", roomId, "maintenanceFeeHistory"),
    { ...data, date: serverTimestamp() }
  );
}
