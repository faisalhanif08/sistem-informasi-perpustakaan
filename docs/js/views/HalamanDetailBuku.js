/* ===== VIEW: HalamanDetailBuku (SD-05) ===== */
const HalamanDetailBuku = {
  tekanReservasi(idBuku) {
    const btn = $("#btnRes");
    btn.disabled = true;
    this.idBukuAktif = idBuku;
    const idPengguna = Pengguna.sesi && Pengguna.sesi.idPengguna;
    return ReservasiController.ajukanReservasi(idPengguna, idBuku);
  },
  konfirmasiReservasi(hasil) {
    $("#stok").textContent = hasil.stock;
    toast("Reservasi berhasil. Ambil buku sebelum " + hasil.expiresAt + ".");
    $("#btnRes").textContent = "✔ Sudah Direservasi";
  },
  mintaLogin() {
    $("#btnRes").disabled = false;
    toast("Silakan login terlebih dahulu untuk mereservasi buku.", true);
    sessionStorage.setItem("setelahLogin", location.hash);
    location.hash = "#/login";
  },
  tampilkanKuotaPenuh() {
    $("#btnRes").disabled = false;
    toast("Kuota peminjaman penuh. Reservasi ditolak.", true);
  },
  tampilkanDaftarTunggu() {
    $("#btnRes").textContent = "⏳ Masuk Daftar Tunggu";
    toast("Stok habis. Anda masuk ke daftar tunggu.");
  },
  // khusus Pustakawan: tombol tambah / kurangi stok
  tekanUbahStok(idBuku, arah) {
    const jumlah = Number($("#jmlStok").value);
    if (!Number.isInteger(jumlah) || jumlah < 1)
      return toast("Masukkan jumlah bilangan bulat minimal 1.", true);
    if (arah < 0 && jumlah > +$("#stok").textContent)
      return toast("Stok tidak boleh kurang dari 0.", true);
    $("#btnTambahStok").disabled = $("#btnKurangStok").disabled = true;
    return KatalogController.ubahStok(idBuku, arah * jumlah);
  },
  tampilkanStokBaru(stok, selisih) {
    $("#stok").textContent = stok;
    $("#btnTambahStok").disabled = false;
    $("#btnKurangStok").disabled = stok <= 0;
    toast(`Stok berhasil ${selisih > 0 ? "ditambah" : "dikurangi"} ${Math.abs(selisih)} eksemplar.`);
  },
  tampilkanGagalUbahStok(pesan) {
    $("#btnTambahStok").disabled = false;
    $("#btnKurangStok").disabled = +$("#stok").textContent <= 0;
    toast(pesan, true);
  },
  tampilkanStatus(pesan, isErr) {
    toast(pesan, isErr);
    if (isErr) {
      const btn = $("#btnRes");
      if (!btn) return;
      btn.disabled = false;
      if (+$("#stok").textContent <= 0) HalamanKatalog.tampilkanTidakTersedia();
    }
  },
};
