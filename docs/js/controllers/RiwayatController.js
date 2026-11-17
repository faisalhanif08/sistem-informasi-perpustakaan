/* ===== CONTROLLER: Riwayat (SD-06) ===== */
const RiwayatController = {
  // khusus Pustakawan: ambilSemuaPeminjaman(status) -> Peminjaman.daftarSemua(status)
  async ambilSemuaPeminjaman(status) {
    const daftar = await Peminjaman.daftarSemua(status);
    HalamanDaftarPeminjaman.tampilkanDaftar(daftar, status);
  },

  // khusus Pustakawan: konfirmasiPengembalian(idTransaksi) -> Peminjaman.konfirmasiPengembalian()
  async konfirmasiPengembalian(idTransaksi) {
    try {
      const r = await Peminjaman.konfirmasiPengembalian(idTransaksi);
      toast(
        `Pengembalian dikonfirmasi. Stok buku sekarang ${r.stok} eksemplar.` +
          (r.denda ? ` Denda ${rupiah(r.denda.nominal)} (${r.denda.hariTerlambat} hari) dicatat.` : ""),
      );
    } catch (e) {
      toast(e.message, true);
    }
    return this.ambilSemuaPeminjaman(HalamanDaftarPeminjaman.status);
  },

  // ambilRiwayat(idPengguna) -> Peminjaman.cariRiwayat, Reservasi.cariReservasi, Denda.cekDenda
  async ambilRiwayat(idPengguna) {
    const [daftarTransaksi, daftarReservasi, daftarDenda] = await Promise.all([
      Peminjaman.cariRiwayat(idPengguna),
      Reservasi.cariReservasi(idPengguna),
      Denda.cekDenda(idPengguna),
    ]);
    if (!daftarTransaksi.length && !daftarReservasi.length)
      HalamanRiwayat.tampilkanRiwayatKosong();
    else HalamanRiwayat.tampilkanRiwayat(daftarTransaksi, daftarReservasi);
    // denda tetap ditampilkan walau daftar reservasi kosong
    if (daftarDenda.length) {
      HalamanRiwayat.tampilkanInformasiDenda(daftarDenda);
      if (daftarDenda.some((d) => d.statusBayar !== "Lunas"))
        HalamanRiwayat.tampilkanOpsiBayarDenda();
    }
  },
};
