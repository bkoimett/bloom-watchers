// frontend/src/components/FilterPanel.jsx
import React from "react";

export default function FilterPanel({
  counties = [],
  years = [],
  selectedCounty,
  setSelectedCounty,
  selectedYear,
  setSelectedYear,
  dates,
  dateIndex,
  setDateIndex,
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">County</label>
        <select
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">All counties</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Time slider</label>
        <input
          type="range"
          min="0"
          max={Math.max(0, dates.length - 1)}
          value={dateIndex}
          onChange={(e) => setDateIndex(parseInt(e.target.value, 10))}
          className="range range-primary w-full"
        />
        <div className="text-xs mt-1">
          {dates.length
            ? new Date(dates[dateIndex]).toLocaleDateString()
            : "No dates"}
        </div>
      </div>
    </div>
  );
}
