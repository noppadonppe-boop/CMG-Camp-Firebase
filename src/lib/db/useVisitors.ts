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

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitingWorker: string;
  room: string;
  timeIn: string;
  checkedOut: boolean;
}

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "visitors"),
      orderBy("timeIn", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVisitors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Visitor)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { visitors, loading };
}

export async function addVisitor(data: Omit<Visitor, "id">) {
  await addDoc(collection(db, ROOT, ROOT_DOC, "visitors"), data);
}

export async function checkOutVisitor(id: string) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "visitors", id), { checkedOut: true });
}
