import { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css"; // Import CSS

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All"); // ✅ Bộ lọc trạng thái
  const userEmail = localStorage.getItem("email");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let filteredOrders = res.data;

        // ✅ Lọc đơn hàng theo vai trò
        if (userRole === "store") {
          filteredOrders = filteredOrders.filter(order => order.store === userEmail);
        } else if (userRole === "shipper") {
          filteredOrders = filteredOrders.filter(order => 
            order.deliveryPerson === userEmail || order.status === "Created" || order.status === "Delivered"
          );
        }

        setOrders(filteredOrders);
      } catch (error) {
        console.error("❌ Lỗi khi lấy đơn hàng:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail, userRole]);

  // ✅ Nhận đơn hàng
  const handlePickup = async (orderId) => {
    try {
      console.log("🔹 Gửi yêu cầu nhận đơn hàng:", orderId);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/api/orders/pickup/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Nhận đơn thành công:", res.data);
      alert("Nhận đơn thành công!");

      // ✅ Cập nhật trạng thái đơn hàng trên UI mà không cần reload
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, status: "InTransit", deliveryPerson: userEmail }
            : order
        )
      );
    } catch (error) {
      console.error("❌ Lỗi khi nhận đơn:", error.response?.data || error);
      alert(error.response?.data?.error || "Lỗi khi nhận đơn hàng!");
    }
  };

  // ✅ Xác nhận giao hàng
  const handleConfirmDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/api/orders/confirm-delivery/${orderId}`,
        { email: userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Giao hàng thành công!");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, status: "Delivered" } : order
        )
      );
    } catch (error) {
      console.error("❌ Lỗi khi xác nhận giao hàng:", error.response?.data || error);
      alert(error.response?.data?.error || "Lỗi khi xác nhận giao hàng!");
    }
  };

  // ✅ Lọc đơn hàng theo trạng thái
  const filteredOrders = orders.filter(order => order.status === filterStatus);

  return (
    <div className="orders-container">
      <h2>📦 Danh Sách Đơn Hàng</h2>

      {/* ✅ Bộ lọc trạng thái đơn hàng */}
      <div className="filter-buttons">
        <button className={filterStatus === "Created" ? "active" : ""} onClick={() => setFilterStatus("Created")}>
          Chờ giao
        </button>
        <button className={filterStatus === "InTransit" ? "active" : ""} onClick={() => setFilterStatus("InTransit")}>
          Đang giao
        </button>
        <button className={filterStatus === "Delivered" ? "active" : ""} onClick={() => setFilterStatus("Delivered")}>
          Đã giao
        </button>
      </div>

      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : filteredOrders.length === 0 ? (
        <p>❌ Không có đơn hàng nào.</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>ID:</strong> {order.orderId}</p>
            <p><strong>Cửa hàng:</strong> {order.store}</p>
            <p><strong>Địa chỉ:</strong> {order.recipientAddress}</p>
            <p><strong>Số điện thoại:</strong> {order.recipientPhone}</p>
            <p className="order-status"><strong>Trạng thái:</strong> {order.status}</p>
            <p><strong>Shipper:</strong> {order.deliveryPerson || "Chưa nhận đơn"}</p>
            <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <div>
              <strong>Sản phẩm:</strong>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>{item.name} - SL: {item.quantity}</li>
                ))}
              </ul>
            </div>

            {/* ✅ Button "Nhận đơn" & "Xác nhận giao" */}
            {userRole === "shipper" && order.status !== "Delivered" && (
              <div className="order-buttons">
                {order.status === "Created" && (
                  <button className="pickup-btn" onClick={() => handlePickup(order.orderId)}>
                    Nhận đơn
                  </button>
                )}
                {order.status === "InTransit" && order.deliveryPerson === userEmail && (
                  <button className="confirm-btn" onClick={() => handleConfirmDelivery(order.orderId)}>
                    Xác nhận giao
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
