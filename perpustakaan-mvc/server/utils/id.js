/* ===== UTIL: pembuat ID VARCHAR(20) =====
   Contoh: RSV1763370000000A1B  (prefix 3 huruf + 13 digit waktu + 4 hex acak) */
const crypto = require("crypto");

function buatId(prefix) {
  return prefix + Date.now() + crypto.randomBytes(2).toString("hex").toUpperCase();
}

module.exports = { buatId };
