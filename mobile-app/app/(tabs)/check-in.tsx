import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";

type Mood = "sad" | "neutral" | "good";

export default function CheckIn() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!mood) return;

    console.log({
      mood,
      note,
      createdAt: new Date(),
    });

    Alert.alert("Mentve", "Köszi, elmentettük 👍");
    setNote("");
    setMood(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Hogy vagy ma?</Text>

        <View style={styles.moodRow}>
          <MoodButton emoji="😔" selected={mood === "sad"} onPress={() => setMood("sad")} />
          <MoodButton emoji="😐" selected={mood === "neutral"} onPress={() => setMood("neutral")} />
          <MoodButton emoji="🙂" selected={mood === "good"} onPress={() => setMood("good")} />
        </View>

        <TextInput
          placeholder="Ha szeretnéd, írhatsz pár szót…"
          placeholderTextColor="#64748b"
          value={note}
          onChangeText={setNote}
          style={styles.textarea}
          multiline
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Mentés</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MoodButton({
  emoji,
  selected,
  onPress,
}: {
  emoji: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.moodButton,
        selected && styles.moodButtonSelected,
      ]}
    >
      <Text style={styles.moodEmoji}>{emoji}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
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
  moodButton: {
    backgroundColor: "#020617",
    padding: 16,
    borderRadius: 12,
    width: "30%",
    alignItems: "center",
  },
  moodButtonSelected: {
    backgroundColor: "#22c55e",
  },
  moodEmoji: {
    fontSize: 28,
  },
  textarea: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    color: "#e5e7eb",
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#052e16",
  },
});
