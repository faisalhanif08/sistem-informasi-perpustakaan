/* ===== VIEW: HalamanLogin ===== */
const HalamanLogin = {
  render() {
    app.innerHTML = `
    <div class="card loginbox">
      <h1>Masuk</h1>
      <p class="sub">Login untuk mereservasi buku dan melihat riwayat peminjaman.</p>
      <form id="formLogin">
        <label>Email<input id="email" type="email" autocomplete="username" required></label>
        <label>Password<input id="password" type="password" autocomplete="current-password" required></label>
        <button class="btn primary block" id="btnLogin">Login</button>
      </form>
      <p class="hint">Akun demo: <b>pemustaka@perpus.test</b> / <b>pemustaka123</b></p>
    </div>`;
    $("#formLogin").onsubmit = (e) => {
      e.preventDefault();
      $("#btnLogin").disabled = true;
      AuthController.login($("#email").value.trim(), $("#password").value);
    };
    $("#email").focus();
  },
  tampilkanGagal(pesan) {
    $("#btnLogin").disabled = false;
    toast(pesan, true);
  },
};
