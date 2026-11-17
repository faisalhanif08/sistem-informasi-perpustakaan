/* ===== ROUTES: REST API /api/... ===== */
const express = require("express");
const { wajibLogin, wajibPeran } = require("../middleware/auth");
const AuthController = require("../controllers/AuthController");
const KatalogController = require("../controllers/KatalogController");
const ReservasiController = require("../controllers/ReservasiController");
const RiwayatController = require("../controllers/RiwayatController");
const ProfilController = require("../controllers/ProfilController");
const PersetujuanController = require("../controllers/PersetujuanController");
const DendaController = require("../controllers/DendaController");

const r = express.Router();

// Autentikasi
r.post("/auth/login", AuthController.login);
r.post("/auth/logout", AuthController.logout);
r.get("/auth/me", AuthController.sesiSaatIni);

// Katalog (publik, boleh tanpa login)
r.get("/buku", KatalogController.cariBuku);
r.get("/buku/filter", KatalogController.daftarFilter);
r.get("/buku/statistik", KatalogController.statistik);
r.get("/buku/:id", KatalogController.detailBuku);

// Fitur yang membutuhkan login
r.post("/reservasi", wajibLogin, ReservasiController.ajukanReservasi);
r.get("/reservasi", wajibLogin, ReservasiController.daftarReservasi);
r.get("/reservasi/statistik", wajibLogin, ReservasiController.statistik);
r.get("/peminjaman", wajibLogin, RiwayatController.riwayatPeminjaman);
r.get("/peminjaman/statistik", wajibLogin, RiwayatController.statistik);
r.get("/denda", wajibLogin, RiwayatController.daftarDenda);
r.get("/profil", wajibLogin, ProfilController.ambilProfil);

// Khusus Pustakawan: menyetujui / menolak reservasi pemustaka
const pustakawan = [wajibLogin, wajibPeran("Pustakawan")];
r.get("/persetujuan/reservasi", ...pustakawan, PersetujuanController.daftar);
r.post("/persetujuan/reservasi/:id/setujui", ...pustakawan, PersetujuanController.setujui);
r.post("/persetujuan/reservasi/:id/tolak", ...pustakawan, PersetujuanController.tolak);
// Khusus Pustakawan: menambah / mengurangi stok buku
r.patch("/buku/:id/stok", ...pustakawan, KatalogController.ubahStok);
// Khusus Pustakawan: daftar peminjam & buku yang sedang/pernah dipinjam
r.get("/peminjaman/semua", ...pustakawan, RiwayatController.semuaPeminjaman);
// Khusus Pustakawan: konfirmasi buku sudah dikembalikan (stok buku otomatis +1)
r.post("/peminjaman/:id/kembalikan", ...pustakawan, RiwayatController.konfirmasiPengembalian);
// Khusus Pustakawan: daftar denda semua pemustaka & menandai denda lunas
r.get("/denda/semua", ...pustakawan, DendaController.daftarSemua);
r.post("/denda/:id/lunas", ...pustakawan, DendaController.tandaiLunas);

// Endpoint tidak dikenal
r.use((req, res) => res.status(404).json({ pesan: "Endpoint tidak ditemukan." }));

module.exports = r;
