import express from "express";
import BloomData from "../models/BloomData.js";

const router = express.Router();

// GET all data
router.get("/", async (req, res) => {
  const data = await BloomData.find();
  res.json(data);
});

// Filter by county + year
router.get("/filter", async (req, res) => {
  const { county, year } = req.query;
  const query = {};
  if (county) query.county = county;
  if (year)
    query.date = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };

  const data = await BloomData.find(query);
  res.json(data);
});

// Add new data (from Python preprocessing or manual insert)
router.post("/", async (req, res) => {
  const bloom = new BloomData(req.body);
  await bloom.save();
  res.json(bloom);
});

export default router;
