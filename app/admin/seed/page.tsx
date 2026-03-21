"use client";

import { useState } from "react";
import { seedFirestore } from "@/lib/seed-firestore";
import { HardDrive, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSeed() {
    setStatus("loading");
    setError("");
    try {
      await seedFirestore();
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
        <HardDrive className="h-8 w-8 text-blue-600" />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">Firestore Seeder</h1>
        <p className="mt-1 text-sm text-gray-500">
          เขียน Mock Data เข้า Firestore ภายใต้{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">
            cmg-camp-manager / root / *
          </code>
        </p>
        <p className="mt-1 text-xs text-amber-600">
          ⚠️ การรันซ้ำจะ overwrite ข้อมูลเดิมทั้งหมดในแต่ละ collection
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-500 shadow-sm">
        <p className="font-semibold text-gray-700 mb-2">Collections ที่จะถูก seed:</p>
        {["zones (3)", "rooms (30)", "workers (8)", "visitors (5)", "dashboard (3 camps)"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {item}
          </div>
        ))}
      </div>

      {status === "done" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          Seed สำเร็จ! ตรวจสอบใน Firebase Console
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleSeed}
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
      >
        {status === "loading" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> กำลัง Seed...</>
        ) : (
          <><HardDrive className="h-4 w-4" /> {status === "done" ? "Seed อีกครั้ง" : "เริ่ม Seed Firestore"}</>
        )}
      </button>
    </div>
  );
}
