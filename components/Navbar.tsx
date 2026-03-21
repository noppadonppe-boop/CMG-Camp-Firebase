"use client";

import { useState } from "react";
import { ChevronDown, Tent } from "lucide-react";
import { CAMPS, useCamp } from "@/context/CampContext";

export default function Navbar() {
  const { selectedCamp, setSelectedCamp } = useCamp();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Tent className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-gray-800 tracking-tight">
          CMG Camp Manager
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="h-2 w-2 rounded-full bg-green-400" />
          {selectedCamp.name}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <ul className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {CAMPS.map((camp) => (
              <li key={camp.id}>
                <button
                  onClick={() => {
                    setSelectedCamp(camp);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-blue-50 hover:text-blue-700 ${
                    selectedCamp.id === camp.id
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {selectedCamp.id === camp.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                  {camp.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
