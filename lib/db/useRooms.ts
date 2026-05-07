"use client";

import { useState, useEffect } from "react";
import {
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { rootCol, rootDoc } from "@/lib/firestore-helpers";

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

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(rootCol("zones"), orderBy("order"));
    const unsub = onSnapshot(q, (snap) => {
      setZones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Zone)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { zones, loading };
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(rootCol("rooms"), orderBy("number"));
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { rooms, loading };
}

export async function addZone(data: Omit<Zone, "id">) {
  return addDoc(rootCol("zones"), data);
}

export async function addRoom(data: Omit<Room, "id">) {
  return addDoc(rootCol("rooms"), data);
}

export async function updateRoom(id: string, patch: Partial<Room>) {
  return updateDoc(rootDoc("rooms", id), patch);
}
