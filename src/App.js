import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
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
          {!isLoggedIn ? (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          ) : (
            <>
              {/* Phân quyền cho cửa hàng */}
              {role === "store" && <Link to="/create-order">Store</Link>}
              {/* Phân quyền cho shipper */}
              {role === "shipper" && <Link to="/orders">Shiper</Link>}
              <Link to="/orders">Danh sách đơn</Link>
              <Link to="/create-order">Tạo đơn hàng</Link>
              <button onClick={logout} className="logout-btn">Đăng xuất</button>
            </>
          )}
        </div>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedIn ? "/orders" : "/login"} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<PrivateRoute element={<Orders />} />} />
          <Route 
            path="/create-order" 
            element={<PrivateRoute element={<CreateOrder />} requiredRole="store" />} 
          />
        </Routes>
      </div>

      <footer className="footer">
        <p>© 2025 Nhóm 7 theo dõi đơn hàng</p>
      </footer>
    </div>
  );
}

// PrivateRoute để kiểm tra quyền truy cập
function PrivateRoute({ element, requiredRole }) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;  // Nếu chưa đăng nhập, chuyển hướng tới trang đăng nhập
  }

  // Kiểm tra quyền truy cập theo role
  if (requiredRole && role !== requiredRole) {
    console.log("Required role:", requiredRole, "User role:", role);
    return <Navigate to="/orders" />;  // Điều hướng người dùng nếu role không đúng
  }

  return element;  // Nếu có quyền truy cập, render component
}

export default App;
