/* ===== MIDDLEWARE: wajib login & wajib peran ===== */
function wajibLogin(req, res, next) {
  if (!req.session.idPengguna)
    return res.status(401).json({ pesan: "Silakan login terlebih dahulu." });
  next();
}

// Pakai setelah wajibLogin, contoh: wajibPeran("Pustakawan")
function wajibPeran(...daftarPeran) {
  return (req, res, next) => {
    if (!daftarPeran.includes(req.session.peran))
      return res
        .status(403)
        .json({ pesan: `Halaman ini khusus untuk ${daftarPeran.join(" / ")}.` });
    next();
  };
}

module.exports = { wajibLogin, wajibPeran };
