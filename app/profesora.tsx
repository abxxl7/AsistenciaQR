import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { ArrowLeft, ClipboardList, FileSpreadsheet } from "lucide-react-native";

import { db } from "@/lib/firebase";
import { SESSION_QR_VALUE } from "@/lib/session";
import { colors, radius, spacing, typography } from "@/lib/theme";

type Registro = {
  id: string;
  name: string;
  cedula: string;
  timestamp: string;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default function ProfesoraScreen() {
  const insets = useSafeAreaInsets();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "registros"), where("sessionId", "==", SESSION_QR_VALUE));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRegistros(
          snapshot.docs.map((d) => ({
            id: d.id,
            name: String(d.data().name ?? ""),
            cedula: String(d.data().cedula ?? ""),
            timestamp: String(d.data().timestamp ?? ""),
          }))
        );
        setError(false);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Se ordena en el cliente para no requerir un índice compuesto (sessionId + timestamp) en Firestore.
  const ordered = useMemo(
    () => [...registros].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [registros]
  );

  const handleExport = useCallback(async () => {
    if (ordered.length === 0 || exporting) return;
    setExporting(true);
    try {
      const rows = ordered.map((r) => ({
        Nombre: r.name,
        Cédula: r.cedula,
        Hora: new Date(r.timestamp).toLocaleString("es-ES"),
      }));
      const sheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Asistencia");
      const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      const file = new File(Paths.cache, `asistencia-${stamp}.xlsx`);
      if (file.exists) file.delete();
      file.create();
      file.write(base64, { encoding: "base64" });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("No se puede compartir", "Este dispositivo no admite compartir archivos.");
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Exportar asistencia",
        UTI: "org.openxmlformats.spreadsheetml.sheet",
      });
    } catch {
      Alert.alert("No se pudo exportar", "Ocurrió un error al generar el archivo. Intentá de nuevo.");
    } finally {
      setExporting(false);
    }
  }, [ordered, exporting]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            hitSlop={8}
          >
            <ArrowLeft color={colors.ink} size={20} strokeWidth={2.3} />
          </Pressable>
          <Pressable
            style={[styles.exportButton, (ordered.length === 0 || exporting) && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={ordered.length === 0 || exporting}
          >
            <FileSpreadsheet color={colors.white} size={16} strokeWidth={2.3} />
            <Text style={styles.exportText}>{exporting ? "Exportando…" : "Exportar a Excel"}</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>
          {ordered.length} {ordered.length === 1 ? "asistencia registrada" : "asistencias registradas"}
        </Text>
        <Text style={styles.subtitle}>Se actualiza sola, en tiempo real</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No se pudo cargar la lista</Text>
          <Text style={styles.emptyBody}>Revisá tu conexión a internet y las reglas de Firestore.</Text>
        </View>
      ) : ordered.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <ClipboardList color={colors.primary} size={30} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>Todavía no hay asistencias registradas</Text>
        </View>
      ) : (
        <FlatList
          data={ordered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.cedula}>C.I. {item.cedula}</Text>
              </View>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
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
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "700",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.ink,
    textAlign: "center",
  },
  emptyBody: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.ink,
  },
  cedula: {
    ...typography.caption,
    color: colors.inkFaint,
    marginTop: 1,
  },
  time: {
    ...typography.bodyMedium,
    color: colors.inkMuted,
    fontVariant: ["tabular-nums"],
  },
});
