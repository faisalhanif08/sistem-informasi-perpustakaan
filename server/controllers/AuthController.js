/* ===== CONTROLLER (server): Autentikasi (login / logout / sesi) ===== */
const bcrypt = require("bcryptjs");
const Pengguna = require("../models/Pengguna");

const AuthController = {
  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ pesan: "Email dan password wajib diisi." });

    const p = await Pengguna.cariByEmail(String(email).trim().toLowerCase());
    const cocok = p && (await bcrypt.compare(String(password), p.password || ""));
    if (!cocok) return res.status(401).json({ pesan: "Email atau password salah." });

    // buat sesi baru (hindari session fixation)
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ pesan: "Gagal membuat sesi." });
      req.session.idPengguna = p.idPengguna;
      req.session.peran = p.tipeUser;
      res.json({ idPengguna: p.idPengguna, nama: p.nama, peran: p.tipeUser });
    });
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie("perpus.sid");
      res.json({ pesan: "Logout berhasil." });
    });
  },

  async sesiSaatIni(req, res) {
    if (!req.session.idPengguna) return res.status(401).json({ pesan: "Belum login." });
    const p = await Pengguna.bacaProfil(req.session.idPengguna);
    if (!p) return res.status(401).json({ pesan: "Belum login." });
    res.json({ idPengguna: p.idPengguna, nama: p.nama, peran: p.peran });
  },
};

module.exports = AuthController;
