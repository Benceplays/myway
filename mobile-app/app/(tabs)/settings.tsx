import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth-context";

export default function Settings() {
  // 🔒 HOOK CSAK ITT
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Kijelentkezés", "Biztos ki szeretnél jelentkezni?", [
      { text: "Mégse", style: "cancel" },
      {
        text: "Kijelentkezés",
        style: "destructive",
        onPress: async () => {
          await logout();        // ❗ SEMMI useAuth ITT
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beállítások</Text>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Kijelentkezés</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 75,
    backgroundColor: "#0f172a",
    padding: 24,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 22,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: "#450a0a",
    borderColor: "#7f1d1d",
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fecaca",
    textAlign: "center",
    fontWeight: "600",
  },
});
