// backend/routes/predict.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get("/", async (req, res) => {
  const { county = "All", months = 6 } = req.query;
  const pythonUrl = process.env.PYTHON_URL || "http://localhost:8000/predict";

  try {
    // try python microservice
    const response = await axios.get(pythonUrl, {
      params: { county, months },
      timeout: 5000,
    });
    return res.json(response.data);
  } catch (err) {
    console.warn(
      "Python service unreachable, returning mock predictions:",
      err.message
    );

    // fallback to local mock_predictions.json
    const file = path.join(__dirname, "..", "data", "mock_predictions.json");
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file);
      const json = JSON.parse(raw);
      const preds = json[county] || json["default"] || [];
      return res.json(preds);
    }
    return res.status(502).json({ error: "Prediction service unavailable" });
  }
});

module.exports = router;
