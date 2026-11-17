/* ===== CONTROLLER: Denda (khusus Pustakawan) ===== */
const DendaController = {
  // ambilDaftar(status) -> Denda.daftarSemua(status)
  async ambilDaftar(status) {
    const daftar = await Denda.daftarSemua(status);
    HalamanDenda.tampilkanDaftar(daftar, status);
  },

  // tandaiLunas(idDenda) -> Denda.tandaiLunas(idDenda)
  async tandaiLunas(idDenda) {
    try {
      const r = await Denda.tandaiLunas(idDenda);
      toast(`Denda ${rupiah(r.nominal)} ditandai lunas.`);
    } catch (e) {
      toast(e.message, true);
    }
    return this.ambilDaftar(HalamanDenda.status);
  },
};
