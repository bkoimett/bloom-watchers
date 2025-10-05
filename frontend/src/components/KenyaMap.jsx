import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ====== API FUNCTIONS ======
async function fetchBlooms() {
  const r = await fetch(`${API}/blooms`);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return r.json();
}

async function filterBlooms(county, year) {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  if (year) params.append("year", year);
  const r = await fetch(`${API}/blooms/filter?${params.toString()}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return r.json();
}

async function predictCounty(county) {
  const body = JSON.stringify({
    city: county,
    date: new Date().toISOString().slice(0, 10),
  });
  const r = await fetch(`${API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return r.json();
}

// ====== HELPER FUNCTIONS ======
const ndviToColor = (v) =>
  v >= 0.6 ? "#16a34a" : v >= 0.4 ? "#f59e0b" : "#dc2626";

const ndviToRadius = (v) => 4 + Math.max(0, Math.min(1, v)) * 14;

// ====== MAP COMPONENT ======
function KenyaMap({ data, predictions, showAnomalies }) {
  return (
    <div className="relative w-full h-[60vh] md:h-full z-0">
      <MapContainer
        center={[-0.0236, 37.9062]}
        zoom={6}
        className="h-full w-full rounded-lg overflow-hidden z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Bloom Markers */}
        {data.map((d, i) =>
          d.lat && d.lon ? (
            <CircleMarker
              key={i}
              center={[d.lat, d.lon]}
              radius={ndviToRadius(d.ndvi)}
              pathOptions={{
                color: ndviToColor(d.ndvi),
                fillOpacity: 0.6,
              }}
            >
              <Tooltip>
                <div>
                  <b>{d.county}</b> <br />
                  {new Date(d.date).toLocaleDateString()} <br />
                  NDVI: {d.ndvi.toFixed(2)} <br />
                  Rainfall: {d.rainfall ?? "—"} <br />
                  Anomaly: {d.anomaly ?? "None"}
                </div>
              </Tooltip>
            </CircleMarker>
          ) : null
        )}

        {/* Prediction Marker */}
        {predictions?.latitude && predictions?.longitude && (
          <CircleMarker
            center={[predictions.latitude, predictions.longitude]}
            radius={8}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#60a5fa",
              fillOpacity: 0.9,
              dashArray: "3",
            }}
          >
            <Tooltip>
              <div>
                <b>{predictions.city}</b> <br />
                NDVI: {predictions.predicted_ndvi.toFixed(3)} <br />
                {predictions.interpretation} <br />
                {predictions.anomaly ? "⚠️ Anomaly" : "✅ Stable"}
              </div>
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>

      {/* LEGEND */}
      <div className="absolute bottom-3 right-3 bg-white/90 p-3 rounded-lg shadow-md text-xs z-[1000] text-gray-800">
        <div className="font-semibold mb-1">NDVI Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded bg-green-600"></div>
          Healthy ≥ 0.6
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          Moderate 0.4–0.6
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600"></div>
          Low &lt; 0.4
        </div>
      </div>
    </div>
  );
}

// ====== MAIN APP ======
export default function App() {
  const [data, setData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [county, setCounty] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const blooms = await fetchBlooms();
        setData(blooms);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const res = await filterBlooms(county, year);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      const res = await predictCounty(county);
      setPredictions(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const counties = [...new Set(data.map((d) => d.county))].sort();

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">🌸 Gaia Bloom Watchers</h1>
        <p className="text-sm text-green-100">
          Monitoring algal blooms across Kenya
        </p>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* LEFT: MAP */}
        <div className="relative flex-1 min-h-[60vh]">
          <KenyaMap
            data={data}
            predictions={predictions}
            showAnomalies={showAnomalies}
          />
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <aside className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l p-4 overflow-y-auto relative z-[2000]">
          <h2 className="text-lg font-bold mb-3">Filters</h2>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            County
          </label>
          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="select select-bordered w-full mb-3"
          >
            <option value="">Select county</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2024"
            className="input input-bordered w-full mb-3"
          />

          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={showAnomalies}
              onChange={(e) => setShowAnomalies(e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Show anomalies</span>
          </label>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-3 my-4">
            <button
              onClick={handleFilter}
              disabled={loading}
              className="btn btn-accent w-full"
            >
              🔍 Apply Filters
            </button>
            <button
              onClick={handlePredict}
              disabled={loading || !county}
              className="btn btn-primary w-full"
            >
              🔮 Predict
            </button>
          </div>

          {error && (
            <div className="alert alert-error text-xs mt-2">{error}</div>
          )}

          <div className="divider my-3"></div>
          <div className="text-sm text-gray-500">
            Records loaded: {data.length}
          </div>
          {predictions && (
            <div className="mt-4 text-sm">
              <b>Predicted NDVI:</b> {predictions.predicted_ndvi.toFixed(3)}
              <br />
              {predictions.interpretation}
              <br />
              {predictions.anomaly ? "⚠️ Anomaly" : "✅ Stable"}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
