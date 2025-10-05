import express from "express";
import BloomData from "../models/BloomData.js";

const router = express.Router();

// GET all data
router.get("/", async (req, res) => {
  const data = await BloomData.find();
  res.json(data);
});

// GET /api/blooms/filter?county=Machakos&year=2025
router.get("/filter", async (req, res) => {
  try {
    const { county, year } = req.query;
    if (!county || !year)
      return res.status(400).json({ error: "county and year are required" });

    const start = new Date(`${year}-01-01`);
    const end = new Date(`${Number(year) + 1}-01-01`);

    const blooms = await BloomData.find({
      county,
      date: { $gte: start, $lt: end },
    });

    res.json(blooms);
  } catch (err) {
    console.error("❌ Filter error:", err.message);
    res.status(500).json({ error: "Failed to filter bloom data" });
  }
});


// Add new data (from Python preprocessing or manual insert)
router.post("/", async (req, res) => {
  const bloom = new BloomData(req.body);
  await bloom.save();
  res.json(bloom);
});

export default router;
