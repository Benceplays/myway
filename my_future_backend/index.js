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
  const header = req.headersauthorization || req.headers.authorization || "";
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
app.get("/user/stats/history", authRequired, async (req, res) => {
  const userId = req.userId;
  const period = req.query.period === "year" ? "year" : "month";

  const interval =
    period === "year" ? "1 YEAR" : "1 MONTH";

  const [rows] = await pool.execute(
    `
    SELECT area, SUM(points) as points
    FROM user_point_history
    WHERE user_id = ?
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL ${interval})
    GROUP BY area
    `,
    [userId]
  );

  res.json(rows);
});

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

app.get("/user/history/week", authRequired, async (req, res) => {
  const userId = req.userId;

  const start = new Date();
  start.setDate(start.getDate() - 6);
  const startISO = start.toISOString().slice(0, 10);

  const [rows] = await pool.execute(
  `
  SELECT
    DATE_FORMAT(date, '%Y-%m-%d') AS day,
    SUM(points) AS points
  FROM user_daily_tasks
  WHERE user_id = ?
    AND completed = 1
    AND date BETWEEN DATE(?) AND CURDATE()
  GROUP BY day
  ORDER BY day
  `,
  [userId, startISO]
);

  const map = {};
  for (const r of rows) {
    map[r.day] = Number(r.points);
  }

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);

    days.push({
      label: d.toLocaleDateString("hu-HU", { weekday: "short" }),
      date: iso,
      points: map[iso] || 0,
      isToday: i === 0,
    });
  }

  res.json(days);
});


app.post("/user/reset", authRequired, async (req, res) => {
  const userId = req.userId;

  await pool.execute(
    `
    INSERT INTO user_point_history (user_id, area, points, created_at)
    SELECT user_id, area, -points, CURDATE()
    FROM user_area_points
    WHERE user_id = ?
    `,
    [userId]
  );

  await pool.execute(
    `DELETE FROM user_area_points WHERE user_id = ?`,
    [userId]
  );

  await pool.execute(
    `UPDATE user_streaks
     SET current_streak = 0, last_completed = NULL
     WHERE user_id = ?`,
    [userId]
  );

  await pool.execute(
    `UPDATE user_daily_tasks
     SET deleted = 1
     WHERE user_id = ?`,
    [userId]
  );

  res.json({ ok: true });
});

