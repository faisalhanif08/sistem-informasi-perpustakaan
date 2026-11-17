/* ===== CONTROLLER: Persetujuan Reservasi (khusus Pustakawan) ===== */
const PersetujuanController = {
  // ambilDaftar(status) -> Reservasi.daftarUntukPersetujuan(status)
  async ambilDaftar(status) {
    const daftar = await Reservasi.daftarUntukPersetujuan(status);
    HalamanPersetujuan.tampilkanDaftar(daftar, status);
  },

  async setujui(idReservasi) {
    try {
      const r = await Reservasi.setujui(idReservasi);
      toast("Reservasi disetujui. Jatuh tempo pengembalian: " + r.tglJatuhTempo + ".");
    } catch (e) {
      toast(e.message, true);
    }
    return this.ambilDaftar(HalamanPersetujuan.status);
  },

  async tolak(idReservasi) {
    try {
      await Reservasi.tolak(idReservasi);
      toast("Reservasi ditolak.");
    } catch (e) {
      toast(e.message, true);
    }
    return this.ambilDaftar(HalamanPersetujuan.status);
  },
};
