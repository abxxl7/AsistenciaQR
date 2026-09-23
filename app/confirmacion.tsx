import React, { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarClock, CheckCircle2, IdCard, RotateCcw, User } from "lucide-react-native";

import { useAttendance } from "@/lib/AttendanceContext";
import { colors, radius, spacing, typography } from "@/lib/theme";

export default function ConfirmacionScreen() {
  const insets = useSafeAreaInsets();
  const { record, resetForDemo } = useAttendance();

  // Si por algún motivo se llega acá sin registro, no hay nada que confirmar.
  useFocusEffect(
    useCallback(() => {
      if (!record) {
        router.replace("/scanner");
      }
    }, [record])
  );

  const handleResetDemo = useCallback(() => {
    Alert.alert(
      "Reiniciar demo",
      "Esto borra tu registro de asistencia de este celular y te vuelve a dejar escanear. Es solo para hacer pruebas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar mi registro",
          style: "destructive",
          onPress: async () => {
            await resetForDemo();
            router.replace("/scanner");
          },
        },
      ]
    );
  }, [resetForDemo]);

  if (!record) {
    return <View style={styles.root} />;
  }

  const formattedTime = new Date(record.timestamp).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={styles.content}>
        <View style={styles.successIconWrap}>
          <CheckCircle2 color={colors.success} size={40} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Asistencia registrada</Text>
        <Text style={styles.subtitle}>Ya podés cerrar la app. Tu registro va a seguir guardado.</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <User color={colors.inkFaint} size={18} strokeWidth={2.2} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Nombre</Text>
              <Text style={styles.rowValue}>{record.name}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <IdCard color={colors.inkFaint} size={18} strokeWidth={2.2} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Cédula</Text>
              <Text style={styles.rowValue}>{record.cedula}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <CalendarClock color={colors.inkFaint} size={18} strokeWidth={2.2} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Hora de registro</Text>
              <Text style={styles.rowValue}>{formattedTime}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.demoLabel}>Modo demo</Text>
        <Pressable style={styles.resetButton} onPress={handleResetDemo}>
          <RotateCcw color={colors.inkMuted} size={14} strokeWidth={2.3} />
          <Text style={styles.resetText}>Borrar mi registro y volver a escanear</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: "center",
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.inkFaint,
  },
  rowValue: {
    ...typography.bodyMedium,
    color: colors.ink,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    alignItems: "center",
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  demoLabel: {
    ...typography.tiny,
    color: colors.inkFaint,
    marginBottom: spacing.sm,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resetText: {
    ...typography.caption,
    color: colors.inkMuted,
    textDecorationLine: "underline",
  },
});
