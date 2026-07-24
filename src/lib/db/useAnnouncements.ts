import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Announcement } from "@/types/announcement";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Announcement[];
        setAnnouncements(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching announcements:", err);
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const addAnnouncement = async (
    data: Omit<Announcement, "id" | "createdAt" | "acknowledgedBy">
  ) => {
    try {
      const colRef = collection(db, ROOT, ROOT_DOC, "announcements");
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        acknowledgedBy: [],
      });
      return docRef.id;
    } catch (err) {
      console.error("Error adding announcement:", err);
      throw err;
    }
  };

  const updateAnnouncement = async (
    id: string,
    data: Partial<Omit<Announcement, "id" | "createdAt" | "acknowledgedBy">>
  ) => {
    try {
      const docRef = doc(db, ROOT, ROOT_DOC, "announcements", id);
      await updateDoc(docRef, data);
    } catch (err) {
      console.error("Error updating announcement:", err);
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const docRef = doc(db, ROOT, ROOT_DOC, "announcements", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting announcement:", err);
      throw err;
    }
  };

  const acknowledgeAnnouncement = async (id: string, uid: string) => {
    try {
      const docRef = doc(db, ROOT, ROOT_DOC, "announcements", id);
      await updateDoc(docRef, {
        acknowledgedBy: arrayUnion(uid)
      });
    } catch (err) {
      console.error("Error acknowledging announcement:", err);
      throw err;
    }
  };

  return {
    announcements,
    loading,
    error,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    acknowledgeAnnouncement
  };
}
