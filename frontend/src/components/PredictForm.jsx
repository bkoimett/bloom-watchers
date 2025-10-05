// frontend/src/components/PredictForm.jsx
import React, { useState } from "react";
import { requestPrediction } from "../services/api";

export default function PredictForm({ defaultCity = "", onResult }) {
  const [city, setCity] = useState(defaultCity);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!city || !date) return setError("Please pick city and date");
    setLoading(true);
    try {
      const res = await requestPrediction(city, date);
      setLoading(false);
      onResult && onResult(res); // pass up to App
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="p-3 bg-base-100 rounded shadow-sm">
      <form onSubmit={submit} className="space-y-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="City (e.g., Kisumu)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="date"
          className="input input-bordered w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Predicting..." : "Get prediction"}
        </button>
      </form>

      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  );
}
