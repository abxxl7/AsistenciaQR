import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IdCard, User } from "lucide-react-native";

import { useAttendance } from "@/lib/AttendanceContext";
import { colors, radius, spacing, typography } from "@/lib/theme";

export default function FormularioScreen() {
  const insets = useSafeAreaInsets();
  const { record, confirmAttendance } = useAttendance();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const [name, setName] = useState("");
  const [cedula, setCedula] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [cedulaError, setCedulaError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (record) {
        router.replace("/confirmacion");
        return;
      }
      if (!sessionId) {
        router.replace("/scanner");
      }
    }, [record, sessionId])
  );

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    const digitsOnly = cedula.replace(/\D/g, "");

    const nextNameError = trimmedName.length < 3 ? "Ingresá tu nombre completo" : null;
    const nextCedulaError = digitsOnly.length < 6 ? "Ingresá un número de cédula válido" : null;

    setNameError(nextNameError);
    setCedulaError(nextCedulaError);
    if (nextNameError || nextCedulaError || !sessionId) return;

    setSubmitting(true);
    try {
      await confirmAttendance({ name: trimmedName, cedula: digitsOnly, sessionId });
      router.replace("/confirmacion");
    } finally {
      setSubmitting(false);
    }
  }, [name, cedula, sessionId, confirmAttendance]);

  if (record || !sessionId) {
    return <View style={styles.root} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
        <View>
          <Text style={styles.title}>Confirmá tus datos</Text>
          <Text style={styles.subtitle}>
            El código de la clase es válido. Completá tu nombre y cédula para registrar tu
            asistencia.
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Nombre completo</Text>
            <View style={[styles.inputWrap, nameError && styles.inputWrapError]}>
              <User color={colors.inkFaint} size={18} strokeWidth={2.2} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError(null);
                }}
                placeholder="Ej. Ana Pérez"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          <View>
            <Text style={styles.label}>Cédula</Text>
            <View style={[styles.inputWrap, cedulaError && styles.inputWrapError]}>
              <IdCard color={colors.inkFaint} size={18} strokeWidth={2.2} />
              <TextInput
                style={styles.input}
                value={cedula}
                onChangeText={(text) => {
                  setCedula(text);
                  if (cedulaError) setCedulaError(null);
                }}
                placeholder="Ej. 1234567890"
                placeholderTextColor={colors.inkFaint}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            {cedulaError && <Text style={styles.errorText}>{cedulaError}</Text>}
          </View>
        </View>

        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Registrando…" : "Registrar asistencia"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.screenTitle,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.inkMuted,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    height: 52,
  },
  inputWrapError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.ink,
    height: "100%",
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
});
