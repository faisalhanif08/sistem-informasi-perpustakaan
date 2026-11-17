/* ===== KONFIGURASI KONEKSI DATABASE (MySQL / MariaDB) ===== */
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "perpustakaan",
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // kolom DATE dikembalikan sebagai "YYYY-MM-DD"
});

// Jalankan fn(conn) di dalam satu transaksi; commit bila sukses, rollback bila error.
async function transaksi(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hasil = await fn(conn);
    await conn.commit();
    return hasil;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { pool, transaksi };
