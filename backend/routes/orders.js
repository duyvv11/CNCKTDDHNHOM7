const express = require("express");
const { Web3 } = require("web3"); // Web3 v4
const { HttpProvider } = require("web3-providers-http"); // Thêm HttpProvider
const contractABI = require("../../build/contracts/DeliveryTracker.json");
const Order = require("../models/Order");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

// Khởi tạo Web3 với HttpProvider
const web3 = new Web3(new HttpProvider(process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545"));

const contractAddress = "0x6CF5Fd4CEB272a81C12235a42097484c3DEe8A38"; // Địa chỉ contract
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Cửa hàng tạo đơn hàng
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "store") {
      return res.status(403).json({ error: "Only stores can create orders." });
    }

    const { store, itemNames, itemQuantities } = req.body;
    const orderId = await contract.methods.nextOrderId().call();
    await contract.methods.createOrder(itemNames, itemQuantities).send({ from: store });

    const order = new Order({
      orderId,
      store,
      status: "Created",
      items: itemNames.map((name, i) => ({ name, quantity: itemQuantities[i] })),
    });

    await order.save();
    res.json({ message: "Order created successfully" });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Shipper nhận đơn hàng
router.post("/pickup/:orderId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "shipper") {
      return res.status(403).json({ error: "Only shippers can pick up orders." });
    }

    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.status !== "Created") return res.status(400).json({ error: "Order cannot be picked up." });

    order.status = "Picked up";
    order.deliveryPerson = req.user.username;
    await order.save();

    res.json({ message: "Order picked up successfully." });
  } catch (error) {
    console.error("Error picking up order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Xem danh sách đơn hàng (cho cả cửa hàng và shipper)
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("📢 ");
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
