export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ChecklistCategory {
  categoryId: string;
  categoryName: string;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistCategory[] = [
  {
    categoryId: "room_interior",
    categoryName: "ภายในห้องพัก",
    items: [
      { id: "room_floor",      label: "พื้นห้องกวาด/ถูสะอาด ไม่มีขยะตกค้าง" },
      { id: "room_belongings", label: "พับเก็บที่นอนและสิ่งของส่วนตัวเป็นระเบียบ" },
      { id: "room_odor_trash", label: "ไม่มีขยะเศษอาหารทิ้งค้างในห้อง" },
      { id: "room_electrical", label: "ไม่มีการต่อสายไฟอันตราย/ประกอบอาหารในห้อง" },
    ],
  },
  {
    categoryId: "balcony_front",
    categoryName: "บริเวณหน้าห้องและระเบียง",
    items: [
      { id: "front_shoes",   label: "จัดวางรองเท้าหน้าห้องเป็นระเบียบ" },
      { id: "front_clothes", label: "ตากเสื้อผ้าในจุดที่กำหนด ไม่เกะกะทางเดิน" },
      { id: "balcony_water", label: "ไม่มีน้ำขังบริเวณระเบียง (ป้องกันยุงลาย)" },
    ],
  },
  {
    categoryId: "bathroom_washing",
    categoryName: "ห้องน้ำและพื้นที่ซักล้าง",
    items: [
      { id: "bath_toilet",      label: "โถส้วมและอ่างล้างหน้าสะอาด" },
      { id: "bath_floor_drain", label: "พื้นห้องน้ำไม่มีตะไคร่น้ำ ท่อระบายน้ำไม่อุดตัน" },
      { id: "washing_area",     label: "บริเวณซักล้างสะอาด ไม่มีเศษอาหารตกค้าง" },
    ],
  },
  {
    categoryId: "common_waste",
    categoryName: "พื้นที่ส่วนกลางและการจัดการขยะ",
    items: [
      { id: "common_walkway", label: "ทางเดินส่วนกลางโล่ง ไม่มีสิ่งของวางกีดขวาง" },
      { id: "common_trash",   label: "ทิ้งขยะลงถังเรียบร้อย ถังขยะส่วนกลางไม่ล้น" },
    ],
  },
];

export type ItemStatus = "pass" | "fail" | "na" | null;

export interface ItemState {
  status: ItemStatus;
  note: string;
  photoFile: File | null;
  photoPreview: string | null;
}

export function buildInitialState(): Record<string, ItemState> {
  const state: Record<string, ItemState> = {};
  for (const cat of CHECKLIST) {
    for (const item of cat.items) {
      state[item.id] = { status: null, note: "", photoFile: null, photoPreview: null };
    }
  }
  return state;
}

export function getAllItems(): ChecklistItem[] {
  return CHECKLIST.flatMap((c) => c.items);
}

export function getCategoryForItem(itemId: string): string {
  return CHECKLIST.find((c) => c.items.some((i) => i.id === itemId))?.categoryId ?? "";
}
