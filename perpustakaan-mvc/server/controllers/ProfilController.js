/* ===== CONTROLLER (server): Profil (SD-03) ===== */
const Pengguna = require("../models/Pengguna");

const ProfilController = {
  // GET /api/profil
  async ambilProfil(req, res) {
    const p = await Pengguna.bacaProfil(req.session.idPengguna);
    if (!p) return res.status(404).json({ pesan: "Pengguna tidak ditemukan." });
    res.json(p);
  },
};

module.exports = ProfilController;
