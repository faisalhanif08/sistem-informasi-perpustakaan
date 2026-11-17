/* ===== VIEW: HalamanRiwayat (SD-06) ===== */
const HalamanRiwayat = {
  bukaRiwayat() {
    return RiwayatController.ambilRiwayat(Pengguna.sesi.idPengguna);
  },
  _kerangka(isi) {
    app.innerHTML = `<h1>Peminjaman</h1><p class="sub">Daftar buku yang telah Anda reservasi.</p>
    <div class="card"><table>
      <tr><th>#</th><th>Judul Buku</th><th>Tanggal Reservasi</th><th>Batas Pengambilan</th><th>Status</th></tr>
      ${isi}
    </table></div>`;
  },
  tampilkanRiwayatKosong() {
    this._kerangka(
      '<tr><td colspan="5" style="color:#667085">Belum ada reservasi. Buka Katalog Buku untuk mereservasi buku.</td></tr>',
    );
  },
  tampilkanRiwayat(daftarTransaksi, daftarReservasi) {
    if (!daftarReservasi.length) return this.tampilkanRiwayatKosong();
    this._kerangka(
      daftarReservasi
        .map(
          (r, i) =>
            `<tr><td>${i + 1}</td><td><a href="#/buku/${r.bookId}">${esc(r.bookTitle)}</a></td><td>${r.reservedAt}</td><td>${r.expiresAt}</td><td>${esc(r.status)}</td></tr>`,
        )
        .join(""),
    );
  },

  // Rincian denda keterlambatan milik pemustaka
  tampilkanInformasiDenda(daftarDenda) {
    const belum = daftarDenda.filter((d) => d.statusBayar !== "Lunas");
    const total = belum.reduce((s, d) => s + d.jumlah, 0);
    const baris = daftarDenda
      .map(
        (d, i) => `<tr>
        <td>${i + 1}</td>
        <td><a href="#/buku/${encodeURIComponent(d.bookId)}">${esc(d.bookTitle)}</a></td>
        <td>${esc(d.tglJatuhTempo || "-")}</td>
        <td>${esc(d.tglKembali || "-")}</td>
        <td>${d.hariTerlambat} hari</td>
        <td><b>${rupiah(d.jumlah)}</b></td>
        <td><span class="status ${kelasStatus(d.statusBayar)}">${esc(d.statusBayar)}</span></td>
      </tr>`,
      )
      .join("");
    app.insertAdjacentHTML(
      "beforeend",
      `<h2 style="margin-top:28px">Denda Keterlambatan</h2>
      ${
        belum.length
          ? `<p class="sub">Anda memiliki <b>${belum.length}</b> denda belum lunas dengan total <b>${rupiah(total)}</b>.</p>`
          : '<p class="sub">Semua denda Anda sudah lunas.</p>'
      }
      <div class="card tblwrap"><table>
        <tr><th>#</th><th>Judul Buku</th><th>Jatuh Tempo</th><th>Tgl Kembali</th><th>Terlambat</th><th>Nominal</th><th>Status</th></tr>
        ${baris}
      </table></div>`,
    );
  },
  tampilkanOpsiBayarDenda() {
    app.insertAdjacentHTML(
      "beforeend",
      `<div class="card info-denda">💰 Pembayaran denda dilakukan <b>secara tunai kepada pustakawan</b> di perpustakaan.
        Selama masih ada denda yang belum lunas, Anda <b>tidak dapat mereservasi buku</b>.</div>`,
    );
  },
};
