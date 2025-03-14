const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  store: { type: String, required: true },
  status: { type: String, default: "Created" },
  items: [
    {
      name: { type: String, required: true }, // Đảm bảo tên sản phẩm không bị thiếu
      quantity: { type: Number, required: true }, // Đảm bảo số lượng luôn có
    },
  ],
  deliveryPerson: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }, // Thêm ngày tạo mặc định là thời gian hiện tại
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

