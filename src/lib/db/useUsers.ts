import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/auth";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, ROOT, ROOT_DOC, "users"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const userList = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
        setUsers(userList);
        setPendingCount(userList.filter((u) => u.status === "pending").length);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, []);

  return { users, loading, pendingCount };
}
