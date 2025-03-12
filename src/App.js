import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
import "./App.css"; // Import file CSS riêng

function App() {
  return (
    <Router>
      <div className="container">
        {/* Navbar */}
        <nav className="navbar">
          <h1 className="logo">🚚 Theo dõi đơn hàng</h1>
          <div className="nav-links">
            <Link to="/">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
            <Link to="/orders">Danh sách đơn</Link>
            <Link to="/create-order">Tạo đơn hàng</Link>
          </div>
        </nav>

        {/* Nội dung trang */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/create-order" element={<CreateOrder />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>© 2025 Nhóm 7 - Hệ thống theo dõi đơn hàng</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;


