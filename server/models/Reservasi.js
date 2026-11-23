/* ===== MODEL (server): Reservasi =====
   Daftar tunggu disimpan di tabel Reservasi yang sama dengan status 'Menunggu'.
   Batas pengambilan tidak disimpan; dihitung dari tglReservasi + MASA_AMBIL_HARI. */
const { pool } = require("../config/db");
const { buatId } = require("../utils/id");

const MASA_AMBIL_HARI = 2;

// Batas pengambilan hanya berlaku untuk reservasi yang masih 'Aktif'
const BATAS_AMBIL = `IF(r.status = 'Aktif',
  DATE_FORMAT(DATE_ADD(r.tglReservasi, INTERVAL ${MASA_AMBIL_HARI} DAY), '%Y-%m-%d'), '-')`;

// Lama pinjam (hari) dari KonfigurasiSistem, bawaan 7 hari
const LAMA_PINJAM = "COALESCE((SELECT maxHariPinjam FROM KonfigurasiSistem WHERE idKonfigurasi = 1), 7)";

// Batas pengembalian:
//  - 'Disetujui' -> tglJatuhTempo transaksi Peminjaman yang dibuat dari reservasi ini
//  - 'Aktif'     -> perkiraan paling lambat (batas ambil + lama pinjam)
//  - lainnya     -> '-'
const BATAS_KEMBALI = `CASE
  WHEN r.status = 'Disetujui' THEN COALESCE((
    SELECT DATE_FORMAT(p.tglJatuhTempo, '%Y-%m-%d') FROM Peminjaman p
    WHERE p.idAnggota = r.idPengguna AND p.idBuku = r.idBuku AND p.tglPinjam >= r.tglReservasi
    ORDER BY p.tglPinjam ASC, p.idTransaksi ASC LIMIT 1), '-')
  WHEN r.status = 'Aktif' THEN DATE_FORMAT(DATE_ADD(r.tglReservasi,
    INTERVAL (${MASA_AMBIL_HARI} + ${LAMA_PINJAM}) DAY), '%Y-%m-%d')
  ELSE '-' END`;

const Reservasi = {
  async simpanReservasi(idPengguna, idBuku, conn) {
    const id = buatId("RSV");
    await conn.query(
      `INSERT INTO Reservasi (idReservasi, idPengguna, idBuku, status, tglReservasi)
       VALUES (?, ?, ?, 'Aktif', CURDATE())`,
      [id, idPengguna, idBuku],
    );
    const [rows] = await conn.query(
      `SELECT r.idReservasi AS id, r.tglReservasi AS reservedAt, ${BATAS_AMBIL} AS expiresAt,
              ${BATAS_KEMBALI} AS returnBy, ${LAMA_PINJAM} AS lamaPinjam
       FROM Reservasi r WHERE r.idReservasi = ?`,
      [id],
    );
    return rows[0];
  },

  async simpanDaftarTunggu(idPengguna, idBuku, conn) {
    const id = buatId("ANT");
    await conn.query(
      `INSERT INTO Reservasi (idReservasi, idPengguna, idBuku, status, tglReservasi)
       VALUES (?, ?, ?, 'Menunggu', CURDATE())`,
      [id, idPengguna, idBuku],
    );
    return id;
  },

  async sudahMereservasi(idPengguna, idBuku, conn = pool) {
    const [rows] = await conn.query(
      "SELECT 1 FROM Reservasi WHERE idPengguna = ? AND idBuku = ? AND status = 'Aktif' LIMIT 1",
      [idPengguna, idBuku],
    );
    return rows.length > 0;
  },

  async sudahAntre(idPengguna, idBuku, conn = pool) {
    const [rows] = await conn.query(
      "SELECT 1 FROM Reservasi WHERE idPengguna = ? AND idBuku = ? AND status = 'Menunggu' LIMIT 1",
      [idPengguna, idBuku],
    );
    return rows.length > 0;
  },

  async hitungAktifPengguna(idPengguna, conn = pool) {
    const [rows] = await conn.query(
      "SELECT COUNT(*) AS n FROM Reservasi WHERE idPengguna = ? AND status = 'Aktif'",
      [idPengguna],
    );
    return Number(rows[0].n);
  },

  async cariReservasi(idPengguna) {
    const [rows] = await pool.query(
      `SELECT r.idReservasi AS id, r.idBuku AS bookId, b.judul AS bookTitle,
              r.tglReservasi AS reservedAt, ${BATAS_AMBIL} AS expiresAt,
              ${BATAS_KEMBALI} AS returnBy, r.status
       FROM Reservasi r JOIN Buku b ON b.idBuku = r.idBuku
       WHERE r.idPengguna = ? ORDER BY r.tglReservasi DESC, r.idReservasi DESC`,
      [idPengguna],
    );
    return rows;
  },

  // Ketentuan reservasi untuk ditampilkan ke pemustaka di halaman detail buku
  async ketentuan(conn = pool) {
    const [rows] = await conn.query(`SELECT ${LAMA_PINJAM} AS lamaPinjam`);
    return { masaAmbilHari: MASA_AMBIL_HARI, lamaPinjamHari: Number(rows[0].lamaPinjam) };
  },

  async hitungReservasiAktif() {
    const [rows] = await pool.query("SELECT COUNT(*) AS n FROM Reservasi WHERE status = 'Aktif'");
    return Number(rows[0].n);
  },

  /* ---------- Persetujuan oleh Pustakawan ---------- */

  // status: 'proses' (Aktif + Menunggu) | 'Aktif' | 'Menunggu' | 'Disetujui' | 'Ditolak' | 'semua'
  async daftarUntukPersetujuan(status = "proses") {
    const where = [];
    const params = [];
    if (status === "proses") where.push("r.status IN ('Aktif','Menunggu')");
    else if (status && status !== "semua") { where.push("r.status = ?"); params.push(status); }
    const [rows] = await pool.query(
      `SELECT r.idReservasi AS id, r.idPengguna, u.nama AS namaPemustaka,
              r.idBuku AS bookId, b.judul AS bookTitle, b.stokFisik AS stock,
              r.tglReservasi AS reservedAt, ${BATAS_AMBIL} AS expiresAt, r.status
       FROM Reservasi r
       JOIN Buku b ON b.idBuku = r.idBuku
       JOIN Pengguna u ON u.idPengguna = r.idPengguna
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY FIELD(r.status, 'Aktif', 'Menunggu') DESC, r.tglReservasi ASC, r.idReservasi ASC`,
      params,
    );
    return rows;
  },

  async ambil(idReservasi, conn = pool, kunci = false) {
    const [rows] = await conn.query(
      `SELECT idReservasi, idPengguna, idBuku, status, tglReservasi
       FROM Reservasi WHERE idReservasi = ? ${kunci ? "FOR UPDATE" : ""}`,
      [idReservasi],
    );
    return rows[0] || null;
  },

  async ubahStatus(idReservasi, status, conn) {
    await conn.query("UPDATE Reservasi SET status = ? WHERE idReservasi = ?", [status, idReservasi]);
  },
};

module.exports = Reservasi;
