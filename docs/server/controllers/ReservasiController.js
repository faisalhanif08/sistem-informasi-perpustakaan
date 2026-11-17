/* ===== CONTROLLER (server): Reservasi (SD-05) =====
   Semua pengecekan + penyimpanan dilakukan dalam SATU transaksi database,
   sehingga stok tidak bisa minus walau ada dua pengguna menekan tombol bersamaan. */
const { transaksi } = require("../config/db");
const Buku = require("../models/Buku");
const Pengguna = require("../models/Pengguna");
const Reservasi = require("../models/Reservasi");
const Peminjaman = require("../models/Peminjaman");
const Denda = require("../models/Denda");

const ReservasiController = {
  // POST /api/reservasi  { idBuku }
  async ajukanReservasi(req, res) {
    const idPengguna = req.session.idPengguna;
    if (req.session.peran === "Pustakawan")
      return res.status(403).json({ pesan: "Pustakawan tidak dapat melakukan reservasi." });
    const idBuku = String(req.body?.idBuku ?? "").trim();
    if (!idBuku || idBuku.length > 20)
      return res.status(400).json({ pesan: "ID buku tidak valid." });

    const hasil = await transaksi(async (conn) => {
      // kunci baris buku lebih dulu -> request untuk buku yang sama diproses bergiliran
      const stok = await Buku.cekStok(idBuku, conn);
      if (stok === null) return { kode: 404, hasil: "tidak_ditemukan", pesan: "Buku tidak ditemukan." };

      const { status, kuota } = await Pengguna.cekStatusDanKuota(idPengguna, conn);
      if (!status) return { kode: 403, hasil: "tidak_aktif", pesan: "Akun tidak aktif." };

      const denda = await Denda.punyaDendaBelumLunas(idPengguna, conn);
      if (denda.jumlah > 0)
        return {
          kode: 403,
          hasil: "ada_denda",
          pesan: `Anda masih memiliki denda belum lunas sebesar Rp${denda.total.toLocaleString("id-ID")}. Lunasi denda ke pustakawan sebelum mereservasi buku.`,
        };

      const terpakai =
        (await Reservasi.hitungAktifPengguna(idPengguna, conn)) +
        (await Peminjaman.hitungAktifPengguna(idPengguna, conn));
      if (terpakai >= kuota)
        return { kode: 409, hasil: "kuota_penuh", pesan: "Kuota peminjaman penuh. Reservasi ditolak." };

      if (await Reservasi.sudahMereservasi(idPengguna, idBuku, conn))
        return { kode: 409, hasil: "sudah_reservasi", pesan: "Anda sudah mereservasi buku ini." };

      if (stok <= 0) {
        if (await Reservasi.sudahAntre(idPengguna, idBuku, conn))
          return { kode: 409, hasil: "sudah_antre", pesan: "Anda sudah berada di daftar tunggu buku ini." };
        const idAntrean = await Reservasi.simpanDaftarTunggu(idPengguna, idBuku, conn);
        return { kode: 201, hasil: "daftar_tunggu", idAntrean };
      }

      const r = await Reservasi.simpanReservasi(idPengguna, idBuku, conn);
      const sisa = await Buku.kurangiStok(idBuku, conn);
      return { kode: 201, hasil: "berhasil", stock: sisa, expiresAt: r.expiresAt, idReservasi: r.id };
    });

    const { kode, ...body } = hasil;
    res.status(kode).json(body);
  },

  // GET /api/reservasi  -> reservasi milik pengguna yang login
  async daftarReservasi(req, res) {
    res.json(await Reservasi.cariReservasi(req.session.idPengguna));
  },

  // GET /api/reservasi/statistik
  async statistik(req, res) {
    res.json({ reservasiAktif: await Reservasi.hitungReservasiAktif() });
  },
};

module.exports = ReservasiController;
