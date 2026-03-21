"use client";

import { createContext, useContext, useState } from "react";

export const CAMPS = [
  { id: "main", name: "Main Camp" },
  { id: "rayong", name: "Rayong Camp" },
  { id: "chonburi", name: "Chonburi Camp" },
];

export type Camp = (typeof CAMPS)[number];

interface CampContextValue {
  selectedCamp: Camp;
  setSelectedCamp: (camp: Camp) => void;
}

const CampContext = createContext<CampContextValue | null>(null);

export function CampProvider({ children }: { children: React.ReactNode }) {
  const [selectedCamp, setSelectedCamp] = useState<Camp>(CAMPS[0]);
  return (
    <CampContext.Provider value={{ selectedCamp, setSelectedCamp }}>
      {children}
    </CampContext.Provider>
  );
}

export function useCamp() {
  const ctx = useContext(CampContext);
  if (!ctx) throw new Error("useCamp must be used within CampProvider");
  return ctx;
}
