// frontend/src/App.jsx
import React, { useEffect, useState, useMemo } from "react";
import KenyaMap from "./components/KenyaMap";
import FilterPanel from "./components/FilterPanel";
import InfoPanel from "./components/InfoPanel";
import PredictForm from "./components/PredictForm";
import { fetchBlooms, requestPrediction } from "./services/api";

export default function App() {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dates, setDates] = useState([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all data once
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchBlooms();
        const normalized = (data || []).map((d) => ({
          ...d,
          date: new Date(d.date).toISOString().slice(0, 10),
        }));
        setAllData(normalized);
        setDisplayData(normalized);

        const uniqueDates = Array.from(new Set(normalized.map((d) => d.date))).sort(
          (a, b) => new Date(a) - new Date(b)
        );
        setDates(uniqueDates);
        setDateIndex(Math.max(0, uniqueDates.length - 1));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
      }
    })();
  }, []);

  const counties = useMemo(
    () => Array.from(new Set(allData.map((d) => d.county))).sort(),
    [allData]
  );

  const years = useMemo(() => {
    const allYears = Array.from(
      new Set(allData.map((d) => new Date(d.date).getFullYear()))
    ).sort((a, b) => a - b);
    return ["All", ...allYears];
  }, [allData]);

  // Apply filters and update slider
  const applyFilters = async () => {
    try {
      setLoading(true);

      let filtered = allData;

      if (selectedCounty && selectedCounty !== "All") {
        filtered = filtered.filter((d) => d.county === selectedCounty);
      }

      if (selectedYear && selectedYear !== "All") {
        filtered = filtered.filter(
          (d) => new Date(d.date).getFullYear() === Number(selectedYear)
        );
      }

      const normalized = filtered.map((d) => ({
        ...d,
        date: new Date(d.date).toISOString().slice(0, 10),
        anomaly: !!d.anomaly,
      }));

      setDisplayData(normalized);

      const uniqueDates = Array.from(new Set(normalized.map((d) => d.date))).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      setDates(uniqueDates);
      setDateIndex(uniqueDates.length - 1);
    } catch (err) {
      console.error("❌ Filter failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Predict using backend
  const handlePredict = async (
    countyToPredict = selectedCounty,
    dateToPredict = null
  ) => {
    if (!countyToPredict) {
      alert("Select a county first");
      return;
    }
    try {
      setLoading(true);
      const date =
        dateToPredict ?? dates[dateIndex] ?? new Date().toISOString().slice(0, 10);
      const res = await requestPrediction(countyToPredict, date);
      setPrediction(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const currentDate = dates.length ? dates[dateIndex] : null;
  const visibleRecords = currentDate
    ? displayData.filter((d) => d.date === currentDate)
    : displayData;

  return (
    <div className="h-screen flex flex-wrap">
      {/* LEFT: map + slider + filters */}
      <div className="w-full md:w-2/3 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-3">🌍 Bloom Watchers - Kenya</h1>

        {/* Map */}
        <div className="flex-1 border rounded-lg overflow-hidden">
          <KenyaMap
            data={visibleRecords}
            prediction={prediction}
            showAnomalies={true}
          />
        </div>

        {/* Slider below map */}
        <div className="mt-4">
          {dates.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm mb-1 font-semibold">
                Date: {dates[dateIndex]}
              </label>
              <input
                type="range"
                min="0"
                max={dates.length - 1}
                value={dateIndex}
                onChange={(e) => setDateIndex(Number(e.target.value))}
                className="w-full range range-primary"
              />
            </div>
          )}

          {/* Filters + Apply button together */}
          <div className="flex flex-wrap items-end gap-3">
            <FilterPanel
              counties={counties}
              years={years}
              selectedCounty={selectedCounty}
              setSelectedCounty={setSelectedCounty}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />

            <button
              className="btn btn-primary mt-2"
              onClick={applyFilters}
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Predict + Info */}
      <div className="w-full md:w-1/3 p-4 bg-base-200 overflow-auto flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Predict NDVI</h2>
          <PredictForm
            defaultCounty={selectedCounty}
            onResult={(pred) => setPrediction(pred)}
            onPredict={handlePredict}
          />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Bloom Insights</h2>
          <InfoPanel records={visibleRecords} prediction={prediction} />
        </div>
      </div>
    </div>
  );
}
