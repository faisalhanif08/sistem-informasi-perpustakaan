/* ===== VIEW: HalamanProfil (SD-03) ===== */
const HalamanProfil = {
  bukaProfil() {
    return ProfilController.ambilProfil(Pengguna.sesi.idPengguna);
  },
  tampilkanProfil(p) {
    app.innerHTML = `<h1>Profil</h1><p class="sub">Informasi akun Anda.</p>
    <div class="card" style="padding:20px;max-width:420px">
      <div class="avatar" style="width:64px;height:64px;font-size:28px;margin-bottom:12px">👤</div>
      <b>${esc(p.nama)}</b><div style="color:#667085;font-size:13px">${esc(p.peran)}</div>
      <div class="tbl" style="margin-top:14px">
        <div><span class="k">ID Pengguna</span><span>:</span><span>${esc(p.idPengguna)}</span></div>
        <div><span class="k">Email</span><span>:</span><span>${esc(p.email)}</span></div>
        <div><span class="k">Kuota Pinjam</span><span>:</span><span>${p.kuotaPinjam} buku</span></div>
      </div>
    </div>`;
  },
};
