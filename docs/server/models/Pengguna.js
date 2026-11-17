/* ===== MODEL (server): Pengguna (+ Pemustaka, KonfigurasiSistem) ===== */
const { pool } = require("../config/db");

const Pengguna = {
  async cariByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM Pengguna WHERE email = ?", [email]);
    return rows[0] || null;
  },

  // kuotaPinjam diambil dari tabel Pemustaka; pengguna lain memakai
  // maxBukuPinjam dari KonfigurasiSistem.
  async bacaProfil(idPengguna) {
    const [rows] = await pool.query(
      `SELECT u.idPengguna, u.nama, u.email, u.tipeUser AS peran,
              COALESCE(pm.kuotaPinjam, k.maxBukuPinjam, 0) AS kuotaPinjam,
              pm.statusBebasDenda
       FROM Pengguna u
       LEFT JOIN Pemustaka pm ON pm.idPengguna = u.idPengguna
       LEFT JOIN KonfigurasiSistem k ON k.idKonfigurasi = 1
       WHERE u.idPengguna = ?`,
      [idPengguna],
    );
    const p = rows[0];
    if (!p) return null;
    return {
      ...p,
      kuotaPinjam: Number(p.kuotaPinjam),
      statusBebasDenda: p.statusBebasDenda === null ? null : !!p.statusBebasDenda,
    };
  },

  async cekStatusDanKuota(idPengguna, conn = pool) {
    const [rows] = await conn.query(
      `SELECT COALESCE(pm.kuotaPinjam, k.maxBukuPinjam, 0) AS kuota
       FROM Pengguna u
       LEFT JOIN Pemustaka pm ON pm.idPengguna = u.idPengguna
       LEFT JOIN KonfigurasiSistem k ON k.idKonfigurasi = 1
       WHERE u.idPengguna = ?`,
      [idPengguna],
    );
    const p = rows[0];
    return { status: !!p, kuota: p ? Number(p.kuota) : 0 };
  },
};

module.exports = Pengguna;
