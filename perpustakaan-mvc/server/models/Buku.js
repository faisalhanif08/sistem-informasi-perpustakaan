/* ===== MODEL (server): Buku ===== */
const { pool } = require("../config/db");

// Nama kolom DB -> nama field yang dipakai frontend
const KOLOM = `idBuku AS id, judul AS title, penulis AS author, kategori AS category,
  penerbit AS publisher, tahunTerbit AS year, jumlahHalaman AS pages,
  stokFisik AS stock, isbn, deskripsi AS description`;

const URUTAN = {
  judul: "judul ASC",
  penulis: "penulis ASC",
  tahun: "tahunTerbit DESC",
  terbaru: "idBuku DESC",
};

const Buku = {
  async daftarFilter() {
    const [kat] = await pool.query("SELECT DISTINCT kategori FROM Buku ORDER BY kategori");
    const [pen] = await pool.query("SELECT DISTINCT penulis FROM Buku ORDER BY penulis");
    const [thn] = await pool.query("SELECT DISTINCT tahunTerbit FROM Buku ORDER BY tahunTerbit DESC");
    return {
      categories: kat.map((r) => r.kategori),
      authors: pen.map((r) => r.penulis),
      years: thn.map((r) => r.tahunTerbit),
    };
  },

  async cari(kataKunci, filter = {}) {
    const where = [];
    const params = [];
    if (kataKunci) {
      where.push("(judul LIKE ? OR penulis LIKE ? OR isbn LIKE ?)");
      const k = `%${kataKunci}%`;
      params.push(k, k, k);
    }
    if (filter.kategori) { where.push("kategori = ?"); params.push(filter.kategori); }
    if (filter.penulis) { where.push("penulis = ?"); params.push(filter.penulis); }
    if (filter.tahun) { where.push("tahunTerbit = ?"); params.push(filter.tahun); }
    const order = URUTAN[filter.urut] || URUTAN.terbaru;
    const sql = `SELECT ${KOLOM} FROM Buku
      ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order}`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async ambilDetailDanStok(idBuku) {
    const [rows] = await pool.query(`SELECT ${KOLOM} FROM Buku WHERE idBuku = ?`, [idBuku]);
    return rows[0] || null;
  },

  // Dipakai di dalam transaksi: kunci baris buku agar stok tidak balapan
  async cekStok(idBuku, conn) {
    const [rows] = await conn.query("SELECT stokFisik FROM Buku WHERE idBuku = ? FOR UPDATE", [idBuku]);
    return rows.length ? Number(rows[0].stokFisik) || 0 : null;
  },

  async kurangiStok(idBuku, conn) {
    await conn.query("UPDATE Buku SET stokFisik = stokFisik - 1 WHERE idBuku = ? AND stokFisik > 0", [idBuku]);
    const [rows] = await conn.query("SELECT stokFisik FROM Buku WHERE idBuku = ?", [idBuku]);
    return rows[0].stokFisik;
  },

  // Mengembalikan 1 eksemplar (mis. reservasi ditolak)
  async tambahStok(idBuku, conn) {
    await conn.query("UPDATE Buku SET stokFisik = stokFisik + 1 WHERE idBuku = ?", [idBuku]);
    const [rows] = await conn.query("SELECT stokFisik FROM Buku WHERE idBuku = ?", [idBuku]);
    return rows[0].stokFisik;
  },

  // Khusus Pustakawan: ubah stok sebanyak `selisih` (positif = tambah, negatif = kurangi).
  // Mengembalikan stok baru, null bila buku tidak ada, atau false bila stok akan menjadi minus.
  async ubahStok(idBuku, selisih) {
    const [hasil] = await pool.query(
      "UPDATE Buku SET stokFisik = COALESCE(stokFisik, 0) + ? WHERE idBuku = ? AND COALESCE(stokFisik, 0) + ? >= 0",
      [selisih, idBuku, selisih],
    );
    const [rows] = await pool.query("SELECT stokFisik FROM Buku WHERE idBuku = ?", [idBuku]);
    if (!rows.length) return null;
    if (!hasil.affectedRows) return false;
    return Number(rows[0].stokFisik) || 0;
  },

  async hitungKetersediaanBuku() {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS totalJudul, COALESCE(SUM(stokFisik), 0) AS totalEksemplar FROM Buku",
    );
    return { totalJudul: Number(rows[0].totalJudul), totalEksemplar: Number(rows[0].totalEksemplar) };
  },
};

module.exports = Buku;
