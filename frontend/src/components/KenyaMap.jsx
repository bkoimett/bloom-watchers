import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// API Configuration
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// API Functions
async function fetchBlooms() {
  console.log("🚀 Fetching from:", `${API}/blooms`);
  const r = await fetch(`${API}/blooms`);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  const data = await r.json();
  console.log("✅ Received blooms:", data);
  return data;
}

async function filterBlooms(county, year) {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  if (year) params.append("year", year);
  console.log("🔍 Filtering:", `${API}/blooms?${params.toString()}`);
  const r = await fetch(`${API}/blooms?${params.toString()}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return r.json();
}

async function predictCounty(county, months = 6) {
  const params = new URLSearchParams();
  if (county) params.append("county", county);
  params.append("months", months);
  console.log("🔮 Predicting:", `${API}/predict?${params.toString()}`);
  const r = await fetch(`${API}/predict?${params.toString()}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return r.json();
}

// NDVI Color Helper
function ndviToColor(v) {
  if (v >= 0.6) return "#16a34a"; // green
  if (v >= 0.4) return "#f59e0b"; // yellow
  return "#dc2626"; // red
}

// NDVI Radius Helper
function ndviToRadius(v) {
  return 4 + Math.max(0, Math.min(1, v)) * 14;
}

// Kenya Map Component
function KenyaMap({
  data = [],
  predictions = null,
  showAnomalies = true,
  dateFilter = null,
}) {
  const filtered = dateFilter
    ? data.filter(
        (d) => new Date(d.date).toISOString().slice(0, 10) === dateFilter
      )
    : data;

  return (
    <div className="relative w-full h-[70vh]">
      <MapContainer
        center={[-0.0236, 37.9062]}
        zoom={6}
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 0,
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Historical Data Markers */}
        {filtered.map((d, i) => {
          if (!d.lat || !d.lon) return null;
          if (!showAnomalies && d.anomaly) return null;
          return (
            <CircleMarker
              key={i}
              center={[d.lat, d.lon]}
              radius={ndviToRadius(d.ndvi)}
              pathOptions={{ color: ndviToColor(d.ndvi), fillOpacity: 0.6 }}
            >
              <Tooltip>
                <div className="min-w-[160px]">
                  <div>
                    <b>County:</b> {d.county}
                  </div>
                  <div>
                    <b>Date:</b> {new Date(d.date).toLocaleDateString()}
                  </div>
                  <div>
                    <b>NDVI:</b> {d.ndvi.toFixed(2)}
                  </div>
                  <div>
                    <b>Rainfall:</b> {d.rainfall ?? "—"}
                  </div>
                  <div>
                    <b>Anomaly:</b> {d.anomaly ?? "None"}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Prediction Markers */}
        {Array.isArray(predictions) &&
          predictions.map((p, idx) =>
            p.latitude && p.longitude ? (
              <CircleMarker
                key={`pred-${idx}`}
                center={[p.latitude, p.longitude]}
                radius={8}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#60a5fa",
                  fillOpacity: 0.9,
                  dashArray: "3",
                }}
              >
                <Tooltip>
                  <div className="min-w-[140px]">
                    <div>
                      <b>Predicted — {p.city}</b>
                    </div>
                    <div className="text-xs">{p.date}</div>
                    <div>
                      <b>NDVI:</b> {p.predicted_ndvi.toFixed(3)}
                    </div>
                    <div className="text-xs">{p.interpretation}</div>
                    <div>{p.anomaly ? "⚠️ Anomaly" : "✅ No anomaly"}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ) : null
          )}

        {/* Single Prediction */}
        {predictions && !Array.isArray(predictions) && predictions.latitude && (
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
              <div className="min-w-[140px]">
                <div>
                  <b>Predicted — {predictions.city}</b>
                </div>
                <div className="text-xs">{predictions.date}</div>
                <div>
                  <b>NDVI:</b> {predictions.predicted_ndvi.toFixed(3)}
                </div>
                <div className="text-xs">{predictions.interpretation}</div>
                <div>
                  {predictions.anomaly ? "⚠️ Anomaly" : "✅ No anomaly"}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Legend */}
      <div
        className="absolute bottom-4 right-4 p-3 bg-white rounded-lg shadow-lg"
        style={{ zIndex: 1000 }}
      >
        <div className="text-xs font-semibold mb-2 text-gray-900">
          NDVI Legend
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded" style={{ background: "#16a34a" }} />
          <span className="text-xs text-gray-800">Healthy (≥0.6)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded" style={{ background: "#f59e0b" }} />
          <span className="text-xs text-gray-800">Moderate (0.4-0.6)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: "#dc2626" }} />
          <span className="text-xs text-gray-800">Low (&lt;0.4)</span>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [data, setData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        console.log("🚀 Starting to fetch blooms...");
        console.log("📍 API URL:", API);
        const blooms = await fetchBlooms();
        console.log("✅ Blooms loaded:", blooms);
        setData(blooms);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to load blooms:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle filter
  const handleFilter = async () => {
    try {
      setLoading(true);
      const filtered = await filterBlooms(selectedCounty, selectedYear);
      setData(filtered);
      setError(null);
    } catch (err) {
      console.error("❌ Filter error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle prediction
  const handlePredict = async () => {
    if (!selectedCounty) {
      alert("Please select a county first");
      return;
    }
    try {
      setLoading(true);
      const pred = await predictCounty(selectedCounty, 6);
      setPredictions(pred);
      setError(null);
    } catch (err) {
      console.error("❌ Prediction error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique counties
  const counties = [...new Set(data.map((d) => d.county))].sort();

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <div className="text-xl font-semibold text-gray-700">
            Loading bloom data...
          </div>
          <div className="text-sm text-gray-500 mt-2">Connecting to: {API}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold">🌸 Gaia Bloom Watchers </h1>
        <p className="text-green-100 mt-1">
          Monitoring algal blooms across Kenya
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <strong>Error:</strong> {error}
          <div className="text-sm mt-1">API: {API}</div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 bg-white shadow">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Counties</option>
              {counties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              placeholder="e.g., 2024"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleFilter}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            🔍 Filter
          </button>

          <button
            onClick={handlePredict}
            disabled={loading || !selectedCounty}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            🔮 Predict
          </button>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnomalies}
              onChange={(e) => setShowAnomalies(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show Anomalies</span>
          </label>

          <div className="ml-auto text-sm text-gray-600">
            <strong>{data.length}</strong> records loaded
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="p-4">
        <KenyaMap
          data={data}
          predictions={predictions}
          showAnomalies={showAnomalies}
        />
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gray-100 text-xs text-gray-600">
        <div>API Endpoint: {API}</div>
        <div>Data Count: {data.length}</div>
        <div>
          Predictions:{" "}
          {predictions
            ? Array.isArray(predictions)
              ? predictions.length
              : 1
            : 0}
        </div>
      </div>
    </div>
  );
}
