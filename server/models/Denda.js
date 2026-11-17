/* ===== MODEL (server): Denda =====
   Tabel Denda tidak menyimpan idPengguna; pemiliknya dicari lewat
   Peminjaman.idAnggota (Denda.idTransaksi -> Peminjaman.idTransaksi).
   Nominal = hari terlambat x KonfigurasiSistem.dendaPerHari.
   statusBayar: 'Belum Lunas' | 'Lunas'. */
const { pool } = require("../config/db");
const { buatId } = require("../utils/id");

// Kolom yang dipakai saat menampilkan denda (pemustaka & pustakawan)
const KOLOM = `d.idDenda AS id, d.idTransaksi AS idPeminjaman, d.nominalDenda AS jumlah,
  d.statusBayar, b.idBuku AS bookId, b.judul AS bookTitle,
  p.tglJatuhTempo, p.tglKembali,
  GREATEST(DATEDIFF(p.tglKembali, p.tglJatuhTempo), 0) AS hariTerlambat`;

const rapikan = (r) => ({
  ...r,
  jumlah: Number(r.jumlah) || 0,
  hariTerlambat: Number(r.hariTerlambat) || 0,
});

const Denda = {
  // Tarif denda per hari dari KonfigurasiSistem (bawaan Rp1.000)
  async tarifPerHari(conn = pool) {
    const [rows] = await conn.query(
      "SELECT dendaPerHari FROM KonfigurasiSistem WHERE idKonfigurasi = 1",
    );
    const t = Number(rows[0]?.dendaPerHari);
    return Number.isFinite(t) && t >= 0 ? t : 1000;
  },

  // Seluruh denda milik seorang pemustaka (belum lunas ditampilkan lebih dulu)
  async cekDenda(idPengguna) {
    const [rows] = await pool.query(
      `SELECT ${KOLOM}
       FROM Denda d
       JOIN Peminjaman p ON p.idTransaksi = d.idTransaksi
       JOIN Buku b ON b.idBuku = p.idBuku
       WHERE p.idAnggota = ?
       ORDER BY (d.statusBayar = 'Lunas') ASC, p.tglKembali DESC, d.idDenda DESC`,
      [idPengguna],
    );
    return rows.map(rapikan);
  },

  /* ---------- dipakai saat pustakawan mengonfirmasi pengembalian ---------- */
  // Buat denda bila buku dikembalikan melewati jatuh tempo. Panggil SETELAH
  // Peminjaman.tandaiDikembalikan (tglKembali sudah terisi). Return null bila tidak terlambat.
  async buatJikaTerlambat(idTransaksi, conn) {
    const [rows] = await conn.query(
      `SELECT GREATEST(DATEDIFF(tglKembali, tglJatuhTempo), 0) AS hari
       FROM Peminjaman WHERE idTransaksi = ?`,
      [idTransaksi],
    );
    const hariTerlambat = Number(rows[0]?.hari) || 0;
    if (hariTerlambat <= 0) return null;

    const nominal = hariTerlambat * (await this.tarifPerHari(conn));
    if (nominal <= 0) return null;
    const idDenda = buatId("DND");
    await conn.query(
      `INSERT INTO Denda (idDenda, idTransaksi, nominalDenda, statusBayar)
       VALUES (?, ?, ?, 'Belum Lunas')`,
      [idDenda, idTransaksi, nominal],
    );
    return { idDenda, hariTerlambat, nominal };
  },

  // Pemustaka.statusBebasDenda = TRUE bila tidak punya denda yang belum lunas
  async perbaruiStatusBebasDenda(idPengguna, conn = pool) {
    await conn.query(
      `UPDATE Pemustaka SET statusBebasDenda = NOT EXISTS (
         SELECT 1 FROM Denda d JOIN Peminjaman p ON p.idTransaksi = d.idTransaksi
         WHERE p.idAnggota = ? AND d.statusBayar <> 'Lunas'
       ) WHERE idPengguna = ?`,
      [idPengguna, idPengguna],
    );
  },

  async punyaDendaBelumLunas(idPengguna, conn = pool) {
    const [rows] = await conn.query(
      `SELECT COUNT(*) AS n, COALESCE(SUM(d.nominalDenda), 0) AS total
       FROM Denda d JOIN Peminjaman p ON p.idTransaksi = d.idTransaksi
       WHERE p.idAnggota = ? AND d.statusBayar <> 'Lunas'`,
      [idPengguna],
    );
    return { jumlah: Number(rows[0].n), total: Number(rows[0].total) };
  },

  /* ---------- Khusus Pustakawan ---------- */
  // status: 'Belum Lunas' | 'Lunas' | 'semua'
  async daftarSemua(status = "Belum Lunas") {
    const where = [];
    const params = [];
    if (status === "Lunas") where.push("d.statusBayar = 'Lunas'");
    else if (status === "Belum Lunas") where.push("d.statusBayar <> 'Lunas'");
    const [rows] = await pool.query(
      `SELECT ${KOLOM}, p.idAnggota, a.nama AS namaPemustaka, a.email AS emailPemustaka
       FROM Denda d
       JOIN Peminjaman p ON p.idTransaksi = d.idTransaksi
       JOIN Buku b ON b.idBuku = p.idBuku
       JOIN Pengguna a ON a.idPengguna = p.idAnggota
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY (d.statusBayar = 'Lunas') ASC, p.tglKembali DESC, d.idDenda DESC`,
      params,
    );
    return rows.map(rapikan);
  },

  // Dipakai di dalam transaksi: kunci baris denda agar tidak dilunasi dua kali
  async ambilUntukPelunasan(idDenda, conn) {
    const [rows] = await conn.query(
      `SELECT d.idDenda, d.statusBayar, d.nominalDenda, p.idAnggota
       FROM Denda d JOIN Peminjaman p ON p.idTransaksi = d.idTransaksi
       WHERE d.idDenda = ? FOR UPDATE`,
      [idDenda],
    );
    return rows[0] || null;
  },

  async tandaiLunas(idDenda, conn) {
    await conn.query("UPDATE Denda SET statusBayar = 'Lunas' WHERE idDenda = ?", [idDenda]);
  },
};

module.exports = Denda;
