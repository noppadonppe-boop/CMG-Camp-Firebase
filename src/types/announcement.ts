import { Timestamp } from "firebase/firestore";
import type { UserRole } from "./auth";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRoles: UserRole[]; // If empty, everyone sees it
  status: "draft" | "published";
  createdAt: Timestamp;
  acknowledgedBy: string[]; // array of UIDs
}