// --- DAILY TASKS (TODAY) ---
app.get("/daily-tasks/today", authRequired, async (req, res) => {
  const userId = req.userId;
  const today = todayISO();

  const [[{ cnt }]] = await pool.execute(
    `
    SELECT COUNT(*) AS cnt
    FROM user_daily_tasks
    WHERE user_id = ? AND date = ? AND deleted = 0
    `,
    [userId, today]
  );

  if (cnt < 5) {
    const AREAS = ["health", "learning", "money", "relationships", "me"];

    for (const area of AREAS) {
      const [[{ areaCnt }]] = await pool.execute(
        `
        SELECT COUNT(*) AS areaCnt
        FROM user_daily_tasks udt
        JOIN daily_tasks dt ON dt.id = udt.daily_task_id
        WHERE udt.user_id = ?
          AND udt.date = ?
          AND udt.deleted = 0
          AND dt.area = ?
        `,
        [userId, today, area]
      );

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
              WHERE user_id = ? AND date = ? AND deleted = 0
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
    WHERE udt.user_id = ? AND udt.date = ? AND udt.deleted = 0
    ORDER BY dt.area ASC
    `,
    [userId, today]
  );

  res.json({ tasks: rows });
});

// 📊 USER STATS (LifeMap-hez)
app.get("/user/stats", authRequired, async (req, res) => {
  const userId = req.userId;

  const [rows] = await pool.execute(
    `
    SELECT area, points
    FROM user_area_points
    WHERE user_id = ?
    `,
    [userId]
  );

  const totalPoints = rows.reduce((sum, r) => sum + r.points, 0);

  const [[streak]] = await pool.execute(
    `SELECT current_streak FROM user_streaks WHERE user_id = ?`,
    [userId]
  );

  const s = streak?.current_streak || 0;

  let difficulty = "easy";
  if (s >= 14) difficulty = "hard";
  else if (s >= 7) difficulty = "medium";

  res.json({
    byArea: rows,
    totalPoints,
    streak: s,
    difficulty,
  });
});

// ✅ COMPLETE
app.post("/daily-tasks/:id/complete", authRequired, async (req, res) => {
  const taskId = Number(req.params.id);
  const userId = req.userId;

  const [[task]] = await pool.execute(
    `
    SELECT udt.completed, dt.points, dt.area
    FROM user_daily_tasks udt
    JOIN daily_tasks dt ON dt.id = udt.daily_task_id
    WHERE udt.id = ? AND udt.user_id = ? AND udt.deleted = 0
    `,
    [taskId, userId]
  );

  if (!task || task.completed === 1) {
    return res.json({ ok: true });
  }

  await pool.execute(
    `UPDATE user_daily_tasks SET completed = 1, completed_at = NOW() WHERE id = ?`,
    [taskId]
  );

  await pool.execute(
    `
    INSERT INTO user_point_history (user_id, area, points, created_at)
    VALUES (?, ?, ?, CURDATE())
    `,
    [userId, task.area, task.points]
  );

  await pool.execute(
    `
    INSERT INTO user_area_points (user_id, area, points)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE points = points + VALUES(points)
    `,
    [userId, task.area, task.points]
  );

    // 🔥 STREAK UPDATE
  const today = todayISO();

  const [[streak]] = await pool.execute(
    `SELECT current_streak, last_completed
    FROM user_streaks
    WHERE user_id = ?`,
    [userId]
  );

  if (!streak) {
    await pool.execute(
      `INSERT INTO user_streaks (user_id, current_streak, last_completed)
      VALUES (?, 1, ?)`,
      [userId, today]
    );
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().slice(0, 10);

    let newStreak = 0;

    if (streak.last_completed === today) {
      newStreak = streak.current_streak;
    } else if (streak.last_completed === yesterdayISO) {
      newStreak = streak.current_streak + 1;
    } else {
      newStreak = 1; // új streak indul
    }

    await pool.execute(
      `UPDATE user_streaks
      SET current_streak = ?, last_completed = ?
      WHERE user_id = ?`,
      [newStreak, today, userId]
    );
  }

  await pool.execute(
  `
  UPDATE user_daily_tasks
  SET points = ?
  WHERE id = ?
  `,
  [task.points, taskId]
);


  res.json({ ok: true });
});

// 🔁 UNCOMPLETE
app.post("/daily-tasks/:id/uncomplete", authRequired, async (req, res) => {
  const taskId = Number(req.params.id);
  const userId = req.userId;

  const [[task]] = await pool.execute(
    `
    SELECT udt.completed, dt.points, dt.area
    FROM user_daily_tasks udt
    JOIN daily_tasks dt ON dt.id = udt.daily_task_id
    WHERE udt.id = ? AND udt.user_id = ? AND udt.deleted = 0
    `,
    [taskId, userId]
  );

  if (!task || task.completed === 0) {
    return res.json({ ok: true });
  }

  await pool.execute(
    `UPDATE user_daily_tasks SET completed = 0, completed_at = NULL WHERE id = ?`,
    [taskId]
  );

  await pool.execute(
    `
    UPDATE user_area_points
    SET points = GREATEST(points - ?, 0)
    WHERE user_id = ? AND area = ?
    `,
    [task.points, userId, task.area]
  );

  res.json({ ok: true });
});

// 🗑️ SOFT DELETE (MA)
app.delete("/daily-tasks/:id", authRequired, async (req, res) => {
  const taskId = Number(req.params.id);
  const userId = req.userId;

  const [[task]] = await pool.execute(
    `
    SELECT udt.completed, dt.points, dt.area
    FROM user_daily_tasks udt
    JOIN daily_tasks dt ON dt.id = udt.daily_task_id
    WHERE udt.id = ? AND udt.user_id = ? AND udt.deleted = 0
    `,
    [taskId, userId]
  );

  if (task && task.completed === 1) {
    await pool.execute(
      `
      UPDATE user_area_points
      SET points = GREATEST(points - ?, 0)
      WHERE user_id = ? AND area = ?
      `,
      [task.points, userId, task.area]
    );
  }

  await pool.execute(
    `UPDATE user_daily_tasks SET deleted = 1 WHERE id = ?`,
    [taskId]
  );

  res.json({ ok: true });
});

// ➕ ADD NEW TASK (MA)
app.post("/daily-tasks/add", authRequired, async (req, res) => {
  const userId = req.userId;
  const { title, area, points = 1 } = req.body || {};
  const today = todayISO();

  if (!title || !area) {
    return res.status(400).json({ error: "Missing title or area" });
  }

  const [taskRes] = await pool.execute(
    `
    INSERT INTO daily_tasks (title, area, points, active)
    VALUES (?, ?, ?, 1)
    `,
    [String(title), String(area), Number(points)]
  );

  await pool.execute(
    `
    INSERT INTO user_daily_tasks (user_id, daily_task_id, date)
    VALUES (?, ?, ?)
    `,
    [userId, taskRes.insertId, today]
  );

  res.json({ ok: true });
});

const cron = require("node-cron");

// ⏰ MINDEN NAP 00:05
cron.schedule("5 0 * * *", async () => {
  console.log("⏰ Daily point decay running...");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  const [users] = await pool.execute(
    `
    SELECT u.id
    FROM users u
    LEFT JOIN user_streaks us ON us.user_id = u.id
    WHERE us.last_completed IS NULL
       OR us.last_completed < ?
    `,
    [yesterdayISO]
  );

  for (const u of users) {
    // 🔻 streak = 0
    await pool.execute(
      `
      UPDATE user_streaks
      SET current_streak = 0
      WHERE user_id = ?
      `,
      [u.id]
    );

    // 🔻 –1 pont (nem megy 0 alá)
    await pool.execute(
      `
      UPDATE user_area_points
      SET points = GREATEST(points - 1, 0)
      WHERE user_id = ?
      `,
      [u.id]
    );
    await pool.execute(
      `
      INSERT INTO user_point_history (user_id, area, points, created_at)
      SELECT user_id, area, -1, CURDATE()
      FROM user_area_points
      WHERE user_id = ?
      `,
      [u.id]
    );

  }

  console.log(`✅ Daily decay done for ${users.length} users`);
});
// --- START ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
