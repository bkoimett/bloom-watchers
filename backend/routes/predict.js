// backend/routes/predict.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const PYTHON_API =
  process.env.PYTHON_API_URL || "https://my-earth-access.onrender.com";

// POST /api/predict
// Body: { city, date }
router.post("/", async (req, res) => {
  const { city, date } = req.body || {};

  if (!city || !date) {
    return res
      .status(400)
      .json({ error: "city and date are required in request body" });
  }

  try {
    // Forward request to Python FastAPI
    const response = await axios.post(
      `${PYTHON_API}/predict`,
      { city, date },
      { timeout: 10000 }
    );
    return res.json(response.data);
  } catch (err) {
    console.warn(
      "Python service not reachable or returned error. Falling back to mock. Err:",
      err.message
    );

    // fallback: read backend/data/mock_predictions.json if present
    const file = path.join(__dirname, "..", "data", "mock_predictions.json");
    if (fs.existsSync(file)) {
      try {
        const raw = fs.readFileSync(file);
        const all = JSON.parse(raw);
        // If specific city exists in mock file, return that, else return 'default' or a synthetic entry
        const mock = all[city] || all["default"];
        if (Array.isArray(mock)) {
          // If mock is an array of future predictions, pick the nearest date entry or return first
          // try to find exact date match
          const exact = mock.find((m) => m.ds === date);
          if (exact)
            return res.json({
              city,
              latitude: 0,
              longitude: 0,
              date: exact.ds,
              predicted_ndvi: exact.yhat,
              interpretation: "Mock",
              anomaly: false,
            });
          // else return first mock
          const first = mock[0];
          return res.json({
            city,
            latitude: 0,
            longitude: 0,
            date: first.ds,
            predicted_ndvi: first.yhat,
            interpretation: "Mock",
            anomaly: false,
          });
        } else if (typeof mock === "object") {
          return res.json(mock);
        }
      } catch (e) {
        console.error("Failed to parse mock_predictions.json", e);
      }
    }

    // final fallback: simple synthetic response
    return res.json({
      city,
      latitude: 0,
      longitude: 0,
      date,
      predicted_ndvi: 0.5,
      interpretation: "Fallback mock: moderate vegetation",
      anomaly: false,
    });
  }
});

module.exports = router;
