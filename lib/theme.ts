// Paleta pensada para el dominio: control de asistencia en aula, en papel digital.
// Fondo cálido tipo "hoja de asistencia", acento académico (azul tinta) y
// colores semánticos claros para feedback instantáneo al escanear.
export const colors = {
  ink: "#14171F",
  inkMuted: "#5B6472",
  inkFaint: "#9096A2",

  paper: "#F6F4EF",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEBE1",
  border: "#E3DFD3",

  primary: "#1F3A5F",
  primaryDark: "#132A47",
  primarySoft: "#E3E9F1",

  success: "#1E8F6F",
  successSoft: "#E1F3EC",

  warning: "#C97A20",
  warningSoft: "#FBEEDD",

  danger: "#C1432E",
  dangerSoft: "#FAE7E2",

  white: "#FFFFFF",
  overlay: "rgba(15, 18, 26, 0.55)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  screenTitle: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.4 },
  title: { fontSize: 21, fontWeight: "700" as const, letterSpacing: -0.2 },
  subtitle: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  bodyMedium: { fontSize: 15, fontWeight: "600" as const },
  caption: { fontSize: 13, fontWeight: "500" as const },
  tiny: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.3 },
};
