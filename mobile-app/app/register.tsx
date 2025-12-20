import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { api } from "../lib/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log("REGISTER CLICKED", email, password);

  const submit = async () => {
    console.log("REGISTER CLICKED", email, password);
    if (!email || !password) {
        console.log("REGISTER CLICKED", email, password);
      Alert.alert("Hiba", "Email és jelszó kötelező");
      return;
    }

    try {
      await api.register(email, password);
      Alert.alert("Sikeres regisztráció", "Most már be tudsz lépni");
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Hiba", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regisztráció</Text>

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

      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Regisztráció</Text>
      </Pressable>

      <Pressable onPress={() => router.replace("/login")}>
        <Text style={styles.link}>Van már fiókod? Belépés</Text>
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
  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
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
