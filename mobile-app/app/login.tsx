import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ HOOK KOMPONENS SZINTEN
  const { login } = useAuth();

  const submit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      await login(res.token);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg =
        e?.message === "Invalid credentials"
          ? "Hibás email vagy jelszó"
          : "Nem sikerült belépni. Próbáld újra.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Belépés</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#64748b"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Jelszó"
        placeholderTextColor="#64748b"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Belépés…" : "Belépés"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/register")}>
        <Text style={styles.link}>Nincs fiókod? Regisztráció</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "#e5e7eb",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#020617",
    color: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  errorBox: {
    backgroundColor: "#450a0a",
    borderColor: "#7f1d1d",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#fecaca",
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#052e16",
  },
  link: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 16,
  },
});
