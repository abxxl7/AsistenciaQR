import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { ScanOutcome } from "@/lib/types";

const CONFIG: Record<ScanOutcome["kind"], { bg: string; fg: string; Icon: typeof CheckCircle2 }> = {
  valid: { bg: colors.success, fg: colors.white, Icon: CheckCircle2 },
  invalid: { bg: colors.danger, fg: colors.white, Icon: XCircle },
};

function messageFor(outcome: ScanOutcome): { title: string; subtitle: string } {
  switch (outcome.kind) {
    case "valid":
      return { title: "QR reconocido", subtitle: "Completá tus datos para continuar" };
    case "invalid":
      return { title: "QR no reconocido", subtitle: "Pedile a tu profesora el código de esta clase" };
  }
}

export function FeedbackBanner({ outcome }: { outcome: ScanOutcome }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 8,
    }).start();
  }, [outcome, progress]);

  const { bg, fg, Icon } = CONFIG[outcome.kind];
  const { title, subtitle } = messageFor(outcome);

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
