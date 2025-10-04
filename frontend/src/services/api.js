const API_URL = "http://localhost:5000/api";

export async function fetchBlooms() {
  const res = await fetch(`${API_URL}/blooms`);
  return res.json();
}

export async function filterBlooms(county, year) {
  const res = await fetch(
    `${API_URL}/blooms/filter?county=${county}&year=${year}`
  );
  return res.json();
}
