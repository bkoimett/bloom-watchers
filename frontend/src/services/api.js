// frontend/src/services/api.js
const API = "/api";

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

export async function predictCounty(county, months = 6) {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  params.append("months", months);
  const r = await fetch(`${API}/predict?${params.toString()}`);
  return r.json();
}
