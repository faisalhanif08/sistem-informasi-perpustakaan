# Perpustakaan Digital (MVC)

Frontend vanilla JS (pola MVC) + backend **Express.js** + database **MySQL / MariaDB**.

## Struktur

```
perpustakaan-mvc/
├── index.html, css/, js/        ← Frontend (Model → fetch API, Controller, View)
├── server/
│   ├── app.js                   ← entry point Express
│   ├── config/db.js             ← koneksi database (pool + helper transaksi)
│   ├── routes/api.js            ← daftar endpoint REST
│   ├── middleware/auth.js       ← cek login (session)
│   ├── controllers/             ← logika tiap use case (SD-03..SD-09)
│   ├── models/                  ← query SQL per tabel
│   └── scripts/initDb.js        ← membuat database + data awal
└── database/
    ├── schema.sql               ← struktur 9 tabel (mengikuti DDL Modul 3)
    └── seed.sql                 ← akun demo + 20 buku
```

## Cara menjalankan

1. Install **Node.js** (v18+) dan pastikan **MySQL/MariaDB** menyala.
2. Isi password database di file `.env` (salin dari `.env.example` bila belum ada):
   ```
   DB_USER=root
   DB_PASSWORD=password_mysql_anda
   ```
3. Install dependency & buat database:
   ```
   npm install
   npm run db:init
   ```
   > `db:init` menghapus lalu membuat ulang semua tabel. Alternatif: import `database/schema.sql` lalu `database/seed.sql` lewat phpMyAdmin / HeidiSQL / Workbench.
4. Jalankan server:
   ```
   npm start        # atau: npm run dev  (auto-restart saat file berubah)
   ```
5. Buka **http://localhost:3000** (jangan buka `index.html` langsung dari file explorer).

### Akun demo

| Email | Password | Peran |
|---|---|---|
| pemustaka@perpus.test | pemustaka123 | Pemustaka |
| pemustaka2@perpus.test | pemustaka2123 | Pemustaka |
| pemustaka3@perpus.test | pemustaka3123 | Pemustaka |
| pemustaka4@perpus.test | pemustaka4123 | Pemustaka |
| pustakawan@perpus.test | pustakawan123 | Pustakawan |
| admin@perpus.test | admin123 | Admin |

## Endpoint API

| Method | Endpoint | Login | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | – | body `{ email, password }` |
| POST | `/api/auth/logout` | – | |
| GET | `/api/auth/me` | – | data pengguna yang sedang login |
| GET | `/api/buku?q=&kategori=&penulis=&tahun=&urut=` | – | cari buku (SD-04) |
| GET | `/api/buku/filter` | – | daftar kategori/penulis/tahun |
| GET | `/api/buku/statistik` | – | total judul & eksemplar |
| GET | `/api/buku/:id` | – | detail + stok |
| POST | `/api/reservasi` | ✔ | body `{ idBuku }` (SD-05) |
| GET | `/api/reservasi` | ✔ | reservasi milik pengguna |
| GET | `/api/reservasi/statistik` | ✔ | jumlah reservasi aktif |
| GET | `/api/peminjaman` | ✔ | riwayat peminjaman (SD-06) |
| GET | `/api/peminjaman/statistik` | ✔ | jumlah peminjaman aktif (SD-09) |
| GET | `/api/denda` | ✔ | denda belum lunas |
| GET | `/api/profil` | ✔ | profil pengguna (SD-03) |

### Hasil `POST /api/reservasi`

| Status | `hasil` | Arti |
|---|---|---|
| 201 | `berhasil` | reservasi tersimpan, stok berkurang (`stock`, `expiresAt`) |
| 201 | `daftar_tunggu` | stok habis → masuk antrean |
| 401 | – | belum login |
| 404 | `tidak_ditemukan` | buku tidak ada |
| 409 | `kuota_penuh` / `sudah_reservasi` / `sudah_antre` | ditolak |

Semua pengecekan reservasi dijalankan di dalam **satu transaksi database** dengan `SELECT ... FOR UPDATE`, sehingga stok tidak bisa minus walaupun dua pengguna mereservasi buku terakhir secara bersamaan.
