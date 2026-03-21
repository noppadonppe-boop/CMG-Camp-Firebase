import { useState } from "react";
import { ChevronDown, Building2, Check } from "lucide-react";
import { useCamp } from "@/context/CampContext";

export default function Navbar() {
  const { selectedCamp, setSelectedCamp, camps } = useCamp();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <span className="text-sm font-semibold text-gray-700">CMG Camp Manager</span>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <Building2 className="h-4 w-4 text-blue-500" />
          {selectedCamp?.name ?? "เลือกแคมป์"}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              {camps.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">ไม่มีข้อมูลแคมป์</p>
              ) : (
                camps.map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => { setSelectedCamp(camp); setOpen(false); }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    {camp.name}
                    {selectedCamp?.id === camp.id && <Check className="h-4 w-4 text-blue-500" />}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
