import { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css"; // Import file CSS

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");  // Lấy token từ localStorage
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
  // nhan dơn hang
  const handlePickup = async (orderId) => {
    try {
      console.log("🔹 Gửi yêu cầu nhận đơn hàng:", orderId); 
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("email"); // ✅ Lấy email người đăng nhập
  
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
            ? { ...order, status: "Picked up", deliveryPerson: userEmail } // ✅ Lưu email shipper
            : order
        )
      );
    } catch (error) {
      console.error("❌ Lỗi khi nhận đơn:", error.response?.data || error);
      alert(error.response?.data?.error || "Lỗi khi nhận đơn hàng!");
    }
  };
// xac nhan da giao hang
const handleConfirmDelivery = async (orderId) => {
  try {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("email"); // Lưu email sau khi đăng nhập

    const res = await axios.post(
      `http://localhost:5000/api/orders/confirm-delivery/${orderId}`,
      { email: userEmail },  // ✅ Gửi email shipper lên backend
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
            <p><strong>Cửa hàng:</strong> {order.store}</p>
            <p><strong>Địa chỉ:</strong> {order.address}</p>
            <p><strong>Số điện thoại:</strong> {order.phone}</p>
            <p className="order-status"><strong>Trạng thái:</strong> {order.status}</p>
            <p><strong>Shipper:</strong> {order.deliveryPerson || " "}</p>
            <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <div>
              <strong>Sản phẩm:</strong>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - SL: {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-buttons">
              <button className="pickup-btn" onClick={() => handlePickup(order.orderId)} disabled={order.status !== "Created"}>{order.status === "Picked up" ? "Đã nhận" : "Nhận đơn"}</button>
              <button className="confirm-btn" onClick={() => handleConfirmDelivery(order.orderId)} disabled={order.status !== "Picked up"}> {order.status === "Delivered" ? "Đã giao" : "Xác nhận giao"}</button>

            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
