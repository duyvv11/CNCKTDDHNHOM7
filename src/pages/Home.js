import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Chào mừng đến với hệ thống theo dõi đơn hàng 🚚</h1>
      <p>Quản lý và theo dõi đơn hàng dễ dàng với nền tảng của chúng tôi.</p>
      <div className="home-buttons">
        <Link to="/login" className="btn">Đăng nhập</Link>
        <Link to="/register" className="btn">Đăng ký</Link>
      </div>
    </div>
  );
};

export default Home;
