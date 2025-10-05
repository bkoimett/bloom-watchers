import React, { useState } from "react";
import { requestPrediction } from "../services/api";

export default function PredictForm({ defaultCounty = "", onResult }) {
  const [county, setCounty] = useState(defaultCounty || "");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!county || !date) return alert("Enter both county and date");
    setLoading(true);
    setError("");
    try {
      const res = await requestPrediction(county, date);
      onResult(res); // pass to parent (App)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 p-3 space-y-2">
      <div>
        <label className="block text-sm font-medium mb-1">County</label>
        <input
          type="text"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="input input-bordered w-full"
          placeholder="e.g., Kisumu"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Predicting..." : "Predict NDVI"}
      </button>
      {error && <div className="text-error text-sm">{error}</div>}
    </form>
  );
}
