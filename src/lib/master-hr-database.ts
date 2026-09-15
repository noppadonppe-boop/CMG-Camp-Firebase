import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInAnonymously,
} from "firebase/auth";
import { collection, getDocs, getFirestore, type DocumentData } from "firebase/firestore";

const MASTER_APP_NAME = "cmg-hr-database-read-only";

const masterFirebaseConfig = {
  apiKey: "AIzaSyB4nIgikGx6xMsSWOMfJsKWta1bfPmVTcc",
  authDomain: "cmg-hr-database.firebaseapp.com",
  projectId: "cmg-hr-database",
  storageBucket: "cmg-hr-database.firebasestorage.app",
  messagingSenderId: "625046761441",
  appId: "1:625046761441:web:22493e0b56a984cf5daca0",
  measurementId: "G-Z8DWB4YM0S",
};

const masterApp = getApps().some((app) => app.name === MASTER_APP_NAME)
  ? getApp(MASTER_APP_NAME)
  : initializeApp(masterFirebaseConfig, MASTER_APP_NAME);
const masterAuth = getAuth(masterApp);
const masterDb = getFirestore(masterApp);
const masterAuthReady = setPersistence(masterAuth, inMemoryPersistence);

export interface MasterHrEmployee {
  id: string;
  assignedSite: string;
  employeeType: string;
  title: string;
  firstName: string;
  otherName: string;
  lastName: string;
  jobRole: string;
  staffId: string;
  startDate: string;
  employeeStatus: string;
  nationality: string;
  idNumber: string;
  taxId: string;
  department: string;
  phone: string;
  sex: string;
}

function firstValue(data: DocumentData, fields: string[]): unknown {
  for (const field of fields) {
    const value = data[field];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function asText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(", ");
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toLocaleDateString("th-TH");
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString("th-TH");
  }
  return String(value);
}

function mapEmployee(documentId: string, data: DocumentData): MasterHrEmployee {
  return {
    id: asText(firstValue(data, ["id"])) || documentId,
    assignedSite: asText(firstValue(data, ["สถานะโครงการ", "assigned_site", "assignedSite"])),
    employeeType: asText(firstValue(data, ["employee_type", "employeeType"])),
    title: asText(firstValue(data, ["ชื่อตัว", "คำนำหน้า", "title"])),
    firstName: asText(firstValue(data, ["ชื่อต้น", "ชื่อ", "firstName", "name"])),
    otherName: asText(firstValue(data, ["ชื่อภาษาอื่น", "otherName"])),
    lastName: asText(firstValue(data, ["ชื่อสกุล", "นามสกุล", "lastName"])),
    jobRole: asText(firstValue(data, ["ตำแหน่ง", "jobRole", "position"])),
    staffId: asText(firstValue(data, ["รหัสพนักงาน", "staffId", "employeeId"])),
    startDate: asText(firstValue(data, ["วันเริ่มงาน", "startDate"])),
    employeeStatus: asText(firstValue(data, ["สถานะพนักงาน", "employeeStatus", "status"])),
    nationality: asText(firstValue(data, ["สัญชาติ", "nationality"])),
    idNumber: asText(firstValue(data, ["เลขบัตรประชาชน", "idNumber", "nationalId"])),
    taxId: asText(firstValue(data, ["เลขผู้เสียภาษี", "taxId"])),
    department: asText(firstValue(data, ["แผนก", "department"])),
    phone: asText(firstValue(data, ["โทรศัพท์", "phone", "phoneNumber"])),
    sex: asText(firstValue(data, ["เพศ", "sex", "gender"])),
  };
}

/**
 * Read-only boundary for the Master HR project.
 * This module intentionally imports only Firestore read operations and does not
 * export the Master Firestore/Auth instances, so UI code cannot write through it.
 */
export async function fetchMasterHrEmployees(): Promise<MasterHrEmployee[]> {
  await masterAuthReady;

  // Authenticate anonymously for every manual Sync Database request.
  await signInAnonymously(masterAuth);

  const snapshot = await getDocs(
    collection(masterDb, "CMG-HR-Database", "root", "employee_data"),
  );

  return snapshot.docs
    .map((employeeDoc) => mapEmployee(employeeDoc.id, employeeDoc.data()))
    .sort((a, b) => a.staffId.localeCompare(b.staffId, "th", { numeric: true }));
}
