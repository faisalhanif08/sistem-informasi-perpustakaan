/* ===== SCRIPT: membuat database, tabel, dan data awal =====
   Pemakaian:  npm run db:init
   PERINGATAN: semua tabel lama akan DIHAPUS lalu dibuat ulang. */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  const dbName = process.env.DB_NAME || "perpustakaan";
  const baca = (f) =>
    fs
      .readFileSync(path.join(__dirname, "../../database", f), "utf8")
      // ganti nama database bawaan bila DB_NAME di .env berbeda
      .replace(/(CREATE DATABASE IF NOT EXISTS|USE)\s+perpustakaan\b/g, `$1 \`${dbName}\``);

  console.log(`Membuat database "${dbName}" ...`);
  await conn.query(baca("schema.sql"));
  console.log("Mengisi data awal ...");
  await conn.query(baca("seed.sql"));
  await conn.end();
  console.log("Selesai. Database siap dipakai.");
})().catch((e) => {
  console.error("Gagal inisialisasi database:", e.message);
  process.exit(1);
});
