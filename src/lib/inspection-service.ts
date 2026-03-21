import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebase";
import {
  CHECKLIST,
  getCategoryForItem,
  type ItemState,
} from "./checklist-data";

/* ─── Types ──────────────────────────────────────────────────── */

export interface DetailItem {
  itemId:     string;
  categoryId: string;
  label:      string;
  status:     "pass" | "fail" | "na";
  note:       string;
  photoUrl:   string;
  photoPath:  string;
}

export interface InspectionLogPayload {
  campId:        string;
  roomId:        string;
  roomNumber:    string;
  zone:          string;
  inspectorId:   string;
  inspectorName: string;
  overallStatus: "passed" | "failed" | "warning";
  passCount:     number;
  failCount:     number;
  naCount:       number;
  generalNote:   string;
  penaltyCreated: boolean;
  details:       DetailItem[];
  timestamp:     ReturnType<typeof serverTimestamp>;
}

/* ─── Upload a single photo to Firebase Storage ──────────────── */

async function uploadPhoto(
  logId: string,
  itemId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `inspections/${logId}/${itemId}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

/* ─── Build overall status from fail count ───────────────────── */

export function deriveOverallStatus(
  failCount: number
): "passed" | "failed" | "warning" {
  if (failCount >= 2) return "failed";
  if (failCount === 1) return "warning";
  return "passed";
}

/* ─── Main submit function ───────────────────────────────────── */

export interface SubmitInspectionParams {
  campId:        string;
  roomId:        string;
  roomNumber:    string;
  zone:          string;
  inspectorId:   string;
  inspectorName: string;
  generalNote:   string;
  itemStates:    Record<string, ItemState>;
}

export async function submitInspection(
  params: SubmitInspectionParams
): Promise<string> {
  const {
    campId, roomId, roomNumber, zone,
    inspectorId, inspectorName,
    generalNote, itemStates,
  } = params;

  const tempLogId = `${roomId}_${Date.now()}`;

  const allItems = CHECKLIST.flatMap((c) => c.items);
  const uploadPromises = allItems
    .filter((item) => {
      const s = itemStates[item.id];
      return s.status === "fail" && s.photoFile !== null;
    })
    .map(async (item) => {
      const state = itemStates[item.id];
      const { url, path } = await uploadPhoto(tempLogId, item.id, state.photoFile!);
      return { itemId: item.id, url, path };
    });

  const uploadResults = await Promise.all(uploadPromises);
  const photoMap = new Map(uploadResults.map((r) => [r.itemId, r]));

  const details: DetailItem[] = allItems.map((item) => {
    const state  = itemStates[item.id];
    const photo  = photoMap.get(item.id);
    return {
      itemId:     item.id,
      categoryId: getCategoryForItem(item.id),
      label:      item.label,
      status:     (state.status ?? "na") as "pass" | "fail" | "na",
      note:       state.note.trim(),
      photoUrl:   photo?.url  ?? "",
      photoPath:  photo?.path ?? "",
    };
  });

  const passCount = details.filter((d) => d.status === "pass").length;
  const failCount = details.filter((d) => d.status === "fail").length;
  const naCount   = details.filter((d) => d.status === "na").length;
  const overallStatus = deriveOverallStatus(failCount);
  const penaltyCreated = overallStatus === "failed";

  const payload: Omit<InspectionLogPayload, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> } = {
    campId,
    roomId,
    roomNumber,
    zone,
    inspectorId,
    inspectorName,
    overallStatus,
    passCount,
    failCount,
    naCount,
    generalNote: generalNote.trim(),
    penaltyCreated,
    details,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "inspection_logs"), payload);

  if (penaltyCreated) {
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await addDoc(collection(db, "billing_penalties"), {
      campId,
      roomId,
      inspectionLogId: docRef.id,
      billingMonth,
      failCount,
      amount: 0,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  }

  return docRef.id;
}

/* ─── Fetch recent inspection logs for a room ────────────────── */

export interface InspectionLogDoc {
  id:            string;
  roomNumber:    string;
  zone:          string;
  inspectorName: string;
  inspectedBy?:  string;
  timestamp:     Timestamp;
  inspectedAt?:  string;
  overallStatus: "passed" | "failed" | "warning";
  passCount:     number;
  failCount:     number;
  naCount:       number;
  generalNote:   string;
  notes?:        string;
  penaltyCreated: boolean;
  details:       DetailItem[];
  failedItems:   (string | { label: string })[];
}

export async function fetchRecentLogs(
  campId: string,
  limitCount = 50
): Promise<InspectionLogDoc[]> {
  const q = query(
    collection(db, "inspection_logs"),
    where("campId", "==", campId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InspectionLogDoc));
}
