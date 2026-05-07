"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { rootCol } from "@/lib/firestore-helpers";

export interface InspectionLogDoc {
  id: string;
  roomId: string;
  roomNumber: string;
  zone: string;
  building: string;
  inspectedBy: string;
  inspectedAt: string;
  overallStatus: "passed" | "failed" | "warning";
  passCount: number;
  failCount: number;
  naCount: number;
  notes: string;
  penaltyCreated: boolean;
  failedItems: { itemId: string; label: string; note: string; photoUrl?: string }[];
}

export function useInspectionLogs(maxResults = 50) {
  const [logs, setLogs] = useState<InspectionLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      rootCol("inspection_logs"),
      orderBy("inspectedAt", "desc"),
      limit(maxResults)
    );
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as InspectionLogDoc)));
      setLoading(false);
    });
    return unsub;
  }, [maxResults]);

  return { logs, loading };
}
