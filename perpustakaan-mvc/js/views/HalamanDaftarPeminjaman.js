/* ===== VIEW: HalamanDaftarPeminjaman (khusus Pustakawan) =====
   Menampilkan daftar peminjam (pemustaka) beserta buku yang mereka pinjam,
   dikelompokkan per pemustaka. */
const HalamanDaftarPeminjaman = {
  status: "aktif",
  kataKunci: "",
  _daftar: [],

  bukaDaftar() {
    return RiwayatController.ambilSemuaPeminjaman(this.status);
  },

  tampilkanDaftar(daftar, status) {
    this.status = status;
    this._daftar = daftar;
    const pilihan = [
      ["aktif", "Sedang dipinjam"],
      ["Terlambat", "Terlambat"],
      ["Dikembalikan", "Sudah dikembalikan"],
      ["semua", "Semua"],
    ];
    const jmlPeminjam = new Set(daftar.map((r) => r.idAnggota)).size;
    const jmlTerlambat = daftar.filter((r) => r.status === "Terlambat").length;

    app.innerHTML = `<h1>Peminjaman</h1>
    <p class="sub">Daftar pemustaka dan buku yang dipinjam.</p>
    <div class="stats">
      <div class="card">Jumlah Peminjam<b>${jmlPeminjam}</b></div>
      <div class="card">Jumlah Buku<b>${daftar.length}</b></div>
      <div class="card">Terlambat<b>${jmlTerlambat}</b></div>
    </div>
    <div class="toolbar" style="margin-top:18px">
      <label>Status
        <select id="filterPinjam">${pilihan
          .map(([v, t]) => `<option value="${v}" ${v === status ? "selected" : ""}>${t}</option>`)
          .join("")}</select>
      </label>
      <label class="grow">Cari pemustaka / judul buku
        <input id="cariPinjam" placeholder="Ketik nama, ID, atau judul..." value="${esc(this.kataKunci)}">
      </label>
    </div>
    <div id="daftarPeminjam"></div>`;

    $("#filterPinjam").onchange = (e) => RiwayatController.ambilSemuaPeminjaman(e.target.value);
    $("#cariPinjam").oninput = (e) => {
      this.kataKunci = e.target.value;
      this._renderKelompok();
    };
    this._renderKelompok();
  },

  _renderKelompok() {
    const k = this.kataKunci.trim().toLowerCase();
    const cocok = (r) =>
      !k ||
      [r.namaPemustaka, r.idAnggota, r.bookTitle, r.bookId].some((v) =>
        String(v || "").toLowerCase().includes(k),
      );
    const daftar = this._daftar.filter(cocok);

    if (!daftar.length) {
      $("#daftarPeminjam").innerHTML =
        '<div class="card muted" style="padding:20px">Tidak ada data peminjaman.</div>';
      return;
    }

    // kelompokkan per pemustaka (urutan dari server sudah per nama)
    const grup = new Map();
    for (const r of daftar) {
      if (!grup.has(r.idAnggota)) grup.set(r.idAnggota, []);
      grup.get(r.idAnggota).push(r);
    }

    $("#daftarPeminjam").innerHTML = [...grup.values()]
      .map((buku) => {
        const p = buku[0];
        const baris = buku
          .map(
            (r, i) => `<tr>
            <td>${i + 1}</td>
            <td><a href="#/buku/${encodeURIComponent(r.bookId)}">${esc(r.bookTitle)}</a>
                <div class="muted">${esc(r.bookAuthor || "")} · ${esc(r.bookId)}</div></td>
            <td>${esc(r.tglPinjam)}</td>
            <td>${esc(r.tglJatuhTempo)}</td>
            <td>${r.tglKembali ? esc(r.tglKembali) : "-"}</td>
            <td><span class="status s-${esc(r.status)}">${esc(r.status)}</span>
                ${r.hariTerlambat ? `<div class="muted">${r.hariTerlambat} hari</div>` : ""}</td>
            <td class="muted">${esc(r.namaPetugas || "-")}</td>
            <td>${
              r.status === "Dipinjam" || r.status === "Terlambat"
                ? `<button class="btn sm ok" data-kembali="${esc(r.id)}">✔ Konfirmasi Kembali</button>`
                : '<span class="muted">-</span>'
            }</td>
          </tr>`,
          )
          .join("");
        return `<div class="card peminjam">
          <div class="peminjam-head">
            <div class="avatar">👤</div>
            <div><b>${esc(p.namaPemustaka)}</b>
              <div class="muted">${esc(p.idAnggota)} · ${esc(p.emailPemustaka || "")}</div></div>
            <span class="chip">${buku.length} buku</span>
          </div>
          <div class="tblwrap"><table>
            <tr><th>#</th><th>Buku</th><th>Tgl Pinjam</th><th>Jatuh Tempo</th><th>Tgl Kembali</th><th>Status</th><th>Diproses oleh</th><th>Aksi</th></tr>
            ${baris}
          </table></div>
        </div>`;
      })
      .join("");

    // Pustakawan mengonfirmasi buku sudah dikembalikan -> stok buku bertambah
    $("#daftarPeminjam")
      .querySelectorAll("[data-kembali]")
      .forEach((btn) => {
        btn.onclick = () => this.tekanKonfirmasiKembali(btn);
      });
  },

  tekanKonfirmasiKembali(btn) {
    const r = this._daftar.find((x) => x.id === btn.dataset.kembali);
    if (!r) return;
    const telat = r.hariTerlambat
      ? `\n\nTerlambat ${r.hariTerlambat} hari -> denda ${rupiah(r.perkiraanDenda)} akan dicatat (status: Belum Lunas).`
      : "";
    const ok = confirm(
      `Konfirmasi bahwa "${r.bookTitle}" sudah dikembalikan oleh ${r.namaPemustaka}?` +
        `\nStok buku akan bertambah 1 eksemplar.${telat}`,
    );
    if (!ok) return;
    btn.disabled = true;
    btn.textContent = "Memproses...";
    return RiwayatController.konfirmasiPengembalian(r.id);
  },
};
