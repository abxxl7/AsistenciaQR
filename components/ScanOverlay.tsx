import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";

const FRAME_SIZE = 250;

type Props = {
  hint: string;
  accentColor?: string;
};

export function ScanOverlay({ hint, accentColor = colors.success }: Props) {
  const lineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineY, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(lineY, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [lineY]);

  const translateY = lineY.interpolate({
    inputRange: [0, 1],
    outputRange: [10, FRAME_SIZE - 10],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.dimTop} />
      <View style={styles.middleRow}>
        <View style={styles.dimSide} />
        <View style={[styles.frame, { borderColor: `${accentColor}55` }]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: accentColor }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: accentColor }]} />
          <Animated.View
            style={[styles.scanLine, { backgroundColor: accentColor, transform: [{ translateY }] }]}
          />
        </View>
        <View style={styles.dimSide} />
      </View>
      <View style={styles.dimBottom}>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  dimTop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  middleRow: {
    flexDirection: "row",
    height: FRAME_SIZE,
  },
  dimSide: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  dimBottom: {
    flex: 1.3,
    backgroundColor: colors.overlay,
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderWidth: 3.5,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: radius.lg,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: radius.lg,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: radius.lg,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: radius.lg,
  },
  scanLine: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 2,
    opacity: 0.9,
  },
  hint: {
    ...typography.bodyMedium,
    color: colors.white,
    textAlign: "center",
  },
});
