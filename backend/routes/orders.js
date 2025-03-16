const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middlewares/auth");
const { web3, contract, account } = require("../web3");
const router = express.Router();

console.log("🔹 Contract:", contract.options.address);
console.log("🔹 Web3 provider:", web3.currentProvider);
console.log("🔹 Account address:", account.address);

// 🔹 Cửa hàng tạo đơn hàng
router.post("/create", authMiddleware, async (req, res) => {
  console.log("📩 Email của store từ token:", req.user.email);

  if (req.user.role !== "store") {
    return res.status(403).json({ error: "Only stores can create orders." });
  }

  const { itemNames, itemQuantities, recipientAddress, recipientPhone, customerEmail, storeEmail } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!recipientAddress || !recipientPhone || !customerEmail || !storeEmail) {
    return res.status(400).json({ error: "Recipient address, phone, customer email, and store email are required." });
  }

  // Kiểm tra xem email cửa hàng trong request có khớp với email từ token không
  if (storeEmail !== req.user.email) {
    return res.status(403).json({ error: "Invalid store email." });
  }

  try {
    // Gửi giao dịch tạo đơn hàng lên blockchain
    const tx = contract.methods.createOrder(itemNames, itemQuantities, recipientAddress, recipientPhone);
    const gas = await tx.estimateGas({ from: account.address });
    const receipt = await tx.send({ from: account.address, gas });

    const orderId = receipt.events.OrderCreated.returnValues.orderId.toString(); // ✅ BigInt → String

    // Lưu đơn hàng vào MongoDB
    const order = new Order({
      orderId,
      store: storeEmail, // ✅ Lưu email của cửa hàng
      status: "Created",
      deliveryPerson: null,
      recipientAddress,
      recipientPhone,
      customerEmail, // ✅ Lưu email khách hàng
      items: itemNames.map((name, i) => ({ name, quantity: itemQuantities[i] })),
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
  if (req.user.role !== "shipper") {
    return res.status(403).json({ error: "Only shippers can pick up orders." });
  }

  const orderId = Number(req.params.orderId);
  const order = await Order.findOne({ orderId });
  console.log("🛠️ orderId nhận được từ frontend:", orderId); 

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
          status: "InTransit",
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

// 🔹 Shipper xác nhận giao hàng
router.post("/confirm-delivery/:orderId", authMiddleware, async (req, res) => {
  if (req.user.role !== "shipper") {
    return res.status(403).json({ error: "Only shippers can confirm delivery." });
  }

  const { orderId } = req.params;
  const order = await Order.findOne({ orderId });

  if (!order) return res.status(404).json({ error: "Order not found." });
  console.log("📌 Current Order Status:", order.status);
  if (order.status !== "InTransit") return res.status(400).json({ error: "Order is not in transit." });

  try {
    const shipperEmail = req.user.email; // ✅ Lấy email từ token để đảm bảo tính chính xác
    console.log("📌 Token Shipper Email:", req.user.email);
    
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

// 🔹 Lấy đơn hàng theo email khách hàng
router.get("/customer/:email", authMiddleware, async (req, res) => {
  try {
    const { email } = req.params;
    console.log("📌 API nhận request với email:", email);

    const orders = await Order.find({ customerEmail: email });
    console.log("📌 Đơn hàng tìm thấy:", orders);

    if (!orders.length) {
      return res.status(404).json({ message: "Không có đơn hàng nào cho email này." });
    }

    res.json(orders);
  } catch (error) {
    console.error("❌ Lỗi lấy đơn hàng theo email:", error);
    res.status(500).json({ error: "Lỗi server." });
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


module.exports = router;
