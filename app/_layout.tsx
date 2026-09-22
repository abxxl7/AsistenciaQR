import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AttendanceProvider } from "@/lib/AttendanceContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AttendanceProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AttendanceProvider>
    </SafeAreaProvider>
  );
}
