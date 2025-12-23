import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../lib/api";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

type Area = "health" | "learning" | "money" | "relationships" | "me";

type TodayTask = {
  userDailyTaskId: number;
  title: string;
  area: Area;
  points: number;
  completed: boolean;
};

const AREAS: Area[] = [
  "health",
  "learning",
  "money",
  "relationships",
  "me",
];

const AREA_LABEL: Record<Area, string> = {
  health: "Egészség",
  learning: "Tanulás",
  money: "Pénz",
  relationships: "Kapcsolatok",
  me: "Én-idő",
};

const MOTIVATIONS = [
  "Ma elég egy apró lépés.",
  "Nem kell tökéletesnek lenned.",
  "A haladás számít, nem a tempó.",
  "A mai nap is a tiéd.",
  "Az, hogy próbálkozol, már siker.",
];

const MOTIVATION_KEY = "daily_motivation";
const DATE_KEY = "daily_motivation_date";

export default function Home() {
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [loading, setLoading] = useState(true);

  // ➕ ADD MODAL
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newArea, setNewArea] = useState<Area>("me");

  // 💬 MOTIVÁCIÓ
  const [motivation, setMotivation] = useState("");

  const todayKey = new Date().toISOString().slice(0, 10);

  const formattedDate = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 🎲 NAPI MOTIVÁCIÓ BETÖLTÉS
  useEffect(() => {
    const loadMotivation = async () => {
      const storedDate = await AsyncStorage.getItem(DATE_KEY);
      const storedMotivation = await AsyncStorage.getItem(MOTIVATION_KEY);

      if (storedDate === todayKey && storedMotivation) {
        setMotivation(storedMotivation);
        return;
      }

      const random =
        MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

      await AsyncStorage.setItem(DATE_KEY, todayKey);
      await AsyncStorage.setItem(MOTIVATION_KEY, random);
      setMotivation(random);
    };

    loadMotivation();
  }, [todayKey]);

  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );

  const loadTasks = async () => {
  setLoading(true);
    try {
      const res = await api.getTodayTasks();
      setTasks(res.tasks);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const toggleTask = async (task: TodayTask) => {
    try {
      if (task.completed) {
        await api.uncompleteDailyTask(task.userDailyTaskId);
      } else {
        await api.completeDailyTask(task.userDailyTaskId);
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.userDailyTaskId === task.userDailyTaskId
            ? { ...t, completed: !t.completed }
            : t
        )
      );
    } catch {
      Alert.alert("Hiba", "Nem sikerült frissíteni");
    }
  };

  const deleteTask = (task: TodayTask) => {
    Alert.alert("Törlés", "Biztos törlöd?", [
      { text: "Mégse" },
      {
        text: "Törlés",
        style: "destructive",
        onPress: async () => {
          await api.deleteDailyTask(task.userDailyTaskId);
          setTasks((prev) =>
            prev.filter((t) => t.userDailyTaskId !== task.userDailyTaskId)
          );
        },
      },
    ]);
  };

  const addTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Hiba", "Adj meg címet");
      return;
    }

    await api.addDailyTask(newTitle, newArea);
    setShowAdd(false);
    setNewTitle("");
    setNewArea("me");
    loadTasks();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 📅 MOTIVÁCIÓ */}
        <View style={styles.motivationCard}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.motivationTitle}>Napi motiváció</Text>
          <Text style={styles.motivationText}>{motivation}</Text>
        </View>

        {/* ➕ ADD */}
        <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addText}>➕ Új feladat</Text>
        </Pressable>

        <Text style={styles.counter}>
          {completedCount}/{tasks.length || 5}
        </Text>

        <FlatList
          data={tasks}
          refreshing={loading}
          onRefresh={loadTasks}
          keyExtractor={(i) => String(i.userDailyTaskId)}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => deleteTask(item)}
                >
                  <Text style={{ color: "white" }}>🗑️</Text>
                </Pressable>
              )}
            >
              <Pressable
                onPress={() => toggleTask(item)}
                style={[
                  styles.task,
                  item.completed && styles.done,
                ]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.taskText}>
                    {item.completed ? "✅" : "⬜"} {item.title}
                  </Text>

                  <Text style={styles.points}>
                    +{item.points} XP
                  </Text>
                </View>

                <Text style={styles.area}>
                  {AREA_LABEL[item.area]}
                </Text>
              </Pressable>
            </Swipeable>
          )}
        />
      </View>

      {/* ➕ ADD MODAL */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Új feladat</Text>

            <TextInput
              placeholder="Feladat címe"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
            />

            <View style={styles.areaRow}>
              {AREAS.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setNewArea(a)}
                  style={[
                    styles.areaBtn,
                    newArea === a && styles.areaActive,
                  ]}
                >
                  <Text>{AREA_LABEL[a]}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.saveBtn} onPress={addTask}>
              <Text style={{ color: "white" }}>Mentés</Text>
            </Pressable>

            <Pressable onPress={() => setShowAdd(false)}>
              <Text style={{ marginTop: 8 }}>Mégse</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60, // 🔥 EZ oldja meg a "túl magasan van" gondot
    backgroundColor: "#0f172a",
  },
  motivationCard: {
    backgroundColor: "#020617",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  points: {
    color: "#22c55e",
    fontWeight: "700",
  },
  dateText: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 6,
  },
  motivationTitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 6,
  },
  motivationText: {
    color: "#e5e7eb",
    textAlign: "center",
    fontSize: 17,
  },
  addBtn: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  addText: { textAlign: "center", fontWeight: "700" },
  counter: { color: "#94a3b8", textAlign: "right", marginBottom: 6 },
  task: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  done: { opacity: 0.5 },
  taskText: { color: "white" },
  area: { color: "#64748b", fontSize: 12 },
  deleteBtn: {
    backgroundColor: "#dc2626",
    width: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 10,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },
  modalTitle: { fontSize: 18, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  areaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  areaBtn: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  areaActive: { backgroundColor: "#bbf7d0" },
  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
});
