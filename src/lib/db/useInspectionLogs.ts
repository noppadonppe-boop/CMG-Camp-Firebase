import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { InspectionLogDoc } from "@/lib/inspection-service";
export type { InspectionLogDoc };

export function useInspectionLogs(campId: string | number = "", limitCount = 50) {
  const [logs, setLogs] = useState<InspectionLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadLogs() {
      try {
        const q = query(
          collection(db, "inspection_logs"),
          where("campId", "==", campId),
          orderBy("timestamp", "desc"),
          limit(limitCount)
        );
        const snap = await getDocs(q);
        
        if (!isCancelled) {
          setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as InspectionLogDoc)));
          setLoading(false);
          console.log(`📖 [Read] Inspection logs: ${snap.docs.length} records`);
        }
      } catch (error) {
        console.error('Error loading inspection logs:', error);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isCancelled = true;
    };
  }, [campId, limitCount]);

  return { logs, loading };
}
