// frontend/src/App.jsx
import React, { useEffect, useState, useMemo } from "react";
import KenyaMap from "./components/KenyaMap";
import FilterPanel from "./components/FilterPanel";
import InfoPanel from "./components/InfoPanel";
import PredictForm from "./components/PredictForm";
import { fetchBlooms, filterBlooms } from "./services/api";

export default function App() {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dates, setDates] = useState([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [prediction, setPrediction] = useState(null);

  // Load all bloom data once
  useEffect(() => {
    (async () => {
      const data = await fetchBlooms();
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
      setDateIndex(Math.max(0, uniqueDates.length - 1));
    })();
  }, []);

  // Build list of unique counties & years
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

  // Apply filters
  const applyFilters = async () => {
    const res = await filterBlooms(selectedCounty, selectedYear);
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

  // Handle prediction result
  const handlePredictionResult = (pred) => {
    setPrediction(pred);
  };

  const currentDate = dates.length ? dates[dateIndex] : null;
  const visibleRecords = currentDate
    ? displayData.filter((d) => d.date === currentDate)
    : displayData;

  return (
    <div className="h-screen flex flex-wrap">
      {/* LEFT SIDE: Map and Apply Filters */}
      <div className="w-full md:w-2/3 p-4 flex flex-col">
        {/* <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">🌍 Bloom Watchers - Kenya</h1>
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
        </div> */}

        <KenyaMap
          data={visibleRecords}
          predictions={prediction ? [prediction] : []}
        />
      </div>

      {/* RIGHT SIDE: Controls, Prediction, Info */}
      <div className="w-full md:w-1/3 p-4 bg-base-200 overflow-auto flex flex-col flex-wrap">
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

        <div className="mb-4">
          <h2 className="text-lg font-semibold">Predict NDVI</h2>
          <PredictForm
            defaultCity={selectedCounty}
            onResult={handlePredictionResult}
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
