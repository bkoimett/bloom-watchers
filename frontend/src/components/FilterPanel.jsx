// frontend/src/components/FilterPanel.jsx
import React from "react";

export default function FilterPanel({
  counties = [],
  years = [],
  selectedCounty,
  setSelectedCounty,
  selectedYear,
  setSelectedYear,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* County Selector */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">County</label>
        <select
          value={selectedCounty || ""}
          onChange={(e) => setSelectedCounty(e.target.value)}
          className="select select-bordered w-40"
        >
          <option value="">All</option>
          {counties.length > 0 ? (
            counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
      </div>

      {/* Year Selector */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">Year</label>
        <select
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="select select-bordered w-32"
        >
          <option value="">All</option>
          {years.length > 0 ? (
            years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
      </div>
    </div>
  );
}
