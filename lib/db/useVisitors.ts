"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, addDoc, updateDoc } from "firebase/firestore";
import { rootCol, rootDoc } from "@/lib/firestore-helpers";

export interface Visitor {
  id: string;
  name: string;
  purpose: string;
  visitingWorker: string;
  room: string;
  timeIn: string;
  phone: string;
  checkedOut: boolean;
  timeOut?: string;
}

export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(rootCol("visitors"), orderBy("timeIn", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setVisitors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Visitor)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { visitors, loading };
}

export async function addVisitor(data: Omit<Visitor, "id">) {
  return addDoc(rootCol("visitors"), data);
}

export async function checkOutVisitor(id: string) {
  return updateDoc(rootDoc("visitors", id), {
    checkedOut: true,
    timeOut: new Date().toISOString(),
  });
}
