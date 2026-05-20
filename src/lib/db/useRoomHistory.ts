import { useCallback, useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
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
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadHistory() {
      try {
        const q = query(
          collection(db, ROOT, ROOT_DOC, "rooms", roomId, "occupancyHistory"),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as OccupancyRecord)));
          setLoading(false);
          console.log(`📖 [Read] Occupancy history for room ${roomId}: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading occupancy history:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [roomId, refreshKey]);

  return { records, loading, reload };
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
  meterReading: number;   // หน่วย kWh (ค่ามิเตอร์ปัจจุบัน)
  usedUnits?: number;     // จำนวนหน่วยที่ใช้ (meterReading - previousReading) - ไม่มีในครั้งแรก
  totalCost: number;      // บาท (usedUnits * 8) - ครั้งแรกจะเป็น 0
  month: string;          // "YYYY-MM"
  note?: string;
  date: Timestamp | null;
  recordedBy?: string;
}

export function useElectricityHistory(roomId: string) {
  const [records, setRecords] = useState<ElectricityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadHistory() {
      try {
        const q = query(
          collection(db, ROOT, ROOT_DOC, "rooms", roomId, "electricityHistory"),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ElectricityRecord)));
          setLoading(false);
          console.log(`📖 [Read] Electricity history for room ${roomId}: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading electricity history:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [roomId, refreshKey]);

  return { records, loading, reload };
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

export async function deleteElectricityRecord(roomId: string, recordId: string) {
  const docRef = doc(db, ROOT, ROOT_DOC, "rooms", roomId, "electricityHistory", recordId);
  await deleteDoc(docRef);
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
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadHistory() {
      try {
        const q = query(
          collection(db, ROOT, ROOT_DOC, "rooms", roomId, "maintenanceFeeHistory"),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceFeeRecord)));
          setLoading(false);
          console.log(`📖 [Read] Maintenance history for room ${roomId}: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading maintenance history:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [roomId, refreshKey]);

  return { records, loading, reload };
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

export async function deleteMaintenanceFeeRecord(roomId: string, recordId: string) {
  const docRef = doc(db, ROOT, ROOT_DOC, "rooms", roomId, "maintenanceFeeHistory", recordId);
  await deleteDoc(docRef);
}
