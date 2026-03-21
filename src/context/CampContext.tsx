import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useCamps, type Camp } from "@/lib/db/useCamps";

export type { Camp };

interface CampContextValue {
  selectedCamp: Camp | null;
  setSelectedCamp: (camp: Camp) => void;
  camps: Camp[];
  loading: boolean;
}

const CampContext = createContext<CampContextValue | null>(null);

export function CampProvider({ children }: { children: ReactNode }) {
  const { camps, loading } = useCamps();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);

  useEffect(() => {
    if (!selectedCamp && camps.length > 0) {
      setSelectedCamp(camps[0]);
    }
  }, [camps, selectedCamp]);

  return (
    <CampContext.Provider value={{ selectedCamp, setSelectedCamp, camps, loading }}>
      {children}
    </CampContext.Provider>
  );
}

export function useCamp(): CampContextValue {
  const ctx = useContext(CampContext);
  if (!ctx) throw new Error("useCamp must be used within CampProvider");
  return ctx;
}
