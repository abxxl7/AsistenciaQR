import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { RotateCcw, Share2 } from "lucide-react-native";

import { AttendanceRow } from "@/components/AttendanceRow";
import { EmptyState } from "@/components/EmptyState";
import { useAttendance } from "@/lib/AttendanceContext";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { AttendanceRecord } from "@/lib/types";

function buildCsv(records: AttendanceRecord[]): string {
  const header = "id,nombre,hora\n";
  const rows = records
    .map((r) => {
      const time = new Date(r.timestamp).toLocaleString("es-ES");
      return `${r.studentId},"${r.name.replace(/"/g, '""')}",${time}`;
    })
    .join("\n");
  return `﻿${header}${rows}`;
}

export default function ListaScreen() {
  const insets = useSafeAreaInsets();
  const { records, reset } = useAttendance();
  const [exporting, setExporting] = useState(false);

  const ordered = useMemo(() => {
    const withOrder = [...records]
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((r, i) => ({ record: r, order: i + 1 }));
    return withOrder.reverse();
  }, [records]);

  const handleExport = useCallback(async () => {
    if (records.length === 0 || exporting) return;
    setExporting(true);
    try {
      const csv = buildCsv([...records].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));

      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      const file = new File(Paths.cache, `asistencia-${stamp}.csv`);
      if (file.exists) file.delete();
      file.create();
      file.write(csv);

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("No se puede compartir", "Este dispositivo no admite compartir archivos.");
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar registro de asistencia",
        UTI: "public.comma-separated-values-text",
      });
    } catch {
      Alert.alert("No se pudo exportar", "Ocurrió un error al generar el archivo. Intentá de nuevo.");
    } finally {
      setExporting(false);
    }
  }, [records, exporting]);

  const handleReset = useCallback(() => {
    if (records.length === 0) return;
    Alert.alert(
      "Reiniciar registro",
      "Se van a borrar todas las asistencias registradas en este dispositivo. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar todo", style: "destructive", onPress: () => reset() },
      ]
    );
  }, [records.length, reset]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.title}>Asistencia registrada</Text>
          <Text style={styles.subtitle}>
            {records.length === 0
              ? "Sin registros todavía"
              : `${records.length} ${records.length === 1 ? "estudiante" : "estudiantes"}`}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, records.length === 0 && styles.actionButtonDisabled]}
            onPress={handleReset}
            disabled={records.length === 0}
          >
            <RotateCcw color={records.length === 0 ? colors.inkFaint : colors.danger} size={18} strokeWidth={2.3} />
          </Pressable>
          <Pressable
            style={[styles.exportButton, records.length === 0 && styles.actionButtonDisabled]}
            onPress={handleExport}
            disabled={records.length === 0 || exporting}
          >
            <Share2 color={colors.white} size={16} strokeWidth={2.3} />
            <Text style={styles.exportText}>{exporting ? "Exportando…" : "Exportar"}</Text>
          </Pressable>
        </View>
      </View>

      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={ordered}
          keyExtractor={(item) => item.record.studentId}
          renderItem={({ item }) => <AttendanceRow record={item.record} order={item.order} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.screenTitle,
    color: colors.ink,
  },
  subtitle: {
    ...typography.caption,
    color: colors.inkMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.md,
  },
  exportText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "700",
  },
});
