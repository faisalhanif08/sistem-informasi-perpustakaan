-- =====================================================================
-- DATA AWAL (seed) - dijalankan setelah schema.sql
-- Akun demo:
--   pemustaka@perpus.test  / pemustaka123   (Pemustaka)
--   pemustaka2@perpus.test / pemustaka2123   (Pemustaka)
--   pemustaka3@perpus.test / pemustaka3123   (Pemustaka)
--   pemustaka4@perpus.test / pemustaka4123   (Pemustaka)
--   pustakawan@perpus.test / pustakawan123  (Pustakawan)
--   admin@perpus.test      / admin123       (Admin)
-- Password disimpan sebagai hash bcrypt.
-- =====================================================================
USE perpustakaan;

INSERT INTO KonfigurasiSistem (idKonfigurasi, dendaPerHari, maxBukuPinjam, maxHariPinjam) VALUES
  (1, 1000, 5, 7);

INSERT INTO Pengguna (idPengguna, nama, email, password, tipeUser) VALUES
  ('PMK001', 'Pemustaka Demo', 'pemustaka@perpus.test', '$2b$10$IUmibvj47dEHsYjF6m8GoOfuxMfxCF9FLXro/M9fKL5Jb9KBStS2y', 'Pemustaka'),
  ('PMK002', 'Pemustaka Demo 2', 'pemustaka2@perpus.test', '$2b$10$.pT2FC4EhCXObYOcvnj3Nu17hIMkrZOVUSdcK.jDr/BKk38n6DMwa', 'Pemustaka'),
  ('PMK003', 'Pemustaka Demo 3', 'pemustaka3@perpus.test', '$2b$10$/wxaJnG/bWQrnC0ZoIkdNewi5M4eNSWS8WpkZhBq/NgC/iRXOyJb.', 'Pemustaka'),
  ('PMK004', 'Pemustaka Demo 4', 'pemustaka4@perpus.test', '$2b$10$EUWV8idIFBXCj9Qz5DjG3ePTlOjXPbbrxf6NOaqnmhya6ppWDEgoS', 'Pemustaka'),
  ('PST001', 'Pustakawan Demo', 'pustakawan@perpus.test', '$2b$10$Zqg9XY9BrBwYTBWGtnkkpOJGIZLdkQfa2nagiMjUpPtvpaCvbNt7S', 'Pustakawan'),
  ('ADM001', 'Admin Demo', 'admin@perpus.test', '$2b$10$m.jqZ8HvcPV1aOfcxbXFdevIsyXsShr53YvJM9cISNu9c9AUZehRO', 'Admin');

INSERT INTO Pemustaka (idPengguna, kuotaPinjam, statusBebasDenda) VALUES
  ('PMK001', 5, TRUE),
  ('PMK002', 5, TRUE),
  ('PMK003', 5, TRUE),
  ('PMK004', 5, TRUE);

INSERT INTO Admin (idPengguna, levelAkses, idKonfigurasi) VALUES
  ('ADM001', 'Super', 1);

