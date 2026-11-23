/* ===== CONTROLLER (server): Katalog (SD-04) ===== */
const Buku = require("../models/Buku");
const Reservasi = require("../models/Reservasi");

const KatalogController = {
  // GET /api/buku?q=&kategori=&penulis=&tahun=&urut=
  async cariBuku(req, res) {
    const { q = "", kategori = "", penulis = "", tahun = "", urut = "terbaru" } = req.query;
    const daftar = await Buku.cari(String(q).trim(), { kategori, penulis, tahun, urut });
    res.json(daftar);
  },

  // GET /api/buku/filter
  async daftarFilter(req, res) {
    res.json(await Buku.daftarFilter());
  },

  // GET /api/buku/:id
  async detailBuku(req, res) {
    const id = String(req.params.id || "").trim();
    if (!id || id.length > 20)
      return res.status(400).json({ pesan: "ID buku tidak valid." });
    const b = await Buku.ambilDetailDanStok(id);
    if (!b) return res.status(404).json({ pesan: "Buku tidak ditemukan." });
    // ketentuan = { masaAmbilHari, lamaPinjamHari } untuk info batas ambil & kembali
    res.json({ detail: b, stok: b.stock, ketentuan: await Reservasi.ketentuan() });
  },

  // PATCH /api/buku/:id/stok  { selisih }  (khusus Pustakawan)
  async ubahStok(req, res) {
    const id = String(req.params.id || "").trim();
    if (!id || id.length > 20)
      return res.status(400).json({ pesan: "ID buku tidak valid." });
    const selisih = Number(req.body?.selisih);
    if (!Number.isInteger(selisih) || selisih === 0 || Math.abs(selisih) > 1000)
      return res.status(400).json({ pesan: "Jumlah perubahan stok tidak valid." });
    const stok = await Buku.ubahStok(id, selisih);
    if (stok === null) return res.status(404).json({ pesan: "Buku tidak ditemukan." });
    if (stok === false)
      return res.status(409).json({ pesan: "Stok tidak boleh kurang dari 0." });
    res.json({ stok });
  },

  // GET /api/buku/statistik
  async statistik(req, res) {
    res.json(await Buku.hitungKetersediaanBuku());
  },
};

module.exports = KatalogController;
