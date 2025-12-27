import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "appdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.get("/api/health", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS ok");
        res.json({ ok: true, db: rows[0].ok === 1 });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

app.listen(port, () => {
    console.log(`API running on http://0.0.0.0:${port}`);
});
