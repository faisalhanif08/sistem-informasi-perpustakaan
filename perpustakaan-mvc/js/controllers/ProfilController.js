/* ===== CONTROLLER: Profil (SD-03) ===== */
const ProfilController = {
  // ambilProfil(idPengguna) -> Pengguna.bacaProfil(idPengguna)
  async ambilProfil(idPengguna) {
    HalamanProfil.tampilkanProfil(await Pengguna.bacaProfil(idPengguna));
  },
};
