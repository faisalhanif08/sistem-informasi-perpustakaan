/* ===== ENTRY POINT SERVER (Express.js) ===== */
require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const { pool } = require("./config/db");
const apiRoutes = require("./routes/api");

const app = express();
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(
  session({
    name: "perpus.sid",
    secret: process.env.SESSION_SECRET || "ganti-dengan-teks-rahasia",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 8 }, // 8 jam
  }),
);

// REST API
app.use("/api", apiRoutes);

// Frontend (hanya folder css/ dan js/ + index.html; folder server/ TIDAK ikut disajikan)
app.use("/css", express.static(path.join(ROOT, "css")));
app.use("/js", express.static(path.join(ROOT, "js")));
app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));

// Penanganan error terpusat
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ pesan: "Format JSON tidak valid." });
  res.status(500).json({ pesan: "Terjadi kesalahan pada server." });
});

pool
  .query("SELECT 1")
  .then(() => console.log("Terhubung ke database."))
  .catch((e) => console.error("PERINGATAN: gagal terhubung ke database ->", e.message));

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
