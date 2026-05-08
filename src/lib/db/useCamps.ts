import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
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
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    let isCancelled = false;

    async function loadCamps() {
      setLoading(true);
      try {
        const q = query(
          collection(db, ROOT, ROOT_DOC, "camps"),
          orderBy("name")
        );
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setCamps(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Camp)));
          setLoading(false);
          console.log(`📖 [Read] Camps: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading camps:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadCamps();

    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  return { camps, loading, refresh };
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
