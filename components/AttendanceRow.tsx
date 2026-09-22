import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { AttendanceRecord } from "@/lib/types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function AttendanceRow({ record, order }: { record: AttendanceRecord; order: number }) {
  const time = new Date(record.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(record.name)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {record.name}
        </Text>
        <Text style={styles.id}>{record.studentId}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.order}>#{order}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.ink,
  },
  id: {
    ...typography.caption,
    color: colors.inkFaint,
    marginTop: 1,
  },
  right: {
    alignItems: "flex-end",
  },
  time: {
    ...typography.bodyMedium,
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
  order: {
    ...typography.tiny,
    color: colors.inkFaint,
    marginTop: 2,
  },
});
