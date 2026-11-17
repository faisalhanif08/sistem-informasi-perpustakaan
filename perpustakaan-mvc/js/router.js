/* ===== ROUTER ===== */
const HALAMAN_WAJIB_LOGIN = ["dashboard", "peminjaman", "profil", "persetujuan", "denda"];

async function route() {
  const h = location.hash || "#/";
  let key = "katalog";
  if (h.startsWith("#/dashboard")) key = "dashboard";
  else if (h.startsWith("#/peminjaman")) key = "peminjaman";
  else if (h.startsWith("#/profil")) key = "profil";
  else if (h.startsWith("#/persetujuan")) key = "persetujuan";
  else if (h.startsWith("#/denda")) key = "denda";
  else if (h.startsWith("#/login")) key = "login";
  document
    .querySelectorAll("nav a[data-r]")
    .forEach((a) => a.classList.toggle("active", a.dataset.r === key));
  window.scrollTo(0, 0);

  if (HALAMAN_WAJIB_LOGIN.includes(key) && !Pengguna.sesi) {
    sessionStorage.setItem("setelahLogin", h);
    location.hash = "#/login";
    return;
  }

  app.innerHTML = "<p>Memuat...</p>";
  try {
    if (key === "login") HalamanLogin.render();
    else if (h.startsWith("#/buku/")) await HalamanKatalog.muatDetail(decodeURIComponent(h.split("/")[2]));
    else if (key === "dashboard") await HalamanDashboard.bukaDashboard();
    else if (key === "peminjaman")
      Pengguna.sesi.peran === "Pustakawan"
        ? await HalamanDaftarPeminjaman.bukaDaftar()
        : await HalamanRiwayat.bukaRiwayat();
    else if (key === "profil") await HalamanProfil.bukaProfil();
    else if (key === "persetujuan")
      Pengguna.sesi.peran === "Pustakawan"
        ? await HalamanPersetujuan.bukaPersetujuan()
        : HalamanPersetujuan.tampilkanKhususPustakawan();
    else if (key === "denda")
      Pengguna.sesi.peran === "Pustakawan"
        ? await HalamanDenda.bukaDenda()
        : HalamanDenda.tampilkanKhususPustakawan();
    else await HalamanKatalog.render();
  } catch (e) {
    if (e.status === 401) {
      Pengguna.sesi = null;
      tampilkanPenggunaHeader();
      sessionStorage.setItem("setelahLogin", h);
      location.hash = "#/login";
      return;
    }
    app.innerHTML = "<p>" + esc(e.message) + "</p>";
  }
}
window.addEventListener("hashchange", route);