INSERT INTO Buku (idBuku, judul, penulis, kategori, penerbit, tahunTerbit, jumlahHalaman, stokFisik, isbn, deskripsi) VALUES
  ('BK001', 'Pemrograman Web Dasar', 'Budi Santoso', 'Teknologi Informasi', 'Informatika Press', 2022, 280, 5, '978-602-101-203-1', 'Pemrograman Web Dasar adalah buku karya Budi Santoso dalam kategori Teknologi Informasi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK002', 'Manajemen Perpustakaan', 'Siti Nurhaliza', 'Manajemen', 'Pustaka Ilmu', 2020, 215, 3, '978-602-102-206-2', 'Manajemen Perpustakaan adalah buku karya Siti Nurhaliza dalam kategori Manajemen. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK003', 'Sejarah Indonesia', 'Ahmad Fauzi', 'Sejarah', 'Nusantara Media', 2018, 410, 7, '978-602-103-209-3', 'Sejarah Indonesia adalah buku karya Ahmad Fauzi dalam kategori Sejarah. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK004', 'Dasar-Dasar Akuntansi', 'Dewi Lestari', 'Akuntansi', 'Mitra Ekonomi', 2019, 330, 4, '978-602-104-212-4', 'Dasar-Dasar Akuntansi adalah buku karya Dewi Lestari dalam kategori Akuntansi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK005', 'Artificial Intelligence', 'Rizky Pratama', 'Teknologi Informasi', 'Informatika Press', 2024, 360, 6, '978-602-105-215-5', 'Artificial Intelligence adalah buku karya Rizky Pratama dalam kategori Teknologi Informasi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK006', 'Psikologi Umum', 'Nadya Putri', 'Psikologi', 'Cakrawala', 2021, 298, 5, '978-602-106-218-6', 'Psikologi Umum adalah buku karya Nadya Putri dalam kategori Psikologi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK007', 'Sistem Informasi Manajemen', 'Agus Setiawan', 'Sistem Informasi', 'Mitra Ekonomi', 2023, 340, 3, '978-602-107-221-7', 'Sistem Informasi Manajemen adalah buku karya Agus Setiawan dalam kategori Sistem Informasi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK008', 'Kesehatan Mental', 'Intan Permata', 'Kesehatan', 'Sehat Sentosa', 2023, 190, 4, '978-602-108-224-8', 'Kesehatan Mental adalah buku karya Intan Permata dalam kategori Kesehatan. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK009', 'Basis Data Lanjut', 'Budi Santoso', 'Teknologi Informasi', 'Informatika Press', 2021, 312, 2, '978-602-109-227-9', 'Basis Data Lanjut adalah buku karya Budi Santoso dalam kategori Teknologi Informasi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK010', 'Jaringan Komputer', 'Hendra Wijaya', 'Teknologi Informasi', 'Informatika Press', 2019, 350, 6, '978-602-110-230-0', 'Jaringan Komputer adalah buku karya Hendra Wijaya dalam kategori Teknologi Informasi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK011', 'Pengantar Ekonomi Mikro', 'Dewi Lestari', 'Ekonomi', 'Mitra Ekonomi', 2020, 270, 4, '978-602-111-233-1', 'Pengantar Ekonomi Mikro adalah buku karya Dewi Lestari dalam kategori Ekonomi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK012', 'Filsafat Ilmu', 'Ahmad Fauzi', 'Filsafat', 'Cakrawala', 2017, 245, 3, '978-602-112-236-2', 'Filsafat Ilmu adalah buku karya Ahmad Fauzi dalam kategori Filsafat. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK013', 'Senja di Kota Tua', 'Maya Anggraini', 'Fiksi', 'Kepustakaan Populer', 2019, 256, 5, '978-602-113-239-3', 'Senja di Kota Tua adalah buku karya Maya Anggraini dalam kategori Fiksi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK014', 'Hujan dan Rindu', 'Raka Mahendra', 'Fiksi', 'Kepustakaan Populer', 2022, 224, 0, '978-602-114-242-4', 'Hujan dan Rindu adalah buku karya Raka Mahendra dalam kategori Fiksi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK015', 'Statistika untuk Penelitian', 'Siti Nurhaliza', 'Matematika', 'Pustaka Ilmu', 2018, 300, 4, '978-602-115-245-5', 'Statistika untuk Penelitian adalah buku karya Siti Nurhaliza dalam kategori Matematika. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK016', 'Kepemimpinan Modern', 'Agus Setiawan', 'Manajemen', 'Pustaka Ilmu', 2022, 260, 5, '978-602-116-248-6', 'Kepemimpinan Modern adalah buku karya Agus Setiawan dalam kategori Manajemen. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK017', 'Gizi dan Kehidupan Sehat', 'Intan Permata', 'Kesehatan', 'Sehat Sentosa', 2020, 205, 6, '978-602-117-251-7', 'Gizi dan Kehidupan Sehat adalah buku karya Intan Permata dalam kategori Kesehatan. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK018', 'Keamanan Siber', 'Rizky Pratama', 'Teknologi Informasi', 'Informatika Press', 2025, 380, 3, '978-602-118-254-8', 'Keamanan Siber adalah buku karya Rizky Pratama dalam kategori Teknologi Informasi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK019', 'Perilaku Konsumen', 'Nadya Putri', 'Psikologi', 'Cakrawala', 2023, 275, 2, '978-602-119-257-9', 'Perilaku Konsumen adalah buku karya Nadya Putri dalam kategori Psikologi. Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.'),
  ('BK020', 'Laut Bercerita', 'Leila S. Chudori', 'Fiksi', 'Kepustakaan Populer Gramedia', 2017, 379, 5, '978-602-424-694-5', 'Laut Bercerita adalah novel karya Leila S. Chudori yang mengisahkan tentang seorang aktivis bernama Biru Laut yang hilang secara misterius pada masa Orde Baru. Novel ini menggambarkan perjuangan, kehilangan, dan harapan melalui kisah para sahabatnya yang terus mencari kebenaran.');

INSERT INTO Pustakawan (idPengguna, idNIP, idTransaksi) VALUES
  ('PST001', '1987001', NULL);
