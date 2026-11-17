/* ===== CONTROLLER: Reservasi (SD-05) =====
   Pengecekan status login, kuota, duplikasi, dan stok kini dilakukan di server
   (server/controllers/ReservasiController.js) di dalam satu transaksi database.
   Controller ini meneruskan permintaan lalu memilih tampilan sesuai hasilnya. */
const ReservasiController = {
  // ajukanReservasi(idPengguna, idBuku)
  async ajukanReservasi(idPengguna, idBuku) {
    if (!idPengguna) return HalamanDetailBuku.mintaLogin();
    try {
      const r = await Reservasi.simpanReservasi(idBuku);
      if (r.hasil === "daftar_tunggu") return HalamanDetailBuku.tampilkanDaftarTunggu();
      HalamanDetailBuku.konfirmasiReservasi({ stock: r.stock, expiresAt: r.expiresAt });
    } catch (e) {
      const hasil = e.data && e.data.hasil;
      if (e.status === 401) return HalamanDetailBuku.mintaLogin();
      if (hasil === "kuota_penuh") return HalamanDetailBuku.tampilkanKuotaPenuh();
      HalamanDetailBuku.tampilkanStatus(e.message, true);
    }
  },
};
