/* ===== VIEW: HalamanKatalog (SD-04) ===== */
const state = {
  q: "",
  kategori: "",
  penulis: "",
  tahun: "",
  urut: "terbaru",
  page: 1,
};
let filters = null;

const HalamanKatalog = {
  // render halaman katalog (kerangka form pencarian)
  async render() {
    if (!filters) filters = await Buku.daftarFilter();
    const urutan = [
      ["terbaru", "Terbaru"],
      ["judul", "Judul (A-Z)"],
      ["penulis", "Penulis (A-Z)"],
      ["tahun", "Tahun Terbit"],
    ];
    app.innerHTML = `
    <h1>Katalog Buku</h1>
    <p class="sub">Temukan buku yang Anda butuhkan dengan mudah.</p>
    <div class="searchrow">
      <input id="q" placeholder="Cari judul buku, penulis, atau ISBN..." value="${esc(state.q)}">
      <button class="btn primary" id="btnCari">Cari</button>
      <button class="btn" id="btnReset">Reset</button>
    </div>
    <div class="filters">
      <label>Kategori<select id="fKategori">${opts(filters.categories, "Semua Kategori", state.kategori)}</select></label>
      <label>Penulis<select id="fPenulis">${opts(filters.authors, "Semua Penulis", state.penulis)}</select></label>
      <label>Tahun Terbit<select id="fTahun">${opts(filters.years, "Semua Tahun", state.tahun)}</select></label>
      <label>Urutkan<select id="fUrut">${urutan.map((u) => `<option value="${u[0]}" ${state.urut === u[0] ? "selected" : ""}>${u[1]}</option>`).join("")}</select></label>
    </div>
    <div id="grid" class="grid"></div>
    <div class="pager"><span></span><div id="pages"></div><span id="info"></span></div>`;

    const apply = () => {
      state.kategori = $("#fKategori").value;
      state.penulis = $("#fPenulis").value;
      state.tahun = $("#fTahun").value;
      state.urut = $("#fUrut").value;
      this.masukkanKataKunci($("#q").value.trim());
    };
    $("#btnCari").onclick = apply;
    $("#q").onkeydown = (e) => {
      if (e.key === "Enter") apply();
    };
    ["#fKategori", "#fPenulis", "#fTahun", "#fUrut"].forEach(
      (s) => ($(s).onchange = apply),
    );
    $("#btnReset").onclick = () => {
      Object.assign(state, {
        q: "",
        kategori: "",
        penulis: "",
        tahun: "",
        urut: "terbaru",
        page: 1,
      });
      $("#hq").value = "";
      this.render();
    };
    await this.cariBukuSekarang();
  },

  // Pemustaka mengetik kata kunci -> KatalogController.cariBuku()
  masukkanKataKunci(kataKunci) {
    state.q = kataKunci;
    state.page = 1;
    $("#hq").value = kataKunci;
    this.cariBukuSekarang();
  },
  cariBukuSekarang() {
    return KatalogController.cariBuku(
      state.q,
      {
        kategori: state.kategori,
        penulis: state.penulis,
        tahun: state.tahun,
        urut: state.urut,
      },
      state.page,
      8,
    ).catch((e) => toast(e.message, true));
  },

  tampilkanHasil(daftarBuku, paging) {
    state.page = paging.page;
    $("#grid").innerHTML = daftarBuku
      .map(
        (b) => `
      <div class="card book">
        <div class="cover">🖼️</div>
        <h3>${esc(b.title)}</h3>
        <div class="au">${esc(b.author)}</div>
        <span class="chip">${esc(b.category)}</span>
        <div class="stok ${b.stock === 0 ? "habis" : ""}">📖 ${b.stock > 0 ? "Tersedia: " + b.stock + " eksemplar" : "Stok habis"}</div>
        <button class="btn" onclick="HalamanKatalog.pilihBuku('${esc(b.id)}')">Detail</button>
      </div>`,
      )
      .join("");

    let html = `<button ${paging.page <= 1 ? "disabled" : ""} data-p="${paging.page - 1}">‹</button>`;
    for (let i = 1; i <= paging.totalPages; i++)
      html += `<button class="${i === paging.page ? "cur" : ""}" data-p="${i}">${i}</button>`;
    html += `<button ${paging.page >= paging.totalPages ? "disabled" : ""} data-p="${paging.page + 1}">›</button>`;
    $("#pages").innerHTML = html;
    $("#pages")
      .querySelectorAll("button")
      .forEach(
        (btn) =>
          (btn.onclick = () => {
            state.page = +btn.dataset.p;
            this.cariBukuSekarang();
          }),
      );
    $("#info").textContent =
      `Menampilkan ${paging.from} - ${paging.to} dari ${paging.totalItems} buku`;
  },

  tampilkanTidakDitemukan() {
    $("#grid").innerHTML =
      '<p style="grid-column:1/-1;color:#667085">Buku tidak ditemukan.</p>';
    $("#pages").innerHTML = "";
    $("#info").textContent = "Menampilkan 0 - 0 dari 0 buku";
  },

  // Pemustaka memilih buku -> navigasi ke Halaman Detail Buku
  pilihBuku(idBuku) {
    location.hash = "#/buku/" + encodeURIComponent(idBuku);
  },
  // dipanggil router untuk #/buku/{id} -> KatalogController.detailBuku()
  muatDetail(idBuku) {
    return KatalogController.detailBuku(idBuku);
  },

  tampilkanDetail(b, stok, ketentuan) {
    const k = ketentuan || { masaAmbilHari: 2, lamaPinjamHari: 7 };
    const inWish = () => wishlist().includes(b.id);
    const isPustakawan = !!(Pengguna.sesi && Pengguna.sesi.peran === "Pustakawan");
    // Pustakawan: kontrol stok; Pemustaka/tamu: tombol reservasi
    const aksi = isPustakawan
      ? `<div class="stokctl">
          <label for="jmlStok">Ubah Stok (eksemplar)</label>
          <div class="row">
            <button class="btn" id="btnKurangStok" title="Kurangi stok" ${stok <= 0 ? "disabled" : ""}>➖ Kurangi</button>
            <input type="number" id="jmlStok" min="1" step="1" value="1">
            <button class="btn primary" id="btnTambahStok" title="Tambah stok">➕ Tambah</button>
          </div>
        </div>`
      : `<button class="btn primary block" id="btnRes">📅 Reservasi Buku</button>
        <div class="info-reservasi" id="infoRes">
          <div>⏰ <b>Batas pengambilan:</b> ${k.masaAmbilHari} hari setelah reservasi</div>
          <div>📆 <b>Batas pengembalian:</b> ${k.lamaPinjamHari} hari setelah buku diambil</div>
        </div>`;
    app.innerHTML = `
    <div class="crumb">🏠 <span class="sep">|</span> <a href="#/">Katalog Buku</a> <span class="sep">›</span> <span>Detail Buku</span></div>
    <section class="panel">
      <div class="left">
        <div class="cover">
          <svg width="92" height="84" viewBox="0 0 92 84" fill="none" stroke="#7d8798" stroke-width="7" stroke-linejoin="round">
            <rect x="4" y="4" width="84" height="76" rx="4"/><circle cx="30" cy="26" r="8" fill="#7d8798" stroke="none"/>
            <path d="M6 74 34 46l16 16 14-12 24 24" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="cap">Sampul Buku</div>
        <div class="stock"><span class="ic">📖</span>
          <div><small>Stok Tersedia</small><span class="n" id="stok">${stok}</span> <span class="u">eksemplar</span></div></div>
        ${aksi}
        <button class="btn block" id="btnWish"></button>
      </div>
      <div class="right">
        <h1>${esc(b.title)}</h1>
        <div class="by">${esc(b.author)}</div>
        <div class="meta">
          <span class="chip">${esc(b.category)}</span>
          <span class="it">👤 Penulis: ${esc(b.author)}</span>
          <span class="it">📖 Penerbit: ${esc(b.publisher)}</span>
        </div>
        <div class="facts">
          <div>Tahun Terbit<b>${b.year}</b></div>
          <div>ISBN<b>${esc(b.isbn)}</b></div>
          <div>Jumlah Halaman<b>${b.pages} halaman</b></div>
        </div>
        <h2>Deskripsi</h2>
        <p class="desc">${esc(b.description)}</p>
        <hr>
        <h2>Detail Buku</h2>
        <div class="tbl">
          <div><span class="k">Kategori</span><span>:</span><span>${esc(b.category)}</span></div>
          <div><span class="k">Penulis</span><span>:</span><span>${esc(b.author)}</span></div>
          <div><span class="k">Penerbit</span><span>:</span><span>${esc(b.publisher)}</span></div>
          <div><span class="k">Tahun Terbit</span><span>:</span><span>${b.year}</span></div>
          <div><span class="k">ISBN</span><span>:</span><span>${esc(b.isbn)}</span></div>
          <div><span class="k">Jumlah Halaman</span><span>:</span><span>${b.pages} halaman</span></div>
        </div>
      </div>
    </section>`;

    if (isPustakawan) {
      $("#btnTambahStok").onclick = () => HalamanDetailBuku.tekanUbahStok(b.id, 1);
      $("#btnKurangStok").onclick = () => HalamanDetailBuku.tekanUbahStok(b.id, -1);
    } else {
      if (stok <= 0) this.tampilkanTidakTersedia();
      $("#btnRes").onclick = () => HalamanDetailBuku.tekanReservasi(b.id);
    }

    const btnWish = $("#btnWish");
    const paintWish = () =>
      (btnWish.textContent = inWish()
        ? "🔖 Hapus dari Wishlist"
        : "🔖 Tambah ke Wishlist");
    paintWish();
    btnWish.onclick = () => {
      let w = wishlist();
      if (inWish()) {
        w = w.filter((x) => x !== b.id);
        toast("Dihapus dari wishlist.");
      } else {
        w.push(b.id);
        toast("Ditambahkan ke wishlist.");
      }
      saveWishlist(w);
      paintWish();
    };
  },

  tampilkanTidakTersedia() {
    const btn = $("#btnRes");
    // stok habis: pengguna masih bisa masuk daftar tunggu
    btn.textContent = "⏳ Gabung Daftar Tunggu";
  },
};
