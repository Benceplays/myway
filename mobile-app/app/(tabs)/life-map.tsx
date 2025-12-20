import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

type Level = "low" | "medium" | "good";

const AREAS = [
  { key: "health", label: "Egészség" },
  { key: "learning", label: "Tanulás" },
  { key: "money", label: "Pénz" },
  { key: "relationships", label: "Kapcsolatok" },
  { key: "me", label: "Én-idő" },
];

const LEVELS: { key: Level; label: string }[] = [
  { key: "low", label: "gyenge" },
  { key: "medium", label: "oké" },
  { key: "good", label: "jó" },
];

export default function LifeMap() {
  const [levels, setLevels] = useState<Record<string, Level>>({});

  const setLevel = (area: string, level: Level) => {
    setLevels((prev) => ({ ...prev, [area]: level }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Hol tartasz most?</Text>

        {AREAS.map((area) => (
          <View key={area.key} style={styles.row}>
            <Text style={styles.label}>{area.label}</Text>

            <View style={styles.levelRow}>
              {LEVELS.map((lvl) => {
                const selected = levels[area.key] === lvl.key;

                return (
                  <Pressable
                    key={lvl.key}
                    onPress={() => setLevel(area.key, lvl.key)}
                    style={[
                      styles.levelButton,
                      selected && styles.levelButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        selected && styles.levelTextSelected,
                      ]}
                    >
                      {lvl.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
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
  row: {
    marginBottom: 16,
  },
  label: {
    color: "#e5e7eb",
    marginBottom: 8,
    fontSize: 16,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelButton: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    paddingVertical: 8,
    width: "30%",
    alignItems: "center",
  },
  levelButtonSelected: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  levelText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  levelTextSelected: {
    color: "#052e16",
    fontWeight: "600",
  },
});
