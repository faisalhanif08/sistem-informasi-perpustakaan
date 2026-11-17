/* ===== CONTROLLER (server): Persetujuan Reservasi oleh Pustakawan =====
   Setujui : reservasi -> 'Disetujui' + dibuat transaksi Peminjaman ('Dipinjam').
             Reservasi 'Menunggu' (daftar tunggu) hanya bisa disetujui bila stok
             sudah tersedia; stok lalu dikurangi 1.
   Tolak   : reservasi -> 'Ditolak'. Bila sebelumnya 'Aktif', eksemplar yang
             sudah disisihkan dikembalikan ke stok.
   Semua langkah dijalankan dalam satu transaksi. Urutan penguncian sama dengan
   ReservasiController (baris Buku dulu, lalu Reservasi) agar tidak deadlock. */
const { transaksi } = require("../config/db");
const Buku = require("../models/Buku");
const Pengguna = require("../models/Pengguna");
const Reservasi = require("../models/Reservasi");
const Peminjaman = require("../models/Peminjaman");

const STATUS_FILTER = ["proses", "semua", "Aktif", "Menunggu", "Disetujui", "Ditolak"];

function idValid(id) {
  return typeof id === "string" && id.length > 0 && id.length <= 20;
}

// Kunci baris buku & reservasi, lalu kembalikan reservasi terbaru (atau null)
async function kunciReservasi(idReservasi, conn) {
  const awal = await Reservasi.ambil(idReservasi, conn);
  if (!awal) return null;
  await Buku.cekStok(awal.idBuku, conn); // SELECT ... FOR UPDATE pada Buku
  return Reservasi.ambil(idReservasi, conn, true);
}

const PersetujuanController = {
  // GET /api/persetujuan/reservasi?status=proses
  async daftar(req, res) {
    const status = STATUS_FILTER.includes(req.query.status) ? req.query.status : "proses";
    res.json(await Reservasi.daftarUntukPersetujuan(status));
  },

  // POST /api/persetujuan/reservasi/:id/setujui
  async setujui(req, res) {
    const id = String(req.params.id || "");
    if (!idValid(id)) return res.status(400).json({ pesan: "ID reservasi tidak valid." });

    const hasil = await transaksi(async (conn) => {
      const r = await kunciReservasi(id, conn);
      if (!r) return { kode: 404, hasil: "tidak_ditemukan", pesan: "Reservasi tidak ditemukan." };

      if (r.status === "Menunggu") {
        const stok = await Buku.cekStok(r.idBuku, conn);
        if (stok <= 0)
          return { kode: 409, hasil: "stok_habis", pesan: "Stok buku masih habis. Reservasi belum bisa disetujui." };
        const { kuota } = await Pengguna.cekStatusDanKuota(r.idPengguna, conn);
        const terpakai =
          (await Reservasi.hitungAktifPengguna(r.idPengguna, conn)) +
          (await Peminjaman.hitungAktifPengguna(r.idPengguna, conn));
        if (terpakai >= kuota)
          return { kode: 409, hasil: "kuota_penuh", pesan: "Kuota pinjam pemustaka sudah penuh." };
        await Buku.kurangiStok(r.idBuku, conn);
      } else if (r.status !== "Aktif") {
        return { kode: 409, hasil: "sudah_diproses", pesan: `Reservasi sudah berstatus ${r.status}.` };
      }

      const pinjam = await Peminjaman.simpanPeminjaman(
        { idAnggota: r.idPengguna, idBuku: r.idBuku, idPustakawan: req.session.idPengguna },
        conn,
      );
      await Reservasi.ubahStatus(id, "Disetujui", conn);
      return {
        kode: 200,
        hasil: "disetujui",
        idTransaksi: pinjam.idTransaksi,
        tglJatuhTempo: pinjam.tglJatuhTempo,
      };
    });

    const { kode, ...body } = hasil;
    res.status(kode).json(body);
  },

  // POST /api/persetujuan/reservasi/:id/tolak
  async tolak(req, res) {
    const id = String(req.params.id || "");
    if (!idValid(id)) return res.status(400).json({ pesan: "ID reservasi tidak valid." });

    const hasil = await transaksi(async (conn) => {
      const r = await kunciReservasi(id, conn);
      if (!r) return { kode: 404, hasil: "tidak_ditemukan", pesan: "Reservasi tidak ditemukan." };
      if (r.status !== "Aktif" && r.status !== "Menunggu")
        return { kode: 409, hasil: "sudah_diproses", pesan: `Reservasi sudah berstatus ${r.status}.` };

      let stock;
      if (r.status === "Aktif") stock = await Buku.tambahStok(r.idBuku, conn);
      await Reservasi.ubahStatus(id, "Ditolak", conn);
      return { kode: 200, hasil: "ditolak", stock };
    });

    const { kode, ...body } = hasil;
    res.status(kode).json(body);
  },
};

module.exports = PersetujuanController;
