export type Student = {
  id: string;
  name: string;
};

export type AttendanceRecord = {
  studentId: string;
  name: string;
  timestamp: string; // ISO 8601
};

export type ScanFeedback =
  | { kind: "success"; name: string; time: string }
  | { kind: "duplicate"; name: string; time: string }
  | { kind: "not-found"; code: string };
