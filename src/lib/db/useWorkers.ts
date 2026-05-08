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
  // Employment type checkboxes
  employmentTypes?: {
    dc?: boolean;
    subcontract?: boolean;
    supply?: boolean;
    foreign?: boolean;
  };
  // Team/Set name
  teamName?: string;
}

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "workers"),
      orderBy("firstName")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setWorkers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Worker)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { workers, loading };
}

export async function addWorker(data: Omit<Worker, "id">) {
  await addDoc(collection(db, ROOT, ROOT_DOC, "workers"), data);
}

export async function updateWorker(id: string, data: Partial<Omit<Worker, "id">>) {
  await updateDoc(doc(db, ROOT, ROOT_DOC, "workers", id), data);
}

export async function deleteWorker(id: string) {
  await deleteDoc(doc(db, ROOT, ROOT_DOC, "workers", id));
}
