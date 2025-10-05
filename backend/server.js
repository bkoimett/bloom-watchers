const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "http://localhost:3000", // Alternative local
      process.env.FRONTEND_URL, // Production Vercel URL
      "https://bloom-watchers-frontend.vercel.app", // Hardcode as backup
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const bloomRoutes = require("./routes/blooms");
const predictRoutes = require("./routes/predict");

app.use("/api/blooms", bloomRoutes);
app.use("/api/predict", predictRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
