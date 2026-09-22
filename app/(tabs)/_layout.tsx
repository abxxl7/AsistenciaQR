import React from "react";
import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { ClipboardList, ScanLine } from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";

function TabIcon({
  focused,
  Icon,
}: {
  focused: boolean;
  Icon: typeof ScanLine;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon color={focused ? colors.primary : colors.inkFaint} size={22} strokeWidth={2.3} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Escanear",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={ScanLine} />,
        }}
      />
      <Tabs.Screen
        name="lista"
        options={{
          title: "Lista",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={ClipboardList} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 84,
    paddingTop: spacing.sm,
  },
  tabItem: {
    paddingTop: spacing.xs,
  },
  tabLabel: {
    ...typography.tiny,
    letterSpacing: 0,
    fontWeight: "600",
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
});
