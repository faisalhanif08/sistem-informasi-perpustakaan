/* ===== VIEW: HalamanDashboard (SD-09) ===== */
const HalamanDashboard = {
  bukaDashboard() {
    return DashboardController.ambilRingkasan("harian");
  },
  tampilkanAngkaDasar(s) {
    app.innerHTML = `<h1>Dashboard</h1><p class="sub">Ringkasan perpustakaan.</p>
    <div class="stats">
      <div class="card">Total Judul Buku<b>${s.totalJudul}</b></div>
      <div class="card">Eksemplar Tersedia<b>${s.totalEksemplar}</b></div>
      <div class="card">Reservasi Aktif<b>${s.reservasiAktif}</b></div>
      <div class="card">Peminjaman Aktif<b>${s.peminjamanAktif}</b></div>
    </div>`;
  },
};
