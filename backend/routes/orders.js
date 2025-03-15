const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middlewares/auth");
const { web3, contract, account } = require("../web3");
const router = express.Router();

console.log("🔹 Contract:", contract);
console.log("🔹 Web3 provider:", web3.currentProvider);
console.log("🔹 Contract instance:", contract);
console.log("🔹 Account address:", account.address);

// 🔹 Cửa hàng tạo đơn hàng
router.post("/create", authMiddleware, async (req, res) => {
  if (req.user.role !== "store") {
    return res.status(403).json({ error: "Only stores can create orders." });
  }

  // Lấy dữ liệu từ request
  const { itemNames, itemQuantities, address, phone } = req.body;

  if (!address || !phone) {
    return res.status(400).json({ error: "Address and phone are required." });
  }

  try {
    // Tạo đơn hàng trên blockchain
    const tx = contract.methods.createOrder(itemNames, itemQuantities);
    const gas = await tx.estimateGas({ from: account.address });
    const receipt = await tx.send({ from: account.address, gas });

    const orderId = Number(receipt.events.OrderCreated.returnValues.orderId); // Chuyển BigInt về Number

    // Lưu đơn hàng vào MongoDB
    const order = new Order({
      orderId,
      store: req.user.userId, // ID của cửa hàng tạo đơn
      status: "Created",
      deliveryPerson: "",
      address, // ✅ Lưu địa chỉ
      phone, // ✅ Lưu số điện thoại
      items: itemNames.map((name, i) => ({
        name,
        quantity: itemQuantities[i],
      })),
    });

    await order.save();
    res.status(201).json({ message: "Order created successfully", orderId });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Shipper nhận đơn hàng
router.post("/pickup/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ orderId });

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.status !== "Created") return res.status(400).json({ error: "Order cannot be picked up." });

  try {
    // ✅ Lấy email của Shipper từ session
    const shipperEmail = req.user.email;  

    // Cập nhật trên blockchain
    const tx = contract.methods.pickUpOrder(orderId);  
    const gas = await tx.estimateGas({ from: account.address });
    await tx.send({ from: account.address, gas });

    // Cập nhật trên database
    await Order.updateOne(
      { orderId },
      {
        $set: {
          status: "Picked up",
          deliveryPerson: shipperEmail,  // ✅ Lưu email thay vì username
        },
      }
    );

    res.json({ message: "Order picked up successfully.", deliveryPerson: shipperEmail });
  } catch (error) {
    console.error("❌ Error picking up order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// 🔹 Lấy danh sách đơn hàng
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// 🔹 Shipper xác nhận giao hàng
router.post("/confirm-delivery/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ orderId });

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.status !== "Picked up") return res.status(400).json({ error: "Order is not in transit." });

  try {
    const shipperEmail = req.body.email || req.user.email; // ✅ Lấy email từ request hoặc token
    console.log("📌 Request Shipper Email:", req.body.email);
    console.log("📌 Token Shipper Email:", req.user.email);
    console.log("📌 Final Shipper Email Used:", shipperEmail);

    if (order.deliveryPerson !== shipperEmail) {
      return res.status(403).json({ error: "Only assigned delivery person can confirm delivery." });
    }

    const tx = contract.methods.confirmDelivery(orderId);
    const gas = await tx.estimateGas({ from: account.address });
    await tx.send({ from: account.address, gas });

    await Order.updateOne(
      { orderId },
      { $set: { status: "Delivered" } }
    );

    res.json({ message: "Order delivered successfully." });
  } catch (error) {
    console.error("❌ Error confirming delivery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
