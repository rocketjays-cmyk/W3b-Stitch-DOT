"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type DidContextValue = {
  did: string | null;
  setDid: (did: string | null) => void;
};

const DidContext = createContext<DidContextValue | undefined>(undefined);

export function DidProvider({ children }: { children: ReactNode }) {
  const [did, setDid] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("did");
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (did) {
      sessionStorage.setItem("did", did);
    } else {
      sessionStorage.removeItem("did");
    }
  }, [did]);

  return (
    <DidContext.Provider value={{ did, setDid }}>
      {children}
    </DidContext.Provider>
  );
}

export function useDid() {
  const ctx = useContext(DidContext);
  if (!ctx) throw new Error("useDid must be used within DidProvider");
  return ctx;
}
