/* ===== CONTROLLER (server): Riwayat Peminjaman & Denda (SD-06) ===== */
const { transaksi } = require("../config/db");
const Peminjaman = require("../models/Peminjaman");
const Buku = require("../models/Buku");
const Denda = require("../models/Denda");

const RiwayatController = {
  // GET /api/peminjaman
  async riwayatPeminjaman(req, res) {
    res.json(await Peminjaman.cariRiwayat(req.session.idPengguna));
  },

  // GET /api/peminjaman/statistik?periode=harian
  async statistik(req, res) {
    res.json(await Peminjaman.hitungStatistikTransaksi(req.query.periode || "harian"));
  },

  // GET /api/peminjaman/semua?status=aktif   (khusus Pustakawan)
  async semuaPeminjaman(req, res) {
    const izin = ["aktif", "Terlambat", "Dikembalikan", "semua"];
    const status = izin.includes(req.query.status) ? req.query.status : "aktif";
    res.json(await Peminjaman.daftarSemua(status));
  },

  // POST /api/peminjaman/:id/kembalikan   (khusus Pustakawan)
  // Status peminjaman -> 'Dikembalikan' + tglKembali hari ini, lalu stok buku +1.
  // Dilakukan dalam SATU transaksi agar stok tidak bertambah dua kali.
  async konfirmasiPengembalian(req, res) {
    const id = String(req.params.id || "").trim();
    if (!id || id.length > 20)
      return res.status(400).json({ pesan: "ID peminjaman tidak valid." });

    const hasil = await transaksi(async (conn) => {
      const p = await Peminjaman.ambilUntukPengembalian(id, conn);
      if (!p) return { kode: 404, pesan: "Data peminjaman tidak ditemukan." };
      if (p.status === "Dikembalikan")
        return { kode: 409, pesan: "Buku ini sudah dikonfirmasi dikembalikan." };
      if (!["Dipinjam", "Terlambat"].includes(p.status))
        return { kode: 409, pesan: "Peminjaman ini tidak dalam status dipinjam." };

      const tglKembali = await Peminjaman.tandaiDikembalikan(id, conn);
      const stok = await Buku.tambahStok(p.idBuku, conn);
      // terlambat -> denda otomatis (hari terlambat x dendaPerHari)
      const denda = await Denda.buatJikaTerlambat(id, conn);
      if (denda) await Denda.perbaruiStatusBebasDenda(p.idAnggota, conn);
      return { kode: 200, tglKembali, stok, idBuku: p.idBuku, denda };
    });

    const { kode, ...body } = hasil;
    res.status(kode).json(body);
  },

  // GET /api/denda
  async daftarDenda(req, res) {
    res.json(await Denda.cekDenda(req.session.idPengguna));
  },
};

module.exports = RiwayatController;
