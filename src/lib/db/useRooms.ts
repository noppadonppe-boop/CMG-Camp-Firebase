import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
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
  label: string;
  order: number;
}

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "zones"),
      orderBy("order")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setZones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Zone)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { zones, loading };
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

export async function addRoom(data: Omit<Room, "id">) {
  await addDoc(collection(db, ROOT, ROOT_DOC, "rooms"), data);
}

export async function updateRoom(id: string, data: Partial<Omit<Room, "id">>) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "rooms", id), data);
}
