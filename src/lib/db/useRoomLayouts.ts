import { useEffect, useState } from "react";
import {
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type RoomBlockLayout = "grid" | "rows" | "columns" | "compact";

export interface RoomLayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_ROOM_LAYOUT_SHAPE_COLOR = "#94a3b8";

export interface RoomLayoutShape extends RoomLayoutPosition {
  id: string;
  name: string;
  rotation: number;
  color: string;
}

export interface RoomLayoutBlock {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  layout: RoomBlockLayout;
  roomIds: string[];
  roomPositions?: Record<string, RoomLayoutPosition>;
  shapes?: RoomLayoutShape[];
}

export interface RoomLayoutDocument {
  id: string;
  scopeKey: string;
  blocks: RoomLayoutBlock[];
  planImageUrl?: string;
  planImagePath?: string;
  updatedAt?: Timestamp;
}

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";

function documentId(scopeKey: string) {
  return encodeURIComponent(scopeKey).replace(/%/g, "_");
}

function normaliseBlock(value: unknown): RoomLayoutBlock | null {
  if (!value || typeof value !== "object") return null;
  const block = value as Partial<RoomLayoutBlock>;
  if (!block.id || !block.name) return null;

  return {
    id: String(block.id),
    name: String(block.name),
    x: Number.isFinite(block.x) ? Number(block.x) : 40,
    y: Number.isFinite(block.y) ? Number(block.y) : 40,
    width: Number.isFinite(block.width) ? Number(block.width) : 360,
    height: Number.isFinite(block.height) ? Number(block.height) : 260,
    rotation: Number.isFinite(block.rotation) ? Number(block.rotation) : 0,
    layout: block.layout === "rows" || block.layout === "columns" || block.layout === "compact" ? block.layout : "grid",
    roomIds: Array.isArray(block.roomIds) ? block.roomIds.map(String) : [],
    roomPositions: block.roomPositions && typeof block.roomPositions === "object" ? Object.fromEntries(
      Object.entries(block.roomPositions as Record<string, unknown>).flatMap(([roomId, value]) => {
        if (!value || typeof value !== "object") return [];
        const position = value as Partial<RoomLayoutPosition>;
        if (![position.x, position.y, position.width, position.height].every(Number.isFinite)) return [];
        return [[roomId, { x: Number(position.x), y: Number(position.y), width: Number(position.width), height: Number(position.height) }]];
      }),
    ) : {},
    shapes: Array.isArray(block.shapes) ? block.shapes.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const shape = value as Partial<RoomLayoutShape>;
      if (!shape.id || !shape.name) return [];
      return [{
        id: String(shape.id),
        name: String(shape.name),
        x: Number.isFinite(shape.x) ? Number(shape.x) : 16,
        y: Number.isFinite(shape.y) ? Number(shape.y) : 16,
        width: Number.isFinite(shape.width) ? Number(shape.width) : 160,
        height: Number.isFinite(shape.height) ? Number(shape.height) : 64,
        rotation: Number.isFinite(shape.rotation) ? Number(shape.rotation) : 0,
        color: typeof shape.color === "string" && /^#[0-9a-f]{6}$/i.test(shape.color) ? shape.color : DEFAULT_ROOM_LAYOUT_SHAPE_COLOR,
      }];
    }) : [],
  };
}

export function useRoomLayout(scopeKey: string) {
  const [layout, setLayout] = useState<RoomLayoutDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setLayout(null);
    const layoutRef = doc(db, ROOT, ROOT_DOC, "roomLayouts", documentId(scopeKey));
    return onSnapshot(
      layoutRef,
      (snapshot) => {
        const data = snapshot.data();
        setLayout(data ? {
          id: snapshot.id,
          scopeKey: String(data.scopeKey ?? scopeKey),
          blocks: Array.isArray(data.blocks) ? data.blocks.map(normaliseBlock).filter((block): block is RoomLayoutBlock => Boolean(block)) : [],
          planImageUrl: typeof data.planImageUrl === "string" ? data.planImageUrl : "",
          planImagePath: typeof data.planImagePath === "string" ? data.planImagePath : "",
          updatedAt: data.updatedAt,
        } : null);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading room layout:", error);
        setLayout(null);
        setLoading(false);
      },
    );
  }, [scopeKey]);

  return { layout, loading };
}

export async function saveRoomLayout(scopeKey: string, blocks: RoomLayoutBlock[]) {
  await setDoc(
    doc(db, ROOT, ROOT_DOC, "roomLayouts", documentId(scopeKey)),
    { scopeKey, blocks, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

const PLAN_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export function campPlanScopeKey(campId: string) {
  return `plan:${campId}`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name);
}

export async function preparePlanImage(file: File): Promise<Blob> {
  if (!isImageFile(file)) throw new Error("กรุณาเลือกไฟล์รูปภาพ JPG หรือ PNG");
  try {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 2000;
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("แปลงรูปไม่สำเร็จ");
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) throw new Error("แปลงรูปไม่สำเร็จ");
    if (blob.size > PLAN_IMAGE_MAX_BYTES) throw new Error("รูปยังใหญ่เกิน 10 MB หลังลดขนาด ลองใช้รูปที่เล็กลง");
    return blob;
  } catch (error) {
    if (error instanceof Error && error.message.includes("10 MB")) throw error;
    throw new Error("เปิดไฟล์นี้ไม่ได้ ลองบันทึกเป็น JPG แล้วแนบใหม่");
  }
}

function storageErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
  const message = error instanceof Error ? error.message : "";
  if (code.includes("unauthorized") || message.includes("unauthorized") || message.includes("permission")) {
    return "อัปโหลดรูปไม่สำเร็จ เพราะที่เก็บไฟล์ยังไม่ให้สิทธิ์ ลองรีเฟรชหน้าแล้วแนบใหม่อีกครั้ง";
  }
  return message || "อัปโหลดรูปผังไม่สำเร็จ";
}

export async function uploadCampPlanImage(campId: string, file: Blob, previousPath?: string) {
  const scopeKey = campPlanScopeKey(campId);
  const path = `room-plans/${documentId(scopeKey)}/${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  try {
    await uploadBytes(storageRef, file, { contentType: "image/jpeg" });
    const url = await getDownloadURL(storageRef);
    await setDoc(
      doc(db, ROOT, ROOT_DOC, "roomLayouts", documentId(scopeKey)),
      { scopeKey, planImageUrl: url, planImagePath: path, updatedAt: serverTimestamp() },
      { merge: true },
    );
    if (previousPath && previousPath !== path) {
      try { await deleteObject(ref(storage, previousPath)); } catch { /* ไฟล์เดิมอาจถูกลบไปแล้ว */ }
    }
    return { url, path };
  } catch (error) {
    throw new Error(storageErrorMessage(error));
  }
}

export async function removeCampPlanImage(campId: string, path?: string) {
  if (path) {
    try { await deleteObject(ref(storage, path)); } catch { /* ไฟล์เดิมอาจถูกลบไปแล้ว */ }
  }
  const scopeKey = campPlanScopeKey(campId);
  await setDoc(
    doc(db, ROOT, ROOT_DOC, "roomLayouts", documentId(scopeKey)),
    { scopeKey, planImageUrl: deleteField(), planImagePath: deleteField(), updatedAt: serverTimestamp() },
    { merge: true },
  );
}
