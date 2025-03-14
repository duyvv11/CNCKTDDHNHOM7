const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 Kiểm tra header Authorization:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Tách token từ "Bearer token_here"
  console.log("🔑 Token nhận được:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token hợp lệ, user:", decoded);

    req.user = decoded; // Lưu thông tin user vào request
    next(); // Cho phép request tiếp tục
  } catch (error) {
    console.error("❌ Token không hợp lệ:", error);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};


