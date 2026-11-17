/* ===== MODEL: Pengguna & sesi login (data dari backend) ===== */
const Pengguna = {
  sesi: null, // { idPengguna, nama, peran } bila sudah login

  async muatSesi() {
    try {
      this.sesi = await api("/auth/me");
    } catch (e) {
      this.sesi = null;
    }
    return this.sesi;
  },
  async login(email, password) {
    this.sesi = await api("/auth/login", { method: "POST", body: { email, password } });
    return this.sesi;
  },
  async logout() {
    await api("/auth/logout", { method: "POST" });
    this.sesi = null;
  },
  bacaProfil() {
    return api("/profil");
  },
};
