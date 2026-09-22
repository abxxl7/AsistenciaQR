import type { Student } from "./types";

// Datos mock para la PoC. En una versión real esto vendría de un backend
// o del sistema académico de la institución.
export const students: Student[] = [
  { id: "est-001", name: "Ana Pérez" },
  { id: "est-002", name: "Diego Ramírez" },
  { id: "est-003", name: "Camila Torres" },
  { id: "est-004", name: "Mateo Fernández" },
  { id: "est-005", name: "Valentina Gómez" },
  { id: "est-006", name: "Santiago López" },
  { id: "est-007", name: "Sofía Martínez" },
  { id: "est-008", name: "Nicolás Rodríguez" },
  { id: "est-009", name: "Julieta Sánchez" },
  { id: "est-010", name: "Tomás Herrera" },
];

export function findStudentById(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}
