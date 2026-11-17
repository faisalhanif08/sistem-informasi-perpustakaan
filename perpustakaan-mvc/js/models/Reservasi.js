/* ===== MODEL: Reservasi (data dari backend /api/reservasi) ===== */
const Reservasi = {
  // Server melakukan cek status, kuota, stok, lalu menyimpan reservasi / daftar tunggu.
  // -> { hasil: "berhasil" | "daftar_tunggu", stock?, expiresAt? }
  simpanReservasi(idBuku) {
    return api("/reservasi", { method: "POST", body: { idBuku: String(idBuku) } });
  },
  cariReservasi() {
    return api("/reservasi");
  },
  async hitungReservasiAktif() {
    return (await api("/reservasi/statistik")).reservasiAktif;
  },

  /* ---- khusus Pustakawan ---- */
  // status: proses | Aktif | Menunggu | Disetujui | Ditolak | semua
  daftarUntukPersetujuan(status) {
    return api("/persetujuan/reservasi?status=" + encodeURIComponent(status || "proses"));
  },
  setujui(idReservasi) {
    return api("/persetujuan/reservasi/" + encodeURIComponent(idReservasi) + "/setujui", { method: "POST" });
  },
  tolak(idReservasi) {
    return api("/persetujuan/reservasi/" + encodeURIComponent(idReservasi) + "/tolak", { method: "POST" });
  },
};
