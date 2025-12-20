import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../lib/api";

type TodayTask = {
  userDailyTaskId: number;
  title: string;
  area: "health" | "learning" | "money" | "relationships" | "me";
  points: number;
  completed: boolean;
};

const MOTIVATIONS = [
  "Ma elég egy apró lépés.",
  "Nem kell tökéletesnek lenned.",
  "A haladás számít, nem a tempó.",
  "A mai nap is a tiéd.",
  "Az, hogy próbálkozol, már siker.",
  "Nem kell mindent ma megoldani.",
  "A következetesség erősebb, mint a motiváció.",
];

const MOTIVATION_KEY = "daily_motivation";
const DATE_KEY = "daily_motivation_date";

function areaLabel(area: TodayTask["area"]) {
  switch (area) {
    case "health":
      return "Egészség";
    case "learning":
      return "Tanulás";
    case "money":
      return "Pénz";
    case "relationships":
      return "Kapcsolatok";
    case "me":
      return "Én-idő";
  }
}

export default function Home() {
  const [motivation, setMotivation] = useState("");
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [loading, setLoading] = useState(true);

  const todayKey = new Date().toISOString().slice(0, 10);

  const formattedDate = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 🎲 NAPI MOTIVÁCIÓ
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

  // 📡 NAPI 5 TASK BETÖLTÉSE
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const res = await api.getTodayTasks();

        setTasks(
          (res.tasks || []).map((t: any, index: number) => ({
            userDailyTaskId:
              Number(t.userDailyTaskId) || Number(`${index}${Date.now()}`),
            title: String(t.title),
            area: t.area,
            points: Number(t.points),
            completed: Boolean(t.completed),
          }))
        );
      } catch (e) {
        console.log("TASK LOAD ERROR", e);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );

  const completeTask = async (task: TodayTask) => {
    if (task.completed) return;

    try {
      await api.completeDailyTask(task.userDailyTaskId);

      setTasks((prev) =>
        prev.map((t) =>
          t.userDailyTaskId === task.userDailyTaskId
            ? { ...t, completed: true }
            : t
        )
      );
    } catch (e) {
      console.log("COMPLETE ERROR", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* 📅 MOTIVÁCIÓ */}
      <View style={styles.motivationCard}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.motivationTitle}>Napi motiváció</Text>
        <Text style={styles.motivationText}>{motivation}</Text>
      </View>

      {/* ✅ MAI FELADATOK */}
      <View style={styles.tasksCard}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>Mai feladatok</Text>
          <Text style={styles.tasksCounter}>
            {completedCount}/{tasks.length || 5}
          </Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Betöltés…</Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item, index) =>
              `${item.userDailyTaskId}-${index}`
            }
            style={{ marginTop: 12 }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.taskItem, item.completed && styles.taskDone]}
                onPress={() => completeTask(item)}
              >
                <View style={styles.taskTopRow}>
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && styles.taskTextDone,
                    ]}
                  >
                    {item.completed ? "✅ " : "⬜ "} {item.title}
                  </Text>

                  <Text style={styles.pointsText}>+{item.points}</Text>
                </View>

                <Text style={styles.areaText}>{areaLabel(item.area)}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
    paddingTop: 75,
  },
  motivationCard: {
    backgroundColor: "#020617",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  dateText: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 6,
  },
  motivationTitle: {
    color: "#94a3b8",
    marginBottom: 8,
    textAlign: "center",
  },
  motivationText: {
    color: "#e5e7eb",
    fontSize: 18,
    textAlign: "center",
  },
  tasksCard: {
    backgroundColor: "#020617",
    padding: 16,
    borderRadius: 16,
    flex: 1,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tasksTitle: {
    color: "#94a3b8",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tasksCounter: {
    color: "#94a3b8",
    fontSize: 13,
  },
  loadingText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
  },
  taskItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10,
  },
  taskDone: {
    opacity: 0.55,
  },
  taskTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  taskText: {
    color: "#e5e7eb",
    fontSize: 15,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: "line-through",
  },
  pointsText: {
    color: "#22c55e",
    fontWeight: "700",
  },
  areaText: {
    color: "#64748b",
    marginTop: 6,
    fontSize: 12,
  },
});
