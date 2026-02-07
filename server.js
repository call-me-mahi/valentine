require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

// Routes
app.use("/api/love", require("./routes/loveRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes")); // 💳 Razorpay backend

// Health check
app.get("/", (req, res) => {
    res.send("❤️ Love Journey Backend is running");
});

// 🧹 Cron Jobs (AUTO DELETE EXPIRED PAGES)
require("./cron/cleanupExpiredLovePages");

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
