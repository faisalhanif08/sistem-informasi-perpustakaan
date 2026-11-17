/* ===== ENTRY POINT: wiring header & mulai aplikasi ===== */
function tampilkanPenggunaHeader() {
  const p = Pengguna.sesi;
  $("#userInfo").innerHTML = p
    ? esc(p.nama) + "<small>" + esc(p.peran) + "</small>"
    : "Tamu<small>Belum login</small>";
  $("#logout").innerHTML = p ? "🚪 <span>Logout</span>" : "🔑 <span>Login</span>";
  // menu khusus pustakawan
  $("#navPersetujuan").hidden = !(p && p.peran === "Pustakawan");
  $("#navDenda").hidden = !(p && p.peran === "Pustakawan");
}

$("#hq").onkeydown = (e) => {
  if (e.key !== "Enter") return;
  state.q = e.target.value.trim();
  state.page = 1;
  if ((location.hash || "#/") === "#/") route();
  else location.hash = "#/";
};
$("#logout").onclick = () => {
  if (Pengguna.sesi) AuthController.logout();
  else location.hash = "#/login";
};

(async () => {
  await Pengguna.muatSesi();
  tampilkanPenggunaHeader();
  route();
})();
