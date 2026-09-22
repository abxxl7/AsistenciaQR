import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ClipboardList } from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";

export function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <ClipboardList color={colors.primary} size={30} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Todavía no hay asistencias</Text>
      <Text style={styles.subtitle}>
        Andá a la pestaña Escanear y apuntá la cámara al QR del carnet de cada estudiante.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
