import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraOff, ScanLine, Users } from "lucide-react-native";

import { ScanOverlay } from "@/components/ScanOverlay";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { useAttendance } from "@/lib/AttendanceContext";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { ScanFeedback } from "@/lib/types";

const RESET_DELAY_MS = 2200;
const SAME_CODE_COOLDOWN_MS = 4000;

const ACCENT_BY_KIND: Record<ScanFeedback["kind"], string> = {
  success: colors.success,
  duplicate: colors.warning,
  "not-found": colors.danger,
};

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { records, registerScan } = useAttendance();
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);

  const lockedRef = useRef(false);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBarcodeScanned = useCallback(
    async (scan: BarcodeScanningResult) => {
      const code = scan.data;
      const now = Date.now();

      if (lockedRef.current) return;
      if (lastCodeRef.current?.code === code && now - lastCodeRef.current.at < SAME_CODE_COOLDOWN_MS) {
        return;
      }

      lockedRef.current = true;
      lastCodeRef.current = { code, at: now };

      const scanResult = await registerScan(code);
      setFeedback(scanResult);

      Haptics.notificationAsync(
        scanResult.kind === "success"
          ? Haptics.NotificationFeedbackType.Success
          : scanResult.kind === "duplicate"
            ? Haptics.NotificationFeedbackType.Warning
            : Haptics.NotificationFeedbackType.Error
      ).catch(() => {});

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        lockedRef.current = false;
      }, RESET_DELAY_MS);
    },
    [registerScan]
  );

  if (!permission) {
    return <View style={styles.loadingRoot} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionRoot, { paddingTop: insets.top + spacing.xl }]}>
        <StatusBar style="dark" />
        <View style={styles.permissionIconWrap}>
          <CameraOff color={colors.primary} size={30} strokeWidth={2} />
        </View>
        <Text style={styles.permissionTitle}>Necesitamos la cámara</Text>
        <Text style={styles.permissionBody}>
          Para escanear el QR del carnet de cada estudiante y registrar su asistencia, la app
          necesita acceso a la cámara del dispositivo.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dar acceso a la cámara</Text>
        </Pressable>
        {permission.canAskAgain === false && (
          <Text style={styles.permissionHint}>
            Si ya la rechazaste antes, activala manualmente desde los ajustes del sistema.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <ScanOverlay
        hint={
          feedback
            ? " "
            : "Apuntá la cámara al código QR del carnet"
        }
        accentColor={feedback ? ACCENT_BY_KIND[feedback.kind] : colors.success}
      />

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerTitleRow}>
          <ScanLine color={colors.white} size={20} strokeWidth={2.4} />
          <Text style={styles.headerTitle}>Escanear asistencia</Text>
        </View>
        <View style={styles.counterPill}>
          <Users color={colors.white} size={14} strokeWidth={2.4} />
          <Text style={styles.counterText}>{records.length}</Text>
        </View>
      </View>

      {feedback && (
        <View style={[styles.feedbackWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
          <FeedbackBanner feedback={feedback} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.white,
  },
  counterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  counterText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  feedbackWrap: {
    position: "absolute",
    left: spacing.base,
    right: spacing.base,
    bottom: 0,
  },
  permissionRoot: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  permissionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    ...typography.title,
    color: colors.ink,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  permissionBody: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  permissionButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  permissionHint: {
    ...typography.caption,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
