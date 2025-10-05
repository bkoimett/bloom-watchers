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

  // handle prediction result from PredictForm
  const handlePredictionResult = (pred) => {
    // pred is { city, latitude, longitude, date, predicted_ndvi, interpretation, anomaly }
    setPrediction(pred);
    // optionally add to a predictions array if you want to store multiple
  };

  const currentDate = dates.length ? dates[dateIndex] : null;
  // show only points matching slider date
  const visibleRecords = currentDate
    ? displayData.filter((d) => d.date === currentDate)
    : displayData;

  return (
    <div className="h-screen flex">
      <div className="w-2/3 p-4 flex flex-col">


        <KenyaMap
          data={visibleRecords}
          predictions={prediction ? [prediction] : []}
        />

        <div className="mt-3 flex gap-2">
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply filters
          </button>
        </div>
      </div>

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

        <div className="mb-4">
          <h2 className="text-lg font-semibold">Predict NDVI</h2>
          <PredictForm
            defaultCity={selectedCounty}
            onResult={handlePredictionResult}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Bloom Insights</h2>
          <InfoPanel records={visibleRecords} prediction={prediction} />
        </div>
      </div>
    </div>
  );
}
