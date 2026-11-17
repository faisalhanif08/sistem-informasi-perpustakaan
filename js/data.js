/* =====================================================================
   DATA DEMO (pengganti database) - dipakai oleh model Buku
   ===================================================================== */
const B = [];
function add(t, a, c, p, y, pg, s, d) {
  const id = B.length + 1;
  B.push({
    id,
    title: t,
    author: a,
    category: c,
    publisher: p,
    year: y,
    pages: pg,
    stock: s,
    isbn:
      "978-602-" + (100 + id) + "-" + (200 + id * 3) + "-" + (id % 10),
    description:
      d ||
      t +
        " adalah buku karya " +
        a +
        " dalam kategori " +
        c +
        ". Buku ini disusun runtut dan mudah dipahami, cocok untuk pelajar, mahasiswa, maupun pembaca umum.",
  });
}
[
  [
    "Pemrograman Web Dasar",
    "Budi Santoso",
    "Teknologi Informasi",
    "Informatika Press",
    2022,
    280,
    5,
  ],
  [
    "Manajemen Perpustakaan",
    "Siti Nurhaliza",
    "Manajemen",
    "Pustaka Ilmu",
    2020,
    215,
    3,
  ],
  [
    "Sejarah Indonesia",
    "Ahmad Fauzi",
    "Sejarah",
    "Nusantara Media",
    2018,
    410,
    7,
  ],
  [
    "Dasar-Dasar Akuntansi",
    "Dewi Lestari",
    "Akuntansi",
    "Mitra Ekonomi",
    2019,
    330,
    4,
  ],
  [
    "Artificial Intelligence",
    "Rizky Pratama",
    "Teknologi Informasi",
    "Informatika Press",
    2024,
    360,
    6,
  ],
  [
    "Psikologi Umum",
    "Nadya Putri",
    "Psikologi",
    "Cakrawala",
    2021,
    298,
    5,
  ],
  [
    "Sistem Informasi Manajemen",
    "Agus Setiawan",
    "Sistem Informasi",
    "Mitra Ekonomi",
    2023,
    340,
    3,
  ],
  [
    "Kesehatan Mental",
    "Intan Permata",
    "Kesehatan",
    "Sehat Sentosa",
    2023,
    190,
    4,
  ],
  [
    "Basis Data Lanjut",
    "Budi Santoso",
    "Teknologi Informasi",
    "Informatika Press",
    2021,
    312,
    2,
  ],
  [
    "Jaringan Komputer",
    "Hendra Wijaya",
    "Teknologi Informasi",
    "Informatika Press",
    2019,
    350,
    6,
  ],
  [
    "Pengantar Ekonomi Mikro",
    "Dewi Lestari",
    "Ekonomi",
    "Mitra Ekonomi",
    2020,
    270,
    4,
  ],
  ["Filsafat Ilmu", "Ahmad Fauzi", "Filsafat", "Cakrawala", 2017, 245, 3],
  [
    "Senja di Kota Tua",
    "Maya Anggraini",
    "Fiksi",
    "Kepustakaan Populer",
    2019,
    256,
    5,
  ],
  [
    "Hujan dan Rindu",
    "Raka Mahendra",
    "Fiksi",
    "Kepustakaan Populer",
    2022,
    224,
    0,
  ],
  [
    "Statistika untuk Penelitian",
    "Siti Nurhaliza",
    "Matematika",
    "Pustaka Ilmu",
    2018,
    300,
    4,
  ],
  [
    "Kepemimpinan Modern",
    "Agus Setiawan",
    "Manajemen",
    "Pustaka Ilmu",
    2022,
    260,
    5,
  ],
  [
    "Gizi dan Kehidupan Sehat",
    "Intan Permata",
    "Kesehatan",
    "Sehat Sentosa",
    2020,
    205,
    6,
  ],
  [
    "Keamanan Siber",
    "Rizky Pratama",
    "Teknologi Informasi",
    "Informatika Press",
    2025,
    380,
    3,
  ],
  [
    "Perilaku Konsumen",
    "Nadya Putri",
    "Psikologi",
    "Cakrawala",
    2023,
    275,
    2,
  ],
].forEach((r) => add(...r));
add(
  "Laut Bercerita",
  "Leila S. Chudori",
  "Fiksi",
  "Kepustakaan Populer Gramedia",
  2017,
  379,
  5,
  "Laut Bercerita adalah novel karya Leila S. Chudori yang mengisahkan tentang seorang aktivis bernama Biru Laut yang hilang secara misterius pada masa Orde Baru. Novel ini menggambarkan perjuangan, kehilangan, dan harapan melalui kisah para sahabatnya yang terus mencari kebenaran.",
);
B[19].isbn = "978-602-424-694-5";
