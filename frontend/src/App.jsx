// frontend/src/App.jsx
import React, { useEffect, useState, useMemo } from "react";
import KenyaMap from "./components/KenyaMap";
import FilterPanel from "./components/FilterPanel";
import InfoPanel from "./components/InfoPanel";
import { fetchBlooms, filterBlooms, predictCounty } from "./services/api";
import PredictForm from "./components/PredictForm";

export default function App() {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]); // filtered
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [dates, setDates] = useState([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchBlooms();
      // normalize date strings
      const normalized = data.map((d) => ({
        ...d,
        date: new Date(d.date).toISOString().slice(0, 10),
      }));
      setAllData(normalized);
      setDisplayData(normalized);
      const uniqueDates = Array.from(
        new Set(normalized.map((d) => d.date))
      ).sort((a, b) => new Date(a) - new Date(b));
      setDates(uniqueDates);
      setDateIndex(Math.max(0, uniqueDates.length - 1)); // default most recent
    }
    load();
  }, []);

  // compute unique counties and years for selects
  const counties = useMemo(
    () => Array.from(new Set(allData.map((d) => d.county))).sort(),
    [allData]
  );
  const years = useMemo(
    () =>
      Array.from(
        new Set(allData.map((d) => new Date(d.date).getFullYear()))
      ).sort(),
    [allData]
  );

  // apply filters from controls
  const applyFilters = async () => {
    // prefer backend filtered endpoint
    const year = selectedYear || "";
    const county = selectedCounty || "";
    const res = await filterBlooms(county, year);
    const normalized = res.map((d) => ({
      ...d,
      date: new Date(d.date).toISOString().slice(0, 10),
    }));
    setDisplayData(normalized);
    const uniqueDates = Array.from(new Set(normalized.map((d) => d.date))).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    setDates(uniqueDates);
    setDateIndex(0);
  };

  const handlePredict = async () => {
    const county = selectedCounty || "All";
    const preds = await predictCounty(county, 6);
    setPredictions(preds);
  };

  // compute the currently visible records based on date slider
  const currentDate = dates.length ? dates[dateIndex] : null;
  const visibleRecords = currentDate
    ? displayData.filter((d) => d.date === currentDate)
    : displayData;

  return (
    <div className="h-screen flex">
      {/* LEFT: map + controls */}
      <div className="w-2/3 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">🌍 Bloom Watchers - Kenya</h1>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAnomalies}
                onChange={(e) => setShowAnomalies(e.target.checked)}
              />
              <span className="text-sm">Show anomalies</span>
            </label>
          </div>
        </div>

        <KenyaMap
          data={displayData}
          showAnomalies={showAnomalies}
          dateFilter={currentDate}
        />

        <div className="mt-3 flex gap-2">
          <button className="btn btn-primary" onClick={applyFilters}>
            Filter
          </button>
          <button className="btn btn-secondary" onClick={handlePredict}>
            Predict
          </button>
        </div>

        {/* small hint/legend */}
        <div className="text-xs text-gray-500 mt-2">
          Use the filter panel on the right to narrow the view. Use the time
          slider to step through snapshots.
        </div>
      </div>

      {/* RIGHT: filters + info */}
      <div className="w-1/3 p-4 bg-base-200 overflow-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Controls</h2>
          <FilterPanel
            counties={counties}
            years={years}
            selectedCounty={selectedCounty}
            setSelectedCounty={setSelectedCounty}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            dates={dates}
            dateIndex={dateIndex}
            setDateIndex={setDateIndex}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Bloom Insights</h2>
          <InfoPanel records={visibleRecords} predictions={predictions} />
        </div>

        <PredictForm/>


      </div>
    </div>
  );
}
