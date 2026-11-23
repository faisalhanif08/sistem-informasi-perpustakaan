CREATE DATABASE IF NOT EXISTS perpustakaan
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE perpustakaan;

SET FOREIGN_KEY_CHECKS = 0;
-- tabel versi lama (sebelum mengikuti DDL PDF)
DROP TABLE IF EXISTS denda, peminjaman, daftar_tunggu, reservasi, buku, pengguna;
-- tabel versi PDF
DROP TABLE IF EXISTS Denda, Reservasi, Peminjaman, Admin, Pustakawan, Pemustaka,
  Pengguna, KonfigurasiSistem, Buku;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 8. KonfigurasiSistem  (FH)
-- ---------------------------------------------------------------------
CREATE TABLE KonfigurasiSistem (
  idKonfigurasi INTEGER NOT NULL,
  dendaPerHari  DOUBLE  NULL,
  maxBukuPinjam INTEGER NULL,
  maxHariPinjam INTEGER NULL,
  PRIMARY KEY (idKonfigurasi)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. Pengguna  (MFF)
-- ---------------------------------------------------------------------
CREATE TABLE Pengguna (
  idPengguna VARCHAR(20) NOT NULL,
  nama       VARCHAR(20) NULL,
  email      VARCHAR(25) NULL,
  password   VARCHAR(60) NULL,          -- [diperbesar] PDF: VARCHAR(16)
  tipeUser   VARCHAR(25) NULL,          -- 'Pemustaka' | 'Pustakawan' | 'Admin'
  PRIMARY KEY (idPengguna),
  UNIQUE KEY uk_pengguna_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. Pemustaka  (MFF)  -- spesialisasi Pengguna
-- ---------------------------------------------------------------------
CREATE TABLE Pemustaka (
  idPengguna       VARCHAR(20) NOT NULL,
  kuotaPinjam      INTEGER     NULL,
  statusBebasDenda BOOLEAN     NULL,
  PRIMARY KEY (idPengguna),
  CONSTRAINT fk_pemustaka_pengguna FOREIGN KEY (idPengguna) REFERENCES Pengguna (idPengguna)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 1. Admin  (WSW)  -- spesialisasi Pengguna
-- ---------------------------------------------------------------------
CREATE TABLE Admin (
  idPengguna    VARCHAR(20) NOT NULL,
  levelAkses    VARCHAR(20) NULL,
  idKonfigurasi INTEGER     NULL,
  PRIMARY KEY (idPengguna),
  CONSTRAINT fk_admin_pengguna    FOREIGN KEY (idPengguna)    REFERENCES Pengguna (idPengguna)
    ON DELETE CASCADE,
  CONSTRAINT fk_admin_konfigurasi FOREIGN KEY (idKonfigurasi) REFERENCES KonfigurasiSistem (idKonfigurasi)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. Buku  (WSW)
-- ---------------------------------------------------------------------
CREATE TABLE Buku (
  idBuku        VARCHAR(20)  NOT NULL,
  isbn          VARCHAR(20)  NULL,
  judul         VARCHAR(150) NULL,
  stokFisik     INTEGER      NULL,
  penulis       VARCHAR(100) NULL,
  kategori      VARCHAR(50)  NULL,
  penerbit      VARCHAR(100) NULL,
  tahunTerbit   INTEGER      NULL,
  jumlahHalaman INTEGER      NULL,
  deskripsi     TEXT         NULL,
  PRIMARY KEY (idBuku),
  UNIQUE KEY uk_buku_isbn (isbn),
  KEY idx_buku_kategori (kategori),
  KEY idx_buku_penulis (penulis),
  KEY idx_buku_tahun (tahunTerbit)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. Peminjaman  (FH)
--    idAnggota  = Pemustaka yang meminjam
--    idPengguna = Pustakawan yang memproses transaksi
-- ---------------------------------------------------------------------
CREATE TABLE Peminjaman (
  idTransaksi   VARCHAR(20) NOT NULL,
  idAnggota     VARCHAR(20) NOT NULL,
  idBuku        VARCHAR(20) NOT NULL,
  tglPinjam     DATE        NULL,
  tglJatuhTempo DATE        NULL,
  status        VARCHAR(20) NULL,       -- 'Dipinjam' | 'Dikembalikan' | 'Terlambat'
  idPengguna    VARCHAR(20) NULL,
  tglKembali    DATE        NULL,       -- [tambahan]
  PRIMARY KEY (idTransaksi),
  KEY idx_peminjaman_anggota (idAnggota, status),
  CONSTRAINT fk_peminjaman_anggota  FOREIGN KEY (idAnggota)  REFERENCES Pengguna (idPengguna),
  CONSTRAINT fk_peminjaman_buku     FOREIGN KEY (idBuku)     REFERENCES Buku (idBuku),
  CONSTRAINT fk_peminjaman_petugas  FOREIGN KEY (idPengguna) REFERENCES Pengguna (idPengguna)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. Pustakawan  (WSW)  -- spesialisasi Pengguna
-- ---------------------------------------------------------------------
CREATE TABLE Pustakawan (
  idPengguna  VARCHAR(20) NOT NULL,
  idNIP       VARCHAR(10) NULL,
  idTransaksi VARCHAR(20) NULL,
  PRIMARY KEY (idPengguna),
  CONSTRAINT fk_pustakawan_pengguna   FOREIGN KEY (idPengguna)  REFERENCES Pengguna (idPengguna)
    ON DELETE CASCADE,
  CONSTRAINT fk_pustakawan_peminjaman FOREIGN KEY (idTransaksi) REFERENCES Peminjaman (idTransaksi)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Denda  (WSW)
-- ---------------------------------------------------------------------
CREATE TABLE Denda (
  idDenda      VARCHAR(20) NOT NULL,
  idTransaksi  VARCHAR(20) NULL,
  nominalDenda DOUBLE      NULL,
  statusBayar  VARCHAR(20) NULL,
  PRIMARY KEY (idDenda),
  CONSTRAINT fk_denda_peminjaman FOREIGN KEY (idTransaksi) REFERENCES Peminjaman (idTransaksi)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 14. Reservasi  (MFY)
--     status 'Aktif'    = reservasi berhasil, buku menunggu diambil
--     status 'Menunggu' = stok habis, masuk daftar tunggu
--     status 'Disetujui' / 'Ditolak' = sudah diproses Pustakawan
--     (batas pengambilan dihitung: tglReservasi + 2 hari)
-- ---------------------------------------------------------------------
CREATE TABLE Reservasi (
  idReservasi  VARCHAR(20) NOT NULL,
  idPengguna   VARCHAR(20) NULL,
  idBuku       VARCHAR(20) NULL,
  status       VARCHAR(20) NULL,        -- 'Aktif' | 'Menunggu' | 'Disetujui' | 'Ditolak'
  tglReservasi DATE        NULL,
  PRIMARY KEY (idReservasi),
  KEY idx_reservasi_pengguna (idPengguna, status),
  CONSTRAINT fk_reservasi_pengguna FOREIGN KEY (idPengguna) REFERENCES Pengguna (idPengguna),
  CONSTRAINT fk_reservasi_buku     FOREIGN KEY (idBuku)     REFERENCES Buku (idBuku)
) ENGINE=InnoDB;
