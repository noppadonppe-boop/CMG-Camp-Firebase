import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MasterHrEmployee } from "@/lib/master-hr-database";

const ROOT = "cmg-camp-manager";
const ROOT_DOC = "root";
const HR_DATABASE_COLLECTION = "hr_database";
const FIRESTORE_BATCH_LIMIT = 500;

export function useHrDatabase() {
  const [employees, setEmployees] = useState<MasterHrEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, ROOT, ROOT_DOC, HR_DATABASE_COLLECTION),
      (snapshot) => {
        const records = snapshot.docs
          .map((employeeDoc) => ({
            ...employeeDoc.data(),
            id: employeeDoc.id,
          } as MasterHrEmployee))
          .sort((a, b) => (a.staffId || "").localeCompare(b.staffId || "", "th", { numeric: true }));

        setEmployees(records);
        setLoading(false);
      },
      (error) => {
        console.error("Unable to load the synced HR database:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { employees, loading };
}

export async function saveHrEmployeesToSystem(employees: MasterHrEmployee[]): Promise<void> {
  for (let offset = 0; offset < employees.length; offset += FIRESTORE_BATCH_LIMIT) {
    const batch = writeBatch(db);
    const chunk = employees.slice(offset, offset + FIRESTORE_BATCH_LIMIT);

    for (const employee of chunk) {
      if (!employee.id.trim()) {
        throw new Error("พบข้อมูลพนักงานที่ไม่มี id จึงไม่สามารถสร้าง Document ID ได้");
      }
      if (employee.id.includes("/")) {
        throw new Error(`Document ID ไม่สามารถมีเครื่องหมาย / ได้: ${employee.id}`);
      }

      const employeeRef = doc(db, ROOT, ROOT_DOC, HR_DATABASE_COLLECTION, employee.id);

      // Upsert by Master employee id. Existing documents are updated, not duplicated.
      batch.set(employeeRef, {
        ...employee,
        syncedAt: serverTimestamp(),
        source: "cmg-hr-database",
      }, { merge: true });
    }

    await batch.commit();
  }
}
