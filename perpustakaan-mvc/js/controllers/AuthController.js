/* ===== CONTROLLER: Autentikasi (login / logout) ===== */
const AuthController = {
  async login(email, password) {
    try {
      const p = await Pengguna.login(email, password);
      tampilkanPenggunaHeader();
      toast("Selamat datang, " + p.nama + "!");
      location.hash = sessionStorage.getItem("setelahLogin") || "#/";
      sessionStorage.removeItem("setelahLogin");
    } catch (e) {
      HalamanLogin.tampilkanGagal(e.message);
    }
  },
  async logout() {
    try {
      await Pengguna.logout();
    } catch (e) {}
    tampilkanPenggunaHeader();
    toast("Anda telah logout.");
    location.hash = "#/login";
  },
};
