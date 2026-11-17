/* ===== CONTROLLER: Dashboard (SD-09) ===== */
const DashboardController = {
  // ambilRingkasan(periode)
  async ambilRingkasan(periode) {
    const [transaksi, stok, reservasiAktif] = await Promise.all([
      Peminjaman.hitungStatistikTransaksi(periode),
      Buku.hitungKetersediaanBuku(),
      Reservasi.hitungReservasiAktif(),
    ]);
    const statistik = {
      totalJudul: stok.totalJudul,
      totalEksemplar: stok.totalEksemplar,
      reservasiAktif,
      peminjamanAktif: transaksi.peminjamanAktif,
    };
    HalamanDashboard.tampilkanAngkaDasar(statistik);
  },
};
