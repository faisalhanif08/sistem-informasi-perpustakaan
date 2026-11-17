/* ===== VIEW: HalamanPersetujuan (khusus Pustakawan) =====
   Pustakawan melihat reservasi pemustaka lalu menyetujui atau menolaknya. */
const HalamanPersetujuan = {
  status: "proses",

  bukaPersetujuan() {
    return PersetujuanController.ambilDaftar(this.status);
  },

  tampilkanKhususPustakawan() {
    app.innerHTML = `<h1>Persetujuan Reservasi</h1>
      <div class="card" style="padding:20px">Halaman ini hanya dapat diakses oleh <b>Pustakawan</b>.</div>`;
  },

  _tombol(r) {
    if (r.status !== "Aktif" && r.status !== "Menunggu") return '<span class="muted">—</span>';
    const bisaSetujui = r.status === "Aktif" || r.stock > 0;
    const id = esc(r.id);
    return `<div class="aksi">
      <button class="btn sm ok" data-setujui="${id}" ${bisaSetujui ? "" : 'disabled title="Stok masih habis"'}>✔ Setujui</button>
      <button class="btn sm danger" data-tolak="${id}">✖ Tolak</button>
    </div>`;
  },

  tampilkanDaftar(daftar, status) {
    this.status = status;
    const pilihan = [
      ["proses", "Perlu diproses"],
      ["Aktif", "Aktif"],
      ["Menunggu", "Daftar tunggu"],
      ["Disetujui", "Disetujui"],
      ["Ditolak", "Ditolak"],
      ["semua", "Semua"],
    ];
    const baris = daftar.length
      ? daftar
          .map(
            (r, i) => `<tr>
          <td>${i + 1}</td>
          <td>${esc(r.namaPemustaka)}<div class="muted">${esc(r.idPengguna)}</div></td>
          <td><a href="#/buku/${encodeURIComponent(r.bookId)}">${esc(r.bookTitle)}</a>
              <div class="muted">Stok: ${r.stock}</div></td>
          <td>${esc(r.reservedAt)}</td>
          <td>${esc(r.expiresAt)}</td>
          <td><span class="status s-${esc(r.status)}">${esc(r.status === "Menunggu" ? "Daftar tunggu" : r.status)}</span></td>
          <td>${this._tombol(r)}</td>
        </tr>`,
          )
          .join("")
      : '<tr><td colspan="7" class="muted">Tidak ada reservasi.</td></tr>';

    app.innerHTML = `<h1>Persetujuan Reservasi</h1>
    <p class="sub">Setujui untuk mencatat peminjaman, atau tolak untuk mengembalikan stok buku.</p>
    <div class="toolbar">
      <label>Status
        <select id="filterStatus">${pilihan
          .map(([v, t]) => `<option value="${v}" ${v === status ? "selected" : ""}>${t}</option>`)
          .join("")}</select>
      </label>
    </div>
    <div class="card tblwrap"><table>
      <tr><th>#</th><th>Pemustaka</th><th>Buku</th><th>Tgl Reservasi</th><th>Batas Ambil</th><th>Status</th><th>Aksi</th></tr>
      ${baris}
    </table></div>`;

    $("#filterStatus").onchange = (e) => PersetujuanController.ambilDaftar(e.target.value);
    app.querySelectorAll("[data-setujui]").forEach((b) => {
      b.onclick = () => {
        b.disabled = true;
        PersetujuanController.setujui(b.dataset.setujui);
      };
    });
    app.querySelectorAll("[data-tolak]").forEach((b) => {
      b.onclick = () => {
        if (!confirm("Tolak reservasi ini?")) return;
        b.disabled = true;
        PersetujuanController.tolak(b.dataset.tolak);
      };
    });
  },
};
