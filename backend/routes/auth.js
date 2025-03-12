require('dotenv').config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
      console.log("📥 Dữ liệu nhận được khi đăng ký:", req.body);
      const { email, password, role } = req.body;
      if (!email || !password || !role) {
        return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
  
      // Lưu mật khẩu trực tiếp mà không cần hash
      const user = new User({ email, password, role });
      await user.save();
      
      res.json({ message: "Đăng ký thành công!" });
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
  

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log("📌 Đăng nhập với email:", email);
  
      const user = await User.findOne({ email });
  
      if (!user) {
        console.log("❌ Không tìm thấy user");
        return res.status(400).json({ message: "Email không tồn tại" });
      }
  
        console.log("🔑 Mật khẩu nhập:", `"${password}"`);  // Bao quanh chuỗi để kiểm tra khoảng trắng
        console.log("🔒 Mật khẩu nhập:", `"${user.password}"`);  // Bao quanh chuỗi để kiểm tra khoảng trắng

  
      // So sánh mật khẩu người dùng nhập với mật khẩu lưu trữ trực tiếp trong cơ sở dữ liệu
      if (password !== user.password) {
        console.log("❌ Sai mật khẩu");
        return res.status(400).json({ message: "Sai mật khẩu" });
      }
  
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.json({ token });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
  

module.exports = router;
