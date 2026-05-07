"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
import { rootCol } from "@/lib/firestore-helpers";

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  nationality: string;
  phone: string;
  subcontractor: string;
  jobRole: string;
  roomId: string;
  zoneId: string;
  docType: string;
  idNumber: string;
  photoUrl?: string;
}

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(rootCol("workers"), orderBy("firstName"));
    const unsub = onSnapshot(q, (snap) => {
      setWorkers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Worker)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { workers, loading };
}

export async function addWorker(data: Omit<Worker, "id">) {
  return addDoc(rootCol("workers"), data);
}
