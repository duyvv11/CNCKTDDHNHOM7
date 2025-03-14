const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middlewares/auth");
const { contract, account } = require("../web3");
const router = express.Router();

// 🔹 Cửa hàng tạo đơn hàng
router.post("/create", authMiddleware, async (req, res) => {
  if (req.user.role !== "store") {
    return res.status(403).json({ error: "Only stores can create orders." });
  }

  // Xử lý tạo đơn hàng
  const { itemNames, itemQuantities } = req.body;

  const tx = contract.methods.createOrder(itemNames, itemQuantities);
  const gas = await tx.estimateGas({ from: account.address });
  const receipt = await tx.send({ from: account.address, gas });

  const orderId = receipt.events.OrderCreated.returnValues.orderId;

  const order = new Order({
    orderId,
    store: req.user.username,
    status: "Created",
    deliveryPerson: "",  // ➕ Thêm trường deliveryPerson cho khớp model
    items: itemNames.map((name, i) => ({
      name,
      quantity: itemQuantities[i],
    })),
  });

  await order.save();
  res.status(201).json({ message: "Order created successfully", orderId });
});


// 🔹 Shipper nhận đơn hàng
router.post("/pickup/:orderId", authMiddleware, async (req, res) => {
  if (req.user.role !== "shipper") {
    return res.status(403).json({ error: "Only shippers can pick up orders." });
  }

  const { orderId } = req.params;
  const order = await Order.findOne({ orderId });

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.status !== "Created") return res.status(400).json({ error: "Order cannot be picked up." });

  // Cập nhật trên blockchain
  const tx = contract.methods.pickupOrder(orderId);
  const gas = await tx.estimateGas({ from: account.address });
  await tx.send({ from: account.address, gas });

  // Cập nhật trên database
  order.status = "Picked up";
  order.deliveryPerson = req.user.username;
  await order.save();

  res.json({ message: "Order picked up successfully." });
});

// 🔹 Lấy danh sách đơn hàng
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
