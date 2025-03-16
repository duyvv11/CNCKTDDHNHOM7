import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
import Home from "./pages/Home";
import CustomerOrders from "./pages/CustomerOrders";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";


function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

function MainLayout() {
  const { isLoggedIn, role, logout } = useAuth();
  console.log("🔹 Trạng thái đăng nhập:", isLoggedIn);
  console.log("🔹 Quyền người dùng:", role);
  
  return (
    <div className="container">
      <nav className="navbar">
        <h1 className="logo">🚚 Theo dõi đơn hàng</h1>
        <div className="nav-links">
          <span className="user-role">Vai trò: {role}</span>
          {!isLoggedIn ? (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          ) : (
            <>

              {/* ✅ Điều hướng theo quyền */}
              {role === "store" && <Link to="/create-order">Tạo đơn hàng</Link>}
              {role === "store" && <Link to="/orders">Danh sách đơn</Link>}
              {role === "shipper" && <Link to="/orders">Đơn hàng cần giao</Link>}
              {role === "customer" && <Link to="/my-orders">Đơn hàng của tôi</Link>}

              <button onClick={logout} className="logout-btn">Đăng xuất</button>
            </>
          )}
        </div>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ✅ Điều hướng theo quyền */}
          <Route path="/orders" element={<PrivateRoute element={<Orders />} allowedRoles={["store", "shipper"]} />} />
          <Route path="/create-order" element={<PrivateRoute element={<CreateOrder />} allowedRoles={["store"]} />} />
          <Route path="/my-orders" element={<PrivateRoute element={<CustomerOrders />} allowedRoles={["customer"]} />} />
        </Routes>
      </div>

      <footer className="footer">
        <p>© 2025 Nhóm 7 theo dõi đơn hàng</p>
      </footer>
    </div>
  );
}

// 🔹 Điều hướng trang chủ theo quyền
function getHomeRedirect(role, isLoggedIn) {
  if (!isLoggedIn) return "/login";
  if (role === "store") return "/orders";
  if (role === "shipper") return "/orders";
  if (role === "customer") return "/my-orders";
  return "/login";
}

// 🔹 PrivateRoute kiểm soát quyền truy cập
function PrivateRoute({ element, allowedRoles }) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    console.log("🚫 Truy cập bị từ chối:", role);
    return <Navigate to={getHomeRedirect(role, isLoggedIn)} />;
  }

  return element;
}

export default App;
