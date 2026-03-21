import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CampStatus = "Active" | "Inactive" | "Maintenance";

export interface Camp {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: CampStatus;
}

const ROOT     = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useCamps() {
  const [camps, setCamps]     = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "camps"),
      orderBy("name")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCamps(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Camp)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { camps, loading };
}

export async function addCamp(data: Omit<Camp, "id">) {
  return addDoc(collection(db, ROOT, ROOT_DOC, "camps"), data);
}

export async function updateCamp(id: string, data: Partial<Omit<Camp, "id">>) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "camps", id), data);
}

export async function deleteCamp(id: string) {
  await deleteDoc(doc(db, ROOT, ROOT_DOC, "camps", id));
}
