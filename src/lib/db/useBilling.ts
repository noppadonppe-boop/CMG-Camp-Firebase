import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const ROOT     = "cmg-camp-manager";
const ROOT_DOC = "root";

/* ─── Types ────────────────────────────────────────────────────── */

export type PaymentStatus = "unpaid" | "paid" | "overdue" | "void";

export interface InvoiceLineItem {
  type: "rent" | "water" | "electricity" | "penalty";
  description: string;
  unitCount?: number;
  unitRate?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  roomNumber: string;
  zone: string;
  building: string;
  occupants: number;
  billingMonth: Timestamp;
  dueDate: Timestamp;
  rentAmount: number;
  waterAmount: number;
  elecAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  paidAt?: Timestamp;
  paymentMethod?: string;
  lineItems: InvoiceLineItem[];
  subcontractor: string;
}

export interface MeterReading {
  id: string;
  roomId: string;
  roomNumber: string;
  zone: string;
  building: string;
  occupants: number;
  billingMonth: Timestamp;
  waterPrev: number;
  waterCurr: number;
  elecPrev: number;
  elecCurr: number;
  savedAt?: Timestamp;
}

/* ─── Hooks ─────────────────────────────────────────────────────── */

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "invoices"),
      orderBy("billingMonth", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { invoices, loading };
}

export function useMeterReadings(billingMonth?: Date) {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadReadings() {
      try {
        let q;
        if (billingMonth) {
          const start = Timestamp.fromDate(new Date(billingMonth.getFullYear(), billingMonth.getMonth(), 1));
          const end   = Timestamp.fromDate(new Date(billingMonth.getFullYear(), billingMonth.getMonth() + 1, 1));
          q = query(
            collection(db, ROOT, ROOT_DOC, "meter_readings"),
            where("billingMonth", ">=", start),
            where("billingMonth", "<",  end),
            orderBy("billingMonth"),
            orderBy("roomNumber")
          );
        } else {
          q = query(
            collection(db, ROOT, ROOT_DOC, "meter_readings"),
            orderBy("roomNumber")
          );
        }
        
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setReadings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MeterReading)));
          setLoading(false);
          console.log(`📖 [Read] Meter readings: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading meter readings:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadReadings();

    return () => {
      isCancelled = true;
    };
  }, [billingMonth?.getFullYear(), billingMonth?.getMonth()]);

  return { readings, loading };
}

/* ─── Write functions ───────────────────────────────────────────── */

export async function addInvoice(data: Omit<Invoice, "id">) {
  return addDoc(collection(db, ROOT, ROOT_DOC, "invoices"), data);
}

export async function updateInvoiceStatus(
  id: string,
  status: PaymentStatus,
  paymentMethod?: string
) {
  const patch: Record<string, unknown> = { status };
  if (status === "paid") {
    patch.paidAt = Timestamp.now();
    patch.paymentMethod = paymentMethod ?? "เงินสด";
  }
  await updateDoc(doc(db, ROOT, ROOT_DOC, "invoices", id), patch);
}

export async function saveMeterReading(data: Omit<MeterReading, "id">) {
  return addDoc(collection(db, ROOT, ROOT_DOC, "meter_readings"), {
    ...data,
    savedAt: Timestamp.now(),
  });
}

export async function updateMeterReading(id: string, data: Partial<MeterReading>) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "meter_readings", id), {
    ...data,
    savedAt: Timestamp.now(),
  });
}
