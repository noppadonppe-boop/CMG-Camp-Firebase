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
    roomBreakdown: {
      empty: number;
      partial: number;
      full: number;
      maintenance: number;
      storage: number;
    };
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
    if (!_campId) {
      setData(null);
      setLoading(false);
      return;
    }

    let workers: { id: string; roomId: string; zoneId: string }[] = [];
    let rooms: { id: string; status: string; zoneId: string; capacity: number }[] = [];
    let zones: { id: string; campId?: string }[] = [];
    
    let workersReady = false;
    let roomsReady = false;
    let zonesReady = false;

    function derive() {
      if (!workersReady || !roomsReady || !zonesReady) return;

      // Filter zones by campId
      const campZones = zones.filter((z) => z.campId === _campId);
      const campZoneIds = campZones.map((z) => z.id);

      // Filter rooms and workers
      const campRooms = rooms.filter((r) => campZoneIds.includes(r.zoneId));
      const campWorkers = workers.filter((w) => campZoneIds.includes(w.zoneId));

      const totalWorkers = campWorkers.length;

      // Dynamically compute room occupancy and stats
      let roomsOccupied = 0;
      const roomsTotal = campRooms.length;
      let alerts = 0;

      const roomBreakdown = {
        empty: 0,
        partial: 0,
        full: 0,
        maintenance: 0,
        storage: 0,
      };

      campRooms.forEach((room) => {
        const residentsCount = campWorkers.filter((w) => w.roomId === room.id).length;
        
        // Compute status dynamically
        let computedStatus: "empty" | "partial" | "full" | "maintenance" | "storage" = "empty";
        if (room.status === "maintenance") {
          computedStatus = "maintenance";
        } else if (room.status === "storage") {
          computedStatus = "storage";
        } else if (residentsCount === 0) {
          computedStatus = "empty";
        } else if (residentsCount >= room.capacity) {
          computedStatus = "full";
        } else {
          computedStatus = "partial";
        }

        roomBreakdown[computedStatus]++;

        if (computedStatus === "partial" || computedStatus === "full") {
          roomsOccupied++;
        }
        if (computedStatus === "maintenance") {
          alerts++;
        }
      });

      setData({
        campName: "",
        stats: {
          totalWorkers,
          present: totalWorkers,
          roomsOccupied,
          roomsTotal,
          alerts,
          roomBreakdown,
        },
        logs: [],
        chartData: [],
      });
      setLoading(false);
    }

    const unsubWorkers = onSnapshot(
      query(collection(db, ROOT, ROOT_DOC, "workers")),
      (snap) => {
        workers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; roomId: string; zoneId: string }));
        workersReady = true;
        derive();
      },
      () => {
        workersReady = true;
        derive();
      }
    );

    const unsubRooms = onSnapshot(
      query(collection(db, ROOT, ROOT_DOC, "rooms")),
      (snap) => {
        rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; status: string; zoneId: string; capacity: number }));
        roomsReady = true;
        derive();
      },
      () => {
        roomsReady = true;
        derive();
      }
    );

    const unsubZones = onSnapshot(
      query(collection(db, ROOT, ROOT_DOC, "zones")),
      (snap) => {
        zones = snap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; campId?: string }));
        zonesReady = true;
        derive();
      },
      () => {
        zonesReady = true;
        derive();
      }
    );

    return () => {
      unsubWorkers();
      unsubRooms();
      unsubZones();
    };
  }, [_campId]);

  return { data, loading };
}
