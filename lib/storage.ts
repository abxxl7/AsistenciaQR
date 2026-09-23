import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AttendanceRecord } from "./types";

// Que esta clave exista o no ES el flag de "ya registrado" en este dispositivo.
const STORAGE_KEY = "attendance_record";

export async function getRecord(): Promise<AttendanceRecord | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AttendanceRecord;
  } catch {
    return null;
  }
}

export async function saveRecord(record: AttendanceRecord): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export async function clearRecord(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
