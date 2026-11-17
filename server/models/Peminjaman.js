/* ===== MODEL (server): Peminjaman =====
   idAnggota = Pemustaka peminjam, idPengguna = Pustakawan yang memproses. */
const { pool } = require("../config/db");
const { buatId } = require("../utils/id");

const Peminjaman = {
  // Membuat transaksi peminjaman (dipakai saat pustakawan menyetujui reservasi).
  // Jatuh tempo = hari ini + KonfigurasiSistem.maxHariPinjam (bawaan 7 hari).
  async simpanPeminjaman({ idAnggota, idBuku, idPustakawan }, conn) {
    const [cfg] = await conn.query(
      "SELECT maxHariPinjam FROM KonfigurasiSistem WHERE idKonfigurasi = 1",
    );
    const lamaPinjam = Number(cfg[0]?.maxHariPinjam) || 7;
    const id = buatId("TRX");
    await conn.query(
      `INSERT INTO Peminjaman (idTransaksi, idAnggota, idBuku, tglPinjam, tglJatuhTempo, status, idPengguna)
       VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Dipinjam', ?)`,
      [id, idAnggota, idBuku, lamaPinjam, idPustakawan],
    );
    // kolom Pustakawan.idTransaksi (PDF) -> transaksi terakhir yang diproses
    await conn.query("UPDATE Pustakawan SET idTransaksi = ? WHERE idPengguna = ?", [id, idPustakawan]);
    const [rows] = await conn.query(
      "SELECT idTransaksi, tglPinjam, tglJatuhTempo FROM Peminjaman WHERE idTransaksi = ?",
      [id],
    );
    return rows[0];
  },

  async cariRiwayat(idPengguna) {
    const [rows] = await pool.query(
      `SELECT p.idTransaksi AS id, p.idBuku AS bookId, b.judul AS bookTitle,
              p.tglPinjam, p.tglJatuhTempo, p.tglKembali, p.status
       FROM Peminjaman p JOIN Buku b ON b.idBuku = p.idBuku
       WHERE p.idAnggota = ? ORDER BY p.tglPinjam DESC, p.idTransaksi DESC`,
      [idPengguna],
    );
    return rows;
  },

  /* ---------- Khusus Pustakawan: seluruh peminjaman semua pemustaka ----------
     status: 'aktif' (Dipinjam + Terlambat) | 'Terlambat' | 'Dikembalikan' | 'semua'
     Peminjaman 'Dipinjam' yang sudah lewat jatuh tempo ditampilkan sebagai 'Terlambat'. */
  async daftarSemua(status = "aktif") {
    const STATUS = `CASE WHEN p.status = 'Dipinjam' AND p.tglJatuhTempo < CURDATE()
                         THEN 'Terlambat' ELSE p.status END`;
    const where = [];
    if (status === "aktif") where.push("p.status IN ('Dipinjam','Terlambat')");
    else if (status === "Terlambat") where.push(`${STATUS} = 'Terlambat'`);
    else if (status === "Dikembalikan") where.push("p.status = 'Dikembalikan'");
    const [rows] = await pool.query(
      `SELECT p.idTransaksi AS id, p.idAnggota, a.nama AS namaPemustaka, a.email AS emailPemustaka,
              p.idBuku AS bookId, b.judul AS bookTitle, b.penulis AS bookAuthor,
              p.tglPinjam, p.tglJatuhTempo, p.tglKembali, ${STATUS} AS status,
              GREATEST(DATEDIFF(CURDATE(), p.tglJatuhTempo), 0) AS hariTerlambat,
              COALESCE(k.dendaPerHari, 1000) AS dendaPerHari,
              s.nama AS namaPetugas
       FROM Peminjaman p
       LEFT JOIN KonfigurasiSistem k ON k.idKonfigurasi = 1
       JOIN Pengguna a ON a.idPengguna = p.idAnggota
       JOIN Buku b ON b.idBuku = p.idBuku
       LEFT JOIN Pengguna s ON s.idPengguna = p.idPengguna
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY a.nama ASC, p.tglPinjam DESC, p.idTransaksi DESC`,
    );
    return rows.map((r) => {
      const hariTerlambat = r.status === "Terlambat" ? Number(r.hariTerlambat) : 0;
      const { dendaPerHari, ...data } = r;
      // perkiraan denda bila dikembalikan hari ini (ditampilkan di dialog konfirmasi)
      return { ...data, hariTerlambat, perkiraanDenda: hariTerlambat * Number(dendaPerHari) };
    });
  },

  /* ---------- Khusus Pustakawan: konfirmasi pengembalian buku ---------- */
  // Dipakai di dalam transaksi: kunci baris peminjaman agar tidak dikonfirmasi dua kali
  async ambilUntukPengembalian(idTransaksi, conn) {
    const [rows] = await conn.query(
      "SELECT idTransaksi, idAnggota, idBuku, status FROM Peminjaman WHERE idTransaksi = ? FOR UPDATE",
      [idTransaksi],
    );
    return rows[0] || null;
  },

  async tandaiDikembalikan(idTransaksi, conn) {
    await conn.query(
      "UPDATE Peminjaman SET status = 'Dikembalikan', tglKembali = CURDATE() WHERE idTransaksi = ?",
      [idTransaksi],
    );
    const [rows] = await conn.query(
      "SELECT tglKembali FROM Peminjaman WHERE idTransaksi = ?",
      [idTransaksi],
    );
    return rows[0].tglKembali;
  },

  async hitungAktifPengguna(idPengguna, conn = pool) {
    const [rows] = await conn.query(
      "SELECT COUNT(*) AS n FROM Peminjaman WHERE idAnggota = ? AND status IN ('Dipinjam','Terlambat')",
      [idPengguna],
    );
    return Number(rows[0].n);
  },

  async hitungStatistikTransaksi(periode) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS n FROM Peminjaman WHERE status IN ('Dipinjam','Terlambat')",
    );
    return { peminjamanAktif: Number(rows[0].n), periode };
  },
};

module.exports = Peminjaman;
