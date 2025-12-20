import { View, Text, StyleSheet } from "react-native";

export default function Recap() {
  const moods = ["🙂", "😐", "😔", "🙂", "😐", "🙂", "😐"];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Visszatekintés</Text>

        <View style={styles.moodRow}>
          {moods.map((mood, i) => (
            <Text key={i} style={styles.mood}>
              {mood}
            </Text>
          ))}
        </View>

        <Text style={styles.text}>
          Ez a hét nem volt könnyű. Az, hogy itt vagy, már számít.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },
  card: {
    backgroundColor: "#020617",
    padding: 24,
    borderRadius: 16,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  mood: {
    fontSize: 24,
    width: "14%",
    textAlign: "center",
  },
  text: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
});
