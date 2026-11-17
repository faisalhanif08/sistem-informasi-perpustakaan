/* ===== MODEL: Denda (data dari backend /api/denda) ===== */
const Denda = {
  // denda milik pemustaka yang login
  cekDenda() {
    return api("/denda");
  },
  // khusus Pustakawan -> status: Belum Lunas | Lunas | semua
  daftarSemua(status) {
    return api("/denda/semua?status=" + encodeURIComponent(status || "Belum Lunas"));
  },
  // khusus Pustakawan -> { idDenda, nominal }
  tandaiLunas(idDenda) {
    return api("/denda/" + encodeURIComponent(idDenda) + "/lunas", { method: "POST" });
  },
};
