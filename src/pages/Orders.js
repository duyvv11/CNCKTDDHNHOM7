import { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css"; // Import file CSS

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");  // Hoặc từ context nếu bạn lưu token ở đó
        const res = await axios.get("http://localhost:5000/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy đơn hàng:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h2>Danh Sách Đơn Hàng</h2>
      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>ID:</strong> {order.orderId}</p>
            <p className="order-status"><strong>Trạng thái:</strong> {order.status}</p>
            <p className="store"><strong>Cửa hàng:</strong> {order.store}</p>
            <p><strong>Shipper:</strong> {order.deliveryPerson || "Chưa nhận"}</p>
            <div className="order-buttons">
              <button className="pickup-btn" onClick={() => alert("Nhận đơn hàng!")}>Nhận đơn</button>
              <button className="confirm-btn" onClick={() => alert("Xác nhận giao hàng!")}>Xác nhận giao</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
