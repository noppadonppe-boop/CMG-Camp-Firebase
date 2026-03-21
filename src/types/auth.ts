import { Timestamp } from "firebase/firestore";

export const USER_ROLES = [
  "MasterAdmin",   // Master Admin - ผู้ดูแลระบบสูงสุด - จัดการได้ทุกอย่าง
  "MD",            // Managing Director - กรรมการผู้จัดการ - อำนาจสูงสุด
  "GM",            // General Manager - ผู้จัดการทั่วไป - บริหารระดับสูง
  "HrManager",     // HR Manager - ผู้จัดการฝ่ายทรัพยากรบุคคล - ดูแลพนักงาน
  "CampBoss",      // เจ้าของ/ผู้จัดการแคมป์ - ควบคุมทุกอย่าง
  "Manager",       // ผู้ช่วยผู้จัดการ - จัดการข้อมูลและระบบ
  "Accountant",    // เจ้าหน้าที่การเงิน - จัดการบิล มิเตอร์ ค่าปรับ
  "Inspector",     // เจ้าหน้าที่ตรวจสุขอนามัย - ตรวจห้องพัก
  "Security",      // รปภ. - ลงทะเบียนผู้เยี่ยม ตรวจตรา
  "Staff",         // พนักงานทั่วไป - ดูข้อมูล ลงทะเบียนคนงาน
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
