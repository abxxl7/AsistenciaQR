import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraOff, ScanLine } from "lucide-react-native";

import { ScanOverlay } from "@/components/ScanOverlay";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { useAttendance } from "@/lib/AttendanceContext";
import { SESSION_QR_VALUE } from "@/lib/session";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { ScanOutcome } from "@/lib/types";

const VALID_HOLD_MS = 650;
const INVALID_COOLDOWN_MS = 2200;

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { record } = useAttendance();
  const [permission, requestPermission] = useCameraPermissions();
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);

  const lockedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Si este celular ya tiene una asistencia registrada, no dejamos volver a escanear.
  useFocusEffect(
    useCallback(() => {
      if (record) {
        router.replace("/confirmacion");
      }
    }, [record])
  );

  const handleBarcodeScanned = useCallback((scan: BarcodeScanningResult) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    const code = scan.data;
    const isValid = code === SESSION_QR_VALUE;

    if (isValid) {
      setOutcome({ kind: "valid", sessionId: code });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      timeoutRef.current = setTimeout(() => {
        router.push({ pathname: "/formulario", params: { sessionId: code } });
      }, VALID_HOLD_MS);
    } else {
      setOutcome({ kind: "invalid" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      timeoutRef.current = setTimeout(() => {
        setOutcome(null);
        lockedRef.current = false;
      }, INVALID_COOLDOWN_MS);
    }
  }, []);

  if (record) {
    return <View style={styles.loadingRoot} />;
  }

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
          Para escanear el código QR que muestra tu profesora y registrar tu asistencia, la app
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
        hint={outcome ? " " : "Apuntá la cámara al QR que muestra tu profesora"}
        accentColor={outcome?.kind === "invalid" ? colors.danger : colors.success}
      />

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <ScanLine color={colors.white} size={20} strokeWidth={2.4} />
        <Text style={styles.headerTitle}>Escanear código de clase</Text>
      </View>

      {outcome && (
        <View style={[styles.feedbackWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
          <FeedbackBanner outcome={outcome} />
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
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.subtitle,
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
