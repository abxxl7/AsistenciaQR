import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as storage from "./storage";
import { findStudentById } from "./students";
import type { AttendanceRecord, ScanFeedback } from "./types";

type AttendanceContextValue = {
  records: AttendanceRecord[];
  loading: boolean;
  registerScan: (code: string) => Promise<ScanFeedback>;
  reset: () => Promise<void>;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getRecords().then((r) => {
      setRecords(r);
      setLoading(false);
    });
  }, []);

  const registerScan = useCallback(
    async (code: string): Promise<ScanFeedback> => {
      const student = findStudentById(code);
      if (!student) {
        return { kind: "not-found", code };
      }

      const existing = records.find((r) => r.studentId === student.id);
      if (existing) {
        const time = new Date(existing.timestamp).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return { kind: "duplicate", name: student.name, time };
      }

      const record: AttendanceRecord = {
        studentId: student.id,
        name: student.name,
        timestamp: new Date().toISOString(),
      };
      const next = await storage.addRecord(record);
      setRecords(next);

      const time = new Date(record.timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { kind: "success", name: student.name, time };
    },
    [records]
  );

  const reset = useCallback(async () => {
    await storage.clearRecords();
    setRecords([]);
  }, []);

  const value = useMemo(
    () => ({ records, loading, registerScan, reset }),
    [records, loading, registerScan, reset]
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance(): AttendanceContextValue {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance debe usarse dentro de AttendanceProvider");
  return ctx;
}
