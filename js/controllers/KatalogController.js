/* ===== CONTROLLER: Katalog (SD-04) ===== */
const KatalogController = {
  // cariBuku(kataKunci) -> Buku.cari(kataKunci)
  async cariBuku(kataKunci, filter, page, size) {
    const f = await Buku.cari(kataKunci, filter);
    if (!f.length) return HalamanKatalog.tampilkanTidakDitemukan();
    const tp = Math.max(1, Math.ceil(f.length / size)),
      pg = Math.min(Math.max(1, page), tp),
      from = (pg - 1) * size,
      to = Math.min(f.length, from + size);
    HalamanKatalog.tampilkanHasil(f.slice(from, to), {
      page: pg,
      totalItems: f.length,
      totalPages: tp,
      from: f.length ? from + 1 : 0,
      to,
    });
  },
  // detailBuku(idBuku) -> Buku.ambilDetailDanStok(idBuku)
  async detailBuku(idBuku) {
    const { detail, stok, ketentuan } = await Buku.ambilDetailDanStok(idBuku);
    HalamanKatalog.tampilkanDetail(detail, stok, ketentuan);
  },
  // khusus Pustakawan: ubahStok(idBuku, selisih) -> Buku.ubahStok()
  async ubahStok(idBuku, selisih) {
    try {
      const { stok } = await Buku.ubahStok(idBuku, selisih);
      HalamanDetailBuku.tampilkanStokBaru(stok, selisih);
    } catch (e) {
      HalamanDetailBuku.tampilkanGagalUbahStok(e.message);
    }
  },
};
