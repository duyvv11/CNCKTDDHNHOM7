const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  store: { type: String, required: true },
  status: { type: String, default: "Created" },
  items: [
    {
      name: { type: String, required: true }, // Tên sản phẩm
      quantity: { type: Number, required: true }, // Số lượng sản phẩm
    },
  ],
  address: { type: String, required: true }, // ✅ Thêm địa chỉ
  phone: { type: String, required: true }, // ✅ Thêm số điện thoại
  deliveryPerson: { type: String, default: null }, // Người giao hàng
  createdAt: { type: Date, default: Date.now }, // Ngày tạo đơn hàng
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

