const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true }, // Lưu dạng String để hỗ trợ BigInt
  store: { type: String, required: true }, // Địa chỉ ví của cửa hàng
  status: { type: String, default: "Created" },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  recipientAddress: { type: String, required: true }, // Địa chỉ nhận hàng
  recipientPhone: { type: String, required: true }, // Số điện thoại người nhận
  customerEmail: { type: String, required: true }, // ✅ Email khách hàng
  deliveryPerson: { type: String, default: null }, // Người giao hàng (địa chỉ ví)
  createdAt: { type: Date, default: Date.now }, // Ngày tạo đơn hàng
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;


