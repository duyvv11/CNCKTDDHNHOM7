const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  store: { type: String, required: true },
  status: { type: String, default: "Created" },
  items: [
    {
      name: String,
      quantity: Number,
    },
  ],
  deliveryPerson: { type: String, default: null },
});

const Order = mongoose.model("Order", orderSchema); // ✅ Phải khai báo model
module.exports = Order; // ✅ Phải export đúng
