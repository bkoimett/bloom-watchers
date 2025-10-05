// frontend/src/components/KenyaMap.jsx
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

function ndviToColor(v) {
  if (v >= 0.6) return "#16a34a"; // green
  if (v >= 0.4) return "#f59e0b"; // yellow
  return "#dc2626"; // red
}

function ndviToRadius(v) {
  // scale 0..1 -> 4..18
  return 4 + Math.max(0, Math.min(1, v)) * 14;
}

export default function KenyaMap({
  data = [],
  showAnomalies = true,
  dateFilter = null,
}) {
  // filter by exact date (if dateFilter provided)
  const filtered = dateFilter
    ? data.filter(
        (d) => new Date(d.date).toISOString().slice(0, 10) === dateFilter
      )
    : data;

  return (
    <div className="relative w-full" style={{ flex: 1 }}>
      <MapContainer
        center={[-0.0236, 37.9062]}
        zoom={6}
        style={{
          height: "70vh",
          width: "100%",
          position: "relative",
          zIndex: 0,
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                <div style={{ minWidth: 160 }}>
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
      </MapContainer>

      {/* legend - increased z-index */}
      <div
        className="absolute bottom-4 right-4 p-3 bg-white rounded shadow-lg text-gray-800"
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
