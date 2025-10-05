// frontend/src/components/KenyaMap.jsx
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Props:
 *  - data: array of bloom records to show on map (already filtered by date in parent)
 *  - prediction: single prediction object (or null) with fields: county|city, latitude, longitude, predicted_ndvi, interpretation, anomaly, date
 *  - showAnomalies: boolean
 */
export default function KenyaMap({
  data = [],
  prediction = null,
  showAnomalies = true,
}) {
  const ndviToColor = (v) =>
    v >= 0.6 ? "#16a34a" : v >= 0.4 ? "#f59e0b" : "#dc2626";

  const ndviToRadius = (v) => 4 + Math.max(0, Math.min(1, v)) * 14;

  return (
    <div className="relative w-full h-[60vh] md:h-full z-0">
      <MapContainer
        center={[-0.0236, 37.9062]}
        zoom={6}
        className="h-full w-full rounded-lg overflow-hidden z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Historical / recorded markers */}
        {Array.isArray(data) &&
          data.map((d, i) =>
            d.lat && d.lon ? (
              <CircleMarker
                key={i}
                center={[d.lat, d.lon]}
                radius={ndviToRadius(d.ndvi ?? 0.4)}
                pathOptions={{
                  color: ndviToColor(d.ndvi ?? 0),
                  fillOpacity: 0.6,
                }}
              >
                <Tooltip>
                  <div className="min-w-[160px]">
                    <div>
                      <b>{d.county}</b>
                    </div>
                    <div>{new Date(d.date).toLocaleDateString()}</div>
                    <div>
                      NDVI:{" "}
                      {typeof d.ndvi === "number" ? d.ndvi.toFixed(2) : "—"}
                    </div>
                    <div>Rainfall: {d.rainfall ?? "—"}</div>
                    <div>Anomaly: {d.anomaly ?? "None"}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ) : null
          )}

        {/* Prediction marker (single) */}
        {prediction &&
          (prediction.latitude || prediction.lon || prediction.longitude) && (
            <CircleMarker
              center={[
                prediction.latitude ?? prediction.lat,
                prediction.longitude ?? prediction.lon,
              ]}
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
                    <b>{prediction.county ?? prediction.city}</b>
                  </div>
                  <div className="text-xs">{prediction.date}</div>
                  <div>
                    NDVI:{" "}
                    {typeof prediction.predicted_ndvi === "number"
                      ? prediction.predicted_ndvi.toFixed(3)
                      : "—"}
                  </div>
                  <div className="text-xs">{prediction.interpretation}</div>
                  <div>
                    {prediction.anomaly ? "⚠️ Anomaly" : "✅ No anomaly"}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          )}
      </MapContainer>

      {/* Legend (always visible, readable) */}
      <div className="absolute bottom-3 right-3 bg-white/95 p-3 rounded-lg shadow-md text-xs z-[1000] text-gray-800">
        <div className="font-semibold mb-1">NDVI Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded bg-green-600" />
          <span>Healthy ≥ 0.6</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>Moderate 0.4–0.6</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600" />
          <span>Low &lt; 0.4</span>
        </div>
      </div>
    </div>
  );
}
