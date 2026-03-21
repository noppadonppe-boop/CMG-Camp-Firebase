import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

export function useDashboard(_campId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let workers: { roomId: string }[] = [];
    let rooms: { status: string }[] = [];
    let workersReady = false;
    let roomsReady = false;

    function derive() {
      if (!workersReady || !roomsReady) return;
      const totalWorkers = workers.length;
      const roomsOccupied = rooms.filter((r) => r.status !== "empty" && r.status !== "maintenance").length;
      const roomsTotal = rooms.length;
      const alerts = rooms.filter((r) => r.status === "maintenance").length;
      setData({
        campName: "",
        stats: { totalWorkers, present: totalWorkers, roomsOccupied, roomsTotal, alerts },
        logs: [],
        chartData: [],
      });
      setLoading(false);
    }

    const unsubWorkers = onSnapshot(
      query(collection(db, ROOT, ROOT_DOC, "workers")),
      (snap) => { workers = snap.docs.map((d) => d.data() as { roomId: string }); workersReady = true; derive(); },
      () => { workersReady = true; derive(); }
    );

    const unsubRooms = onSnapshot(
      query(collection(db, ROOT, ROOT_DOC, "rooms")),
      (snap) => { rooms = snap.docs.map((d) => d.data() as { status: string }); roomsReady = true; derive(); },
      () => { roomsReady = true; derive(); }
    );

    return () => { unsubWorkers(); unsubRooms(); };
  }, [_campId]);

  return { data, loading };
}
