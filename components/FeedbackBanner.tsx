import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, ScanLine, TriangleAlert } from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { ScanFeedback } from "@/lib/types";

const CONFIG: Record<
  ScanFeedback["kind"],
  { bg: string; fg: string; Icon: typeof CheckCircle2 }
> = {
  success: { bg: colors.success, fg: colors.white, Icon: CheckCircle2 },
  duplicate: { bg: colors.warning, fg: colors.white, Icon: TriangleAlert },
  "not-found": { bg: colors.danger, fg: colors.white, Icon: ScanLine },
};

function messageFor(feedback: ScanFeedback): { title: string; subtitle: string } {
  switch (feedback.kind) {
    case "success":
      return { title: `Asistencia registrada`, subtitle: `${feedback.name} · ${feedback.time}` };
    case "duplicate":
      return { title: `Ya estaba registrado`, subtitle: `${feedback.name} · marcado a las ${feedback.time}` };
    case "not-found":
      return { title: "QR no reconocido", subtitle: "Este código no corresponde a ningún estudiante" };
  }
}

export function FeedbackBanner({ feedback }: { feedback: ScanFeedback }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 8,
    }).start();
  }, [feedback, progress]);

  const { bg, fg, Icon } = CONFIG[feedback.kind];
  const { title, subtitle } = messageFor(feedback);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Animated.View style={[styles.card, { backgroundColor: bg, opacity: progress, transform: [{ translateY }] }]}>
      <View style={styles.iconWrap}>
        <Icon color={fg} size={22} strokeWidth={2.5} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: fg }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
  },
  subtitle: {
    ...typography.caption,
    opacity: 0.92,
    marginTop: 2,
  },
});
