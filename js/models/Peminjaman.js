/* ===== MODEL: Peminjaman (data dari backend /api/peminjaman) ===== */
const Peminjaman = {
  cariRiwayat() {
    return api("/peminjaman");
  },
  // khusus Pustakawan -> status: aktif | Terlambat | Dikembalikan | semua
  daftarSemua(status) {
    return api("/peminjaman/semua?status=" + encodeURIComponent(status || "aktif"));
  },
  // khusus Pustakawan -> { tglKembali, stok, idBuku }
  konfirmasiPengembalian(idTransaksi) {
    return api("/peminjaman/" + encodeURIComponent(idTransaksi) + "/kembalikan", {
      method: "POST",
    });
  },
  hitungStatistikTransaksi(periode) {
    return api("/peminjaman/statistik?periode=" + encodeURIComponent(periode));
  },
};
