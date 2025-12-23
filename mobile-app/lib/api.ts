export const API_BASE = "http://192.168.1.106:3000";

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}
export type HistoryPeriod = "week" | "month" | "year";

async function req(path: string, options: RequestInit = {}) {
  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text);
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export const api = {
  // 🔐 AUTH
  login: (email: string, password: string) =>
  req("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
  register: (email: string, password: string) =>
  req("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),

  // 📅 TASKS
  getTodayTasks: () => req("/daily-tasks/today"),

  completeDailyTask: (id: number) =>
    req(`/daily-tasks/${id}/complete`, { method: "POST" }),

  uncompleteDailyTask: (id: number) =>
    req(`/daily-tasks/${id}/uncomplete`, { method: "POST" }),

  deleteDailyTask: (id: number) =>
    req(`/daily-tasks/${id}`, { method: "DELETE" }),

  addDailyTask: (title: string, area: string, points = 1) =>
    req("/daily-tasks/add", {
      method: "POST",
      body: JSON.stringify({ title, area, points }),
    }),

  // 📊 STATS
  getUserStats: () => req("/user/stats"),

  getUserHistory: (period: HistoryPeriod) =>
    req(`/user/stats/history?period=${period}`),

  // 🔄 RESET
  resetUser: () => req("/user/reset", { method: "POST" }),

  getWeeklyHistory: () => req("/user/history/week"),
};
