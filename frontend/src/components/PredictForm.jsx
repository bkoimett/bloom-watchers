import { useState } from "react";
import { fetchPrediction } from "../services/api";

export default function PredictForm() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const data = await fetchPrediction(city, date);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-primary">Predict NDVI</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="City (e.g., Kisumu)"
          className="input input-bordered w-full"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="date"
          className="input input-bordered w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Predict
        </button>
      </form>

      {error && <p className="text-error mt-3">{error}</p>}

      {result && (
        <div className="mt-4 p-3 bg-base-200 rounded-lg">
          <p>
            <strong>City:</strong> {result.city}
          </p>
          <p>
            <strong>Date:</strong> {result.date}
          </p>
          <p>
            <strong>NDVI:</strong> {result.predicted_ndvi.toFixed(3)}
          </p>
          <p>
            <strong>Interpretation:</strong> {result.interpretation}
          </p>
          <p>
            <strong>Anomaly:</strong> {result.anomaly ? "⚠️ Yes" : "✅ No"}
          </p>
        </div>
      )}
    </div>
  );
}
