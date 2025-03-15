require("dotenv").config();
const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

// 🔹 Kiểm tra biến môi trường trước khi khởi tạo Web3
if (!process.env.GANACHE_RPC_URL) {
  throw new Error("❌ GANACHE_RPC_URL chưa được cấu hình trong .env");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY chưa được cấu hình trong .env");
}
if (!process.env.CONTRACT_ADDRESS) {
  throw new Error("❌ CONTRACT_ADDRESS chưa được cấu hình trong .env");
}

// 🔹 Kết nối Web3 với Ganache hoặc mạng blockchain
const web3 = new Web3(process.env.GANACHE_RPC_URL);

// 🔹 Lấy tài khoản từ Private Key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

console.log("✅ Web3 connected successfully!");
console.log("✅ Account Address:", account.address);

// 🔹 Đọc ABI của Smart Contract
const contractPath = path.join(__dirname, "..", "build", "contracts", "DeliveryTracker.json");

// Kiểm tra file tồn tại không
if (!fs.existsSync(contractPath)) {
  throw new Error("❌ ABI file not found! Kiểm tra lại đường dẫn.");
}

const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const contractABI = contractJSON.abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

// 🔹 Khởi tạo Smart Contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

console.log("✅ Contract loaded successfully at:", contractAddress);

module.exports = { web3, contract, account };
