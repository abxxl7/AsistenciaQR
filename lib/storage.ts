import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AttendanceRecord } from "./types";

const STORAGE_KEY = "asistencia-qr:records:v1";

export async function getRecords(): Promise<AttendanceRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecords(records: AttendanceRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function addRecord(record: AttendanceRecord): Promise<AttendanceRecord[]> {
  const current = await getRecords();
  const next = [...current, record];
  await saveRecords(next);
  return next;
}

export async function clearRecords(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
