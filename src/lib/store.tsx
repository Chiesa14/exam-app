"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initDB } from "./db";

interface DBContextValue {
  ready: boolean;
  error: string | null;
  /** bumps whenever data changes so consumers can re-read stats */
  version: number;
  refresh: () => void;
}

const DBContext = createContext<DBContextValue>({
  ready: false,
  error: null,
  version: 0,
  refresh: () => {},
});

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    initDB()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError(e?.message ?? "Failed to load the database");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => ({ ready, error, version, refresh }), [ready, error, version, refresh]);
  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  return useContext(DBContext);
}
