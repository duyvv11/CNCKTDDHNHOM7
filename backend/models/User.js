const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["store", "shipper","customer"] }
});

const User = mongoose.model("User", UserSchema);

module.exports = User; // Đảm bảo export đúng

