import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { ScanLine } from "lucide-react-native";
import { useAttendance } from "@/lib/AttendanceContext";
import { colors, radius, spacing, typography } from "@/lib/theme";

export default function Gate() {
  const { record, loading } = useAttendance();

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={styles.iconWrap}>
          <ScanLine color={colors.primary} size={28} strokeWidth={2.2} />
        </View>
        <Text style={styles.title}>Asistencia QR</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return <Redirect href={record ? "/confirmacion" : "/scanner"} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
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
  },
});
