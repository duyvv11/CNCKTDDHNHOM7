require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders"); // Chỉ cần import routes

const app = express();
app.use(express.json());
app.use(cors());


// 🔹 Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
connectDB();

// 🔹 Sử dụng routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// 🔹 Khởi động server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
