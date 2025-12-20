require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// --- MySQL pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "my_way",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

// --- helpers ---
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// --- AUTH ---
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing data" });

  const hash = await bcrypt.hash(String(password), 10);
  try {
    await pool.execute(
      "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())",
      [String(email).toLowerCase(), hash]
    );
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [String(email).toLowerCase()]
  );

  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token });
});

app.get("/daily-tasks/today", authRequired, async (req, res) => {
  const userId = req.userId;
  const today = todayISO();

  // 1️⃣ megnézzük, mennyi task van mára
  const [[{ cnt }]] = await pool.execute(
    `
    SELECT COUNT(*) AS cnt
    FROM user_daily_tasks
    WHERE user_id = ? AND date = ?
    `,
    [userId, today]
  );

  // 2️⃣ ha kevesebb mint 5 → pótoljuk AREA szerint
  if (cnt < 5) {
    const AREAS = ["health", "learning", "money", "relationships", "me"];

    for (const area of AREAS) {
      // van-e már ebből az area-ból task mára?
      const [[{ areaCnt }]] = await pool.execute(
        `
        SELECT COUNT(*) AS areaCnt
        FROM user_daily_tasks udt
        JOIN daily_tasks dt ON dt.id = udt.daily_task_id
        WHERE udt.user_id = ?
          AND udt.date = ?
          AND dt.area = ?
        `,
        [userId, today, area]
      );

      // ha nincs → sorsolunk 1-et ebből az area-ból
      if (areaCnt === 0) {
        const [tasks] = await pool.execute(
          `
          SELECT id
          FROM daily_tasks
          WHERE active = 1
            AND area = ?
            AND id NOT IN (
              SELECT daily_task_id
              FROM user_daily_tasks
              WHERE user_id = ? AND date = ?
            )
          ORDER BY RAND()
          LIMIT 1
          `,
          [area, userId, today]
        );

        if (tasks.length > 0) {
          await pool.execute(
            `
            INSERT INTO user_daily_tasks (user_id, daily_task_id, date)
            VALUES (?, ?, ?)
            `,
            [userId, tasks[0].id, today]
          );
        }
      }
    }
  }

  // 3️⃣ visszaadjuk a MAI 5 taskot
  const [rows] = await pool.execute(
    `
    SELECT
      udt.id AS userDailyTaskId,
      dt.title,
      dt.area,
      dt.points,
      udt.completed
    FROM user_daily_tasks udt
    JOIN daily_tasks dt ON dt.id = udt.daily_task_id
    WHERE udt.user_id = ? AND udt.date = ?
    ORDER BY dt.area ASC
    `,
    [userId, today]
  );

  res.json({ tasks: rows });
});

// --- START ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
