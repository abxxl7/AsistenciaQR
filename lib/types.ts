export type AttendanceRecord = {
  name: string;
  cedula: string;
  timestamp: string; // ISO 8601
  sessionId: string; // valor codificado en el QR de la profesora
};

export type ScanOutcome = { kind: "valid"; sessionId: string } | { kind: "invalid" };
