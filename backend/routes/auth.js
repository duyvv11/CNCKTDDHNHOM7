require("dotenv").config();
const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Cấu hình session
router.use(
  session({
    secret: "my-session-secret", // Chuỗi bí mật để mã hóa session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Để `true` nếu dùng HTTPS
  })
);

// Đăng ký (Không băm mật khẩu)
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const user = new User({ email, password, role });
    await user.save();

    res.json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đăng nhập (Dùng cả Session và JWT)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📌 Đăng nhập với email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    // Lưu thông tin người dùng vào session
    req.session.user = { userId: user._id, role: user.role };

 
    // Tạo JWT token mà không có `expiresIn` (không giới hạn thời gian sống)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    

    // Trả về token và thông tin người dùng
    res.json({ token, user });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đăng xuất
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi đăng xuất" });
    }
    res.json({ message: "Đăng xuất thành công!" });
  });
});

module.exports = router;
