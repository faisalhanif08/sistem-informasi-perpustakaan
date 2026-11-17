/* ===== HELPER: pemanggil REST API backend ===== */
async function api(path, { method = "GET", body } = {}) {
  const res = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  if (!res.ok) {
    const err = new Error((data && data.pesan) || "Terjadi kesalahan (" + res.status + ")");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
