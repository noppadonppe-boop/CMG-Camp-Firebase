"use client";

import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { rootDoc } from "@/lib/firestore-helpers";

export interface AccessLog {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  time: string;
  direction: "In" | "Out";
  role: string;
}

export interface DashboardData {
  campName: string;
  stats: {
    totalWorkers: number;
    present: number;
    roomsOccupied: number;
    roomsTotal: number;
    alerts: number;
  };
  logs: AccessLog[];
  chartData: { day: string; count: number }[];
}

export function useDashboard(campId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campId) return;
    const ref = rootDoc("dashboard", campId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data() as DashboardData);
      } else {
        setData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [campId]);

  return { data, loading };
}
