/* ===== CONTROLLER (server): Denda (khusus Pustakawan) =====
   Pembayaran denda dilakukan tunai di perpustakaan; pustakawan menandainya lunas. */
const { transaksi } = require("../config/db");
const Denda = require("../models/Denda");

const DendaController = {
  // GET /api/denda/semua?status=Belum Lunas|Lunas|semua
  async daftarSemua(req, res) {
    const izin = ["Belum Lunas", "Lunas", "semua"];
    const status = izin.includes(req.query.status) ? req.query.status : "Belum Lunas";
    res.json(await Denda.daftarSemua(status));
  },

  // POST /api/denda/:id/lunas
  async tandaiLunas(req, res) {
    const id = String(req.params.id || "").trim();
    if (!id || id.length > 20) return res.status(400).json({ pesan: "ID denda tidak valid." });

    const hasil = await transaksi(async (conn) => {
      const d = await Denda.ambilUntukPelunasan(id, conn);
      if (!d) return { kode: 404, pesan: "Data denda tidak ditemukan." };
      if (d.statusBayar === "Lunas") return { kode: 409, pesan: "Denda ini sudah lunas." };
      await Denda.tandaiLunas(id, conn);
      await Denda.perbaruiStatusBebasDenda(d.idAnggota, conn);
      return { kode: 200, idDenda: id, nominal: Number(d.nominalDenda) || 0 };
    });

    const { kode, ...body } = hasil;
    res.status(kode).json(body);
  },
};

module.exports = DendaController;
