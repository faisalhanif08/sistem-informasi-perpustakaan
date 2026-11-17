/* ===== VIEW: HalamanDenda (khusus Pustakawan) =====
   Pustakawan melihat denda keterlambatan pemustaka dan menandainya lunas
   setelah pemustaka membayar tunai di perpustakaan. */
const HalamanDenda = {
  status: "Belum Lunas",
  kataKunci: "",
  _daftar: [],

  bukaDenda() {
    return DendaController.ambilDaftar(this.status);
  },

  tampilkanKhususPustakawan() {
    app.innerHTML = `<h1>Denda</h1>
      <div class="card" style="padding:20px">Halaman ini hanya dapat diakses oleh <b>Pustakawan</b>.</div>`;
  },

  tampilkanDaftar(daftar, status) {
    this.status = status;
    this._daftar = daftar;
    const pilihan = [
      ["Belum Lunas", "Belum lunas"],
      ["Lunas", "Lunas"],
      ["semua", "Semua"],
    ];
    const belum = daftar.filter((d) => d.statusBayar !== "Lunas");
    const totalBelum = belum.reduce((s, d) => s + d.jumlah, 0);
    const jmlPemustaka = new Set(belum.map((d) => d.idAnggota)).size;

    app.innerHTML = `<h1>Denda</h1>
    <p class="sub">Denda keterlambatan pengembalian buku. Tandai lunas setelah pemustaka membayar di perpustakaan.</p>
    <div class="stats">
      <div class="card">Denda Belum Lunas<b>${belum.length}</b></div>
      <div class="card">Total Belum Dibayar<b>${rupiah(totalBelum)}</b></div>
      <div class="card">Pemustaka Berdenda<b>${jmlPemustaka}</b></div>
    </div>
    <div class="toolbar" style="margin-top:18px">
      <label>Status
        <select id="filterDenda">${pilihan
          .map(([v, t]) => `<option value="${v}" ${v === status ? "selected" : ""}>${t}</option>`)
          .join("")}</select>
      </label>
      <label class="grow">Cari pemustaka / judul buku
        <input id="cariDenda" placeholder="Ketik nama, ID, atau judul..." value="${esc(this.kataKunci)}">
      </label>
    </div>
    <div class="card tblwrap"><table>
      <thead><tr><th>#</th><th>Pemustaka</th><th>Buku</th><th>Jatuh Tempo</th><th>Tgl Kembali</th>
        <th>Terlambat</th><th>Nominal</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody id="barisDenda"></tbody>
    </table></div>`;

    $("#filterDenda").onchange = (e) => DendaController.ambilDaftar(e.target.value);
    $("#cariDenda").oninput = (e) => {
      this.kataKunci = e.target.value;
      this._renderBaris();
    };
    this._renderBaris();
  },

  _renderBaris() {
    const k = this.kataKunci.trim().toLowerCase();
    const daftar = this._daftar.filter(
      (d) =>
        !k ||
        [d.namaPemustaka, d.idAnggota, d.bookTitle, d.bookId].some((v) =>
          String(v || "").toLowerCase().includes(k),
        ),
    );

    $("#barisDenda").innerHTML = daftar.length
      ? daftar
          .map(
            (d, i) => `<tr>
          <td>${i + 1}</td>
          <td>${esc(d.namaPemustaka)}<div class="muted">${esc(d.idAnggota)}</div></td>
          <td><a href="#/buku/${encodeURIComponent(d.bookId)}">${esc(d.bookTitle)}</a></td>
          <td>${esc(d.tglJatuhTempo || "-")}</td>
          <td>${esc(d.tglKembali || "-")}</td>
          <td>${d.hariTerlambat} hari</td>
          <td><b>${rupiah(d.jumlah)}</b></td>
          <td><span class="status ${kelasStatus(d.statusBayar)}">${esc(d.statusBayar)}</span></td>
          <td>${
            d.statusBayar === "Lunas"
              ? '<span class="muted">-</span>'
              : `<button class="btn sm ok" data-lunas="${esc(d.id)}">✔ Tandai Lunas</button>`
          }</td>
        </tr>`,
          )
          .join("")
      : '<tr><td colspan="9" class="muted">Tidak ada data denda.</td></tr>';

    $("#barisDenda")
      .querySelectorAll("[data-lunas]")
      .forEach((btn) => (btn.onclick = () => this.tekanTandaiLunas(btn)));
  },

  tekanTandaiLunas(btn) {
    const d = this._daftar.find((x) => x.id === btn.dataset.lunas);
    if (!d) return;
    const ok = confirm(
      `Tandai denda ${rupiah(d.jumlah)} milik ${d.namaPemustaka} ("${d.bookTitle}") sebagai LUNAS?` +
        "\nPastikan pemustaka sudah membayar.",
    );
    if (!ok) return;
    btn.disabled = true;
    btn.textContent = "Memproses...";
    return DendaController.tandaiLunas(d.id);
  },
};
