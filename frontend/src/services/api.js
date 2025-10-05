const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

export async function fetchPrediction(city, date) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, date }),
  });

  if (!res.ok) throw new Error("Failed to fetch prediction");
  return res.json();
}
