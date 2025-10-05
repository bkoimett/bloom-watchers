// frontend/src/components/InfoPanel.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function computeStats(records) {
  if (!records.length) return { avg: 0, anomalies: 0 };
  const avg = records.reduce((s, r) => s + r.ndvi, 0) / records.length;
  const anomalies = records.filter((r) => r.anomaly).length;
  return { avg: avg, anomalies };
}

export default function InfoPanel({ records = [], predictions = [] }) {
  const stats = computeStats(records);

  // build trend data grouped by date (average)
  const grouped = {};
  records.forEach((r) => {
    const day = new Date(r.date).toISOString().slice(0, 10);
    grouped[day] = grouped[day] || { date: day, ndvi: 0, count: 0 };
    grouped[day].ndvi += r.ndvi;
    grouped[day].count += 1;
  });
  const trend = Object.values(grouped)
    .map((g) => ({ date: g.date, ndvi: +(g.ndvi / g.count).toFixed(3) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <div className="card bg-base-100 p-3 mb-3">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-600">Average NDVI</div>
            <div className="text-2xl font-bold">{stats.avg.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Anomalous regions</div>
            <div className="text-2xl font-bold text-error">
              {stats.anomalies}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">NDVI trend</h3>
        {trend.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString()}
              />
              <YAxis domain={[0, 1]} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="ndvi"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-gray-500">
            No data for selected region/time
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Predictions</h3>
        {predictions.length ? (
          <div>
            {predictions.map((p, i) => (
              <div key={i} className="card p-2 mb-2">
                <div className="text-sm">
                  <b>{new Date(p.ds).toLocaleDateString()}</b>
                </div>
                <div className="text-xs">
                  Predicted NDVI: <b>{p.yhat.toFixed(2)}</b>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No prediction loaded. Click Predict.
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Anomalies</h3>
        {records.filter((r) => r.anomaly).length ? (
          records
            .filter((r) => r.anomaly)
            .map((a, i) => (
              <div key={i} className="card bg-red-50 p-2 mb-2">
                <div>
                  <b>{a.county}</b> — {new Date(a.date).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  Type: {a.anomaly} · NDVI: {a.ndvi.toFixed(2)}
                </div>
              </div>
            ))
        ) : (
          <div className="text-sm text-gray-500">
            No anomalies for selection
          </div>
        )}
      </div>
    </div>
  );
}
