/* ===== MODEL: Buku (data dari backend /api/buku) ===== */
const Buku = {
  daftarFilter() {
    return api("/buku/filter");
  },
  cari(kataKunci, filter) {
    const p = new URLSearchParams({
      q: kataKunci || "",
      kategori: filter.kategori || "",
      penulis: filter.penulis || "",
      tahun: filter.tahun || "",
      urut: filter.urut || "terbaru",
    });
    return api("/buku?" + p);
  },
  // -> { detail, stok }
  ambilDetailDanStok(idBuku) {
    return api("/buku/" + encodeURIComponent(idBuku));
  },
  // khusus Pustakawan -> { stok }
  ubahStok(idBuku, selisih) {
    return api("/buku/" + encodeURIComponent(idBuku) + "/stok", {
      method: "PATCH",
      body: { selisih },
    });
  },
  hitungKetersediaanBuku() {
    return api("/buku/statistik");
  },
};
