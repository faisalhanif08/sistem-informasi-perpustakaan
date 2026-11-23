/* ===== UTIL / HELPER BERSAMA ===== */
const $ = (s) => document.querySelector(s);
const app = $("#app");

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

// 3000 -> "Rp3.000"
function rupiah(n) {
  return "Rp" + (Number(n) || 0).toLocaleString("id-ID");
}

// "2026-11-25" -> "25 November 2026" (selain format YYYY-MM-DD dikembalikan apa adanya)
function tanggalIndo(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  if (!m) return s || "-";
  const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
    "Agustus", "September", "Oktober", "November", "Desember"];
  return `${+m[3]} ${bulan[+m[2] - 1]} ${m[1]}`;
}

// "Belum Lunas" -> "s-BelumLunas" (nama kelas CSS untuk label status)
function kelasStatus(status) {
  return "s-" + String(status || "").replace(/\s+/g, "");
}

let toastTimer;
function toast(text, isErr) {
  const t = $("#toast");
  t.textContent = text;
  t.className = "show" + (isErr ? " err" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ""), 3200);
}

function wishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch (e) {
    return [];
  }
}

function saveWishlist(a) {
  try {
    localStorage.setItem("wishlist", JSON.stringify(a));
  } catch (e) {}
}

function opts(list, allLabel, selected) {
  return (
    '<option value="">' +
    allLabel +
    "</option>" +
    list
      .map(
        (v) =>
          "<option " +
          (String(v) === String(selected) ? "selected" : "") +
          ">" +
          esc(v) +
          "</option>",
      )
      .join("")
  );
}
