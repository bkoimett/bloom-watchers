const API = import.meta.env.VITE_API_URL || "/api";

export async function fetchBlooms() {
  const r = await fetch(`${API}/blooms`);
  return r.json();
}

export async function filterBlooms(county, year) {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  if (year) params.append("year", year);
  const r = await fetch(`${API}/blooms?${params.toString()}`);
  return r.json();
}

// NEW: call backend predict route (which forwards to Python)
export async function requestPrediction(city, date) {
  const r = await fetch(`${API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, date }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Prediction failed: ${r.status} ${txt}`);
  }
  return r.json();
}
