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
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type RoomStatus = "empty" | "partial" | "full" | "maintenance";

export interface Room {
  id: string;
  number: string;
  zoneId: string;
  occupied: number;
  capacity: number;
  status: RoomStatus;
}

export interface Zone {
  id: string;
  campId?: string;
  label: string;
  order: number;
}

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    let isCancelled = false;

    async function loadZones() {
      setLoading(true);
      try {
        const q = query(
          collection(db, ROOT, ROOT_DOC, "zones"),
          orderBy("order")
        );
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setZones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Zone)));
          setLoading(false);
          console.log(`📖 [Read] Zones: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading zones:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadZones();

    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  return { zones, loading, refresh };
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "rooms"),
      orderBy("number")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { rooms, loading };
}

export async function addZone(data: Omit<Zone, "id">) {
  await addDoc(collection(db, ROOT, ROOT_DOC, "zones"), data);
}

export async function updateZone(id: string, data: Partial<Omit<Zone, "id">>) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "zones", id), data);
}

export async function deleteZone(id: string) {
  await deleteDoc(doc(db, ROOT, ROOT_DOC, "zones", id));
}

export async function addRoom(data: Omit<Room, "id">) {
  await addDoc(collection(db, ROOT, ROOT_DOC, "rooms"), data);
}

export async function updateRoom(id: string, data: Partial<Omit<Room, "id">>) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "rooms", id), data);
}

export async function deleteRoom(id: string) {
  await deleteDoc(doc(db, ROOT, ROOT_DOC, "rooms", id));
}
