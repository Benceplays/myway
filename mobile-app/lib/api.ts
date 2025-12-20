export const API_BASE = "http://192.168.0.107:3000"; // 🔁 a te IP-d

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

async function req(
  path: string,
  options: RequestInit = {}
) {
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

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export const api = {
  // 🔐 AUTH
  register: (email: string, password: string) =>
    req("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    req("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // 📅 DAILY TASKS
  getTodayTasks: () =>
    req("/daily-tasks/today"),

  completeDailyTask: (dailyTaskId: number) =>
    req(`/daily-tasks/${dailyTaskId}/complete`, {
      method: "POST",
    }),

  // 🗺️ LIFE MAP
  getLifeMap: () =>
    req("/life-map"),

  // ❤️ HEALTH CHECK (dev)
  health: () =>
    req("/health"),
};
