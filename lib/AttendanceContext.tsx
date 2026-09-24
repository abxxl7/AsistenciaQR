import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as storage from "./storage";
import type { AttendanceRecord } from "./types";

type ConfirmInput = {
  name: string;
  cedula: string;
  sessionId: string;
  timestamp?: string;
};

type AttendanceContextValue = {
  record: AttendanceRecord | null;
  loading: boolean;
  confirmAttendance: (input: ConfirmInput) => Promise<AttendanceRecord>;
  resetForDemo: () => Promise<void>;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getRecord().then((r) => {
      setRecord(r);
      setLoading(false);
    });
  }, []);

  const confirmAttendance = useCallback(async (input: ConfirmInput) => {
    const newRecord: AttendanceRecord = {
      name: input.name.trim(),
      cedula: input.cedula.trim(),
      sessionId: input.sessionId,
      timestamp: input.timestamp ?? new Date().toISOString(),
    };
    await storage.saveRecord(newRecord);
    setRecord(newRecord);
    return newRecord;
  }, []);

  const resetForDemo = useCallback(async () => {
    await storage.clearRecord();
    setRecord(null);
  }, []);

  const value = useMemo(
    () => ({ record, loading, confirmAttendance, resetForDemo }),
    [record, loading, confirmAttendance, resetForDemo]
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance(): AttendanceContextValue {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance debe usarse dentro de AttendanceProvider");
  return ctx;
}
