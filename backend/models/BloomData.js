import mongoose from "mongoose";

const BloomDataSchema = new mongoose.Schema({
  county: String,
  date: Date,
  ndvi: Number,
  anomaly: String, // e.g. "hyacinth"
  rainfall: Number,
});

export default mongoose.model("BloomData", BloomDataSchema);
