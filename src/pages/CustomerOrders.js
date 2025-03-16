import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Lấy thông tin đăng nhập
import axios from "axios";
import "./Orders.css"; // ✅ CSS chung với Orders

const CustomerOrders = () => {
  const { user } = useAuth(); // ✅ Lấy email khách hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("📌 Chuẩn bị gọi API với email:", user?.email);
  
      if (!user?.email) {
        console.error("❌ Không có email, không thể gọi API.");
        setLoading(false);
        return;
      }
  
      const token = localStorage.getItem("token");
      console.log("📌 Token lấy từ localStorage:", token);
  
      if (!token) {
        console.error("❌ Không tìm thấy token, không thể gọi API.");
        setLoading(false);
        return;
      }
  
      const response = await axios.get(
        `http://localhost:5000/api/orders/customer/${user.email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("✅ API Response:", response.data); // Kiểm tra dữ liệu từ API
      setOrders(response.data);
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error.message);
      if (error.response) {
        console.error("📌 Chi tiết lỗi từ server:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="orders-container">
      <h2>🛍 Đơn hàng của tôi</h2>
      <button className="refresh-button" onClick={fetchOrders}>🔄 Tải lại</button>

      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <p>❌ Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>ID:</strong> {order.orderId}</p>
            <p><strong>Địa chỉ:</strong> {order.recipientAddress}</p>
            <p><strong>Số điện thoại:</strong> {order.recipientPhone}</p>
            <p className="order-status"><strong>Trạng thái:</strong> {order.status}</p>
            <p><strong>Cửa hàng:</strong> {order.store}</p>
            <p><strong>Shipper:</strong> {order.deliveryPerson || "Chưa nhận đơn"}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <div>
              <strong>Sản phẩm:</strong>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>{item.name} - SL: {item.quantity}</li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CustomerOrders;
