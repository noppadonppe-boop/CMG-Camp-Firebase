import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { InspectionLogDoc } from "@/lib/inspection-service";
export type { InspectionLogDoc };

export function useInspectionLogs(campId: string | number = "", limitCount = 50) {
  const [logs, setLogs] = useState<InspectionLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "inspection_logs"),
      where("campId", "==", campId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as InspectionLogDoc)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [campId, limitCount]);

  return { logs, loading };
}
