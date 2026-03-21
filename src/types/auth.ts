import { Timestamp } from "firebase/firestore";

export const USER_ROLES = [
  "MasterAdmin",
  "SuperAdmin",
  "Admin",
  "Staff",
  "Viewer",
  "Creator",
] as const;

export type UserRole = typeof USER_ROLES[number];

export type UserStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  roles: UserRole[];
  status: UserStatus;
  assignedProjects: string[];
  createdAt: Timestamp;
  photoURL?: string;
  isFirstUser: boolean;
}

export interface AppMetaConfig {
  firstUserRegistered: boolean;
  totalUsers: number;
  createdAt: Timestamp;
}

export interface ActivityLog {
  id?: string;
  uid: string;
  email: string;
  action: "REGISTER" | "LOGIN" | "LOGOUT" | "UPDATE_PROFILE" | "APPROVE_USER" | "REJECT_USER";
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}
