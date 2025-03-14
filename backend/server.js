require("dotenv").config();
console.log("Loaded ENV Variables:");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Exists ✅" : "MISSING ❌");
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);
console.log("GANACHE_URL:", process.env.GANACHE_URL);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Order = require("./models/Order");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
connectDB();

const authRoutes = require("./routes/auth"); 
app.use("/api/auth", authRoutes);
const ordersRoutes = require("./routes/orders"); 
app.use("/api/orders", ordersRoutes);
// 🔹 Kết nối Web3 và Smart Contract
const { Web3 } = require("web3"); 
const web3 = new Web3(process.env.GANACHE_RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// 🔹 Đọc ABI của Smart Contract
const contractPath = path.join(__dirname, "..", "build", "contracts", "DeliveryTracker.json");
const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const contractABI = contractJSON.abi;
const contractAddress = process.env.CONTRACT_ADDRESS; // Địa chỉ contract trên Ganache
const contract = new web3.eth.Contract(contractABI, contractAddress);
contract.methods.orders(0).call().then(console.log);

// 🔹 API tạo đơn hàng (Gửi lên Smart Contract)
app.post("/api/orders", async (req, res) => {
  const { username, items, quantities } = req.body;

  try {
    const tx = contract.methods.createOrder(items, quantities);
    const gas = await tx.estimateGas({ from: account.address });

    const receipt = await tx.send({ from: account.address, gas });
    
    console.log("📦 Đơn hàng đã được tạo trên blockchain:", receipt.events.OrderCreated.returnValues);
    
    const order = new Order({
      username,
      items,
      status: "Created",
      blockchainOrderId: receipt.events.OrderCreated.returnValues.orderId
    });

    await order.save();
    
    res.status(201).json({ message: "Đơn hàng đã tạo!", orderId: order.blockchainOrderId });
  } catch (err) {
    console.error("❌ Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({ error: "Không thể tạo đơn hàng" });
  }
});

// 🔹 API lấy đơn hàng từ Smart Contract
app.get("/api/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await contract.methods.orders(orderId).call();
    res.json(order);
  } catch (err) {
    console.error("❌ Lỗi khi lấy đơn hàng:", err);
    res.status(500).json({ error: "Không thể lấy đơn hàng" });
  }
});

// 🔹 API lấy danh sách tất cả đơn hàng
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng" });
  }
});


// 🔹 Khởi động server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
