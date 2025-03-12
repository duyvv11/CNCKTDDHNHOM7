require("dotenv").config(); // Đọc biến môi trường từ .env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User"); // Import model User
const authRoutes = require("./routes/auth");
const Order = require("./models/Order")
const orderRoutes = require("./routes/orders");


const app = express();
app.use(express.json());
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected successfully!");

    // Kiểm tra danh sách người dùng sau khi kết nối thành công
    const users = await User.find();
    console.log("📌 Danh sách User:", users);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  }
};

connectDB();

app.use("/api/auth", require("./routes/auth"));
console.log("✅ Đã đăng ký route: /api/auth");
app.use("/api/orders", require("./routes/orders"));
console.log("✅ Đã đăng ký route: /api/orders");


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
