const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchBlooms() {
  const r = await fetch(`${API}/blooms`);
  if (!r.ok) throw new Error(`Fetch blooms failed: ${r.status}`);
  return r.json();
}

export async function filterBlooms(county, year) {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  if (year) params.append("year", year);
  const r = await fetch(`${API}/blooms/filter?${params.toString()}`);
  if (!r.ok) throw new Error(`Filter failed: ${r.status}`);
  return r.json();
}

export async function requestPrediction(county, date) {
  const r = await fetch(`${API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ county, date }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Prediction failed: ${r.status} ${txt}`);
  }
  return r.json();
}
