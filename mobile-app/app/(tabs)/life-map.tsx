import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { api } from "../../lib/api";
import { useRef, useEffect } from "react";

type Level = "low" | "medium" | "good";
type ChartMode = "week" | "year";

const chartScrollRef = useRef<ScrollView>(null);
const screenWidth = Dimensions.get("window").width;

const AREAS = [
  { key: "health", label: "Egészség" },
  { key: "learning", label: "Tanulás" },
  { key: "money", label: "Pénz" },
  { key: "relationships", label: "Kapcsolatok" },
  { key: "me", label: "Én-idő" },
];

function getLevel(points: number): Level {
  if (points < 100) return "low";
  if (points < 250) return "medium";
  return "good";
}

export default function LifeMap() {
  const [points, setPoints] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [praise, setPraise] = useState("");

  // 📊 CHART
  const [chartMode, setChartMode] = useState<ChartMode>("week");
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartValues, setChartValues] = useState<number[]>([]);
  const [todayIndex, setTodayIndex] = useState<number | null>(null);

  // 🔁 STATOK
  const loadStats = async () => {
    const res = await api.getUserStats();

    const map: Record<string, number> = {};
    res.byArea.forEach((a: { area: string; points: number }) => {
      map[a.area] = a.points;
    });

    setPoints(map);
    setStreak(res.streak || 0);

    setPraise(
      res.streak >= 14
        ? "🔥 Brutális sorozat!"
        : res.streak >= 7
        ? "💪 Nagyon jó ritmus!"
        : res.streak >= 3
        ? "👏 Jó úton jársz!"
        : "🚀 Szuper kezdés!"
    );
  };

  // 📊 CHART BETÖLTÉS
const loadChart = async (mode: ChartMode) => {
  if (mode === "week") {
    const res = await api.getWeeklyHistory();

    // 🔥 A BACKEND MÁR SIMA TÖMBÖT AD VISSZA
    const payload = res as any[];

    console.log("WEEK PAYLOAD (FINAL):", payload);

    setChartLabels(payload.map(d => d.label));
    setChartValues(payload.map(d => Number(d.points)));
    setTodayIndex(payload.findIndex(d => d.isToday));
  }
};


  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadChart(chartMode);
    }, [])
  );

  useEffect(() => {
  if (todayIndex !== null && chartScrollRef.current) {
    const BAR_WIDTH = 60; // ugyanaz mint labels.length * 60

    chartScrollRef.current.scrollTo({
      x: todayIndex * BAR_WIDTH,
      animated: true,
    });
  }
}, [todayIndex]);

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.card}>
        {/* 🔝 CÍM */}
        <Text style={styles.title}>
          Statisztikáid · {totalPoints} XP
        </Text>

        <Text style={styles.praise}>
          {praise} ({streak} napos streak)
        </Text>

        {/* 📋 KATEGÓRIA PONTOK */}
        {AREAS.map((area) => {
          const areaPoints = points[area.key] || 0;
          const level = getLevel(areaPoints);
          const percent = Math.min(areaPoints / 3, 100);

          return (
            <View key={area.key} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.label}>{area.label}</Text>
                <Text style={styles.points}>{areaPoints} XP</Text>
              </View>

              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    styles[`bar_${level}`],
                    { width: `${percent}%` },
                  ]}
                />
              </View>

              <Text style={styles.levelText}>
                {level === "good" && "Erősség 💪"}
                {level === "medium" && "Fejlődőben 😐"}
                {level === "low" && "Figyelmet igényel ⚠️"}
              </Text>
            </View>
          );
        })}

        {/* 🔵 GRAFIKON BLOKK */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            {chartMode === "week" ? "Heti aktivitás" : "Éves aktivitás"}
          </Text>

          {/* 🔘 VÁLTÓ */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.toggleBtn,
                chartMode === "week" && styles.toggleActive,
              ]}
              onPress={() => {
                setChartMode("week");
                loadChart("week");
              }}
            >
              <Text style={styles.toggleText}>Heti</Text>
            </Pressable>

            <Pressable
              style={[
                styles.toggleBtn,
                chartMode === "year" && styles.toggleActive,
              ]}
              onPress={() => {
                setChartMode("year");
                loadChart("year");
              }}
            >
              <Text style={styles.toggleText}>Havi</Text>
            </Pressable>
          </View>

          {/* 📊 CHART */}
          {(() => {
          const chartWidth = Math.max(screenWidth, chartLabels.length * 60);
          const chartHeight = 240;

          const maxValue = Math.max(...chartValues, 0);
          const roundedMax = maxValue === 0 ? 10 : Math.ceil(maxValue / 5) * 5;
          const segments = 5;

          const topPad = 10;
          const bottomPad = 30;
          const usableHeight = chartHeight - topPad - bottomPad;
          const barWidth = chartWidth / Math.max(1, chartLabels.length);
          const displayValues = chartValues.map(v => (v === 0 ? null : v));


            
          return (
            <ScrollView
              ref={chartScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View
                style={{
                  width: chartWidth,
                  height: chartHeight,
                  position: "relative",
                }}
              >
                <BarChart
                  data={{
                    labels: chartLabels,
                    datasets: [{ data: displayValues }],
                  }}
                  width={chartWidth}
                  height={chartHeight}
                  fromZero
                  segments={segments}
                  showValuesOnTopOfBars
                  withVerticalLabels={false}
                  withHorizontalLabels={false}
                  withInnerLines
                  withOuterLines={false}
                  chartConfig={{
                    backgroundGradientFrom: "#0b1220",
                    backgroundGradientTo: "#0b1220",
                    decimalPlaces: 0,
                    color: () => "#38bdf8",
                    labelColor: () => "#e5e7eb",
                    barPercentage: 0.55,
                  }}
                  style={{
                    borderRadius: 16,
                    paddingLeft: 24,
                  }}
                />
              </View>
            </ScrollView>
          );
        })()}

          <Text style={styles.chartHint}>
            📅 Időalapú összpontok
          </Text>
        </View>

        {/* 🔴 RESET */}
        <Pressable
          style={styles.resetBtn}
          onPress={async () => {
            await api.resetUser();
            await loadStats();
            await loadChart(chartMode);
          }}
        >
          <Text style={styles.resetText}>
            Pontok és streak nullázása
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
    paddingTop: 75,
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
    marginBottom: 8,
  },
  praise: {
    color: "#22c55e",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },

  row: { marginBottom: 18 },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { color: "#e5e7eb", fontSize: 16 },
  points: { color: "#94a3b8", fontSize: 13 },

  barBg: {
    height: 10,
    backgroundColor: "#020617",
    borderRadius: 6,
  },
  barFill: { height: "100%", borderRadius: 6 },
  bar_low: { backgroundColor: "#ef4444" },
  bar_medium: { backgroundColor: "#facc15" },
  bar_good: { backgroundColor: "#22c55e" },

  levelText: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 12,
  },

  chartCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#38bdf8",
    overflow: "hidden",
  },
  chartTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  chartHint: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginHorizontal: 6,
  },
  toggleActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  toggleText: {
    color: "#e5e7eb",
    fontWeight: "600",
  },

  resetBtn: {
    marginTop: 28,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#7f1d1d",
    alignItems: "center",
  },
  resetText: {
    color: "#fecaca",
    fontWeight: "600",
  },
});
