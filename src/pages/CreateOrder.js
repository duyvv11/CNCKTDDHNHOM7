import { useState } from "react";
import axios from "axios";

const CreateOrder = () => {
  const [items, setItems] = useState([{ name: "", quantity: 1 }]);

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1 }]);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // ✅ Hàm gọi API tạo đơn hàng (tích hợp refresh token)
  const handleCreateOrder = async () => {
    try {
      let token = localStorage.getItem("accessToken"); // 🔹 Lấy token từ localStorage

      const requestData = {
        itemNames: items.map((item) => item.name),
        itemQuantities: items.map((item) => Number(item.quantity)),
      };

      console.log("🔹 Sending request:", requestData);

      const response = await axios.post("http://localhost:5000/api/orders/create", requestData, {
        headers: { Authorization: `Bearer ${token}` }, // 🔥 Thêm token vào header
      });

      console.log("✅ Response:", response.data);
      alert("Tạo đơn hàng thành công!");
    } catch (err) {
      console.error("❌ Lỗi tạo đơn hàng:", err.response?.data || err);

      if (err.response?.status === 401) {
        // Nếu token hết hạn, gọi refresh token
        console.log("🔄 Token hết hạn, đang làm mới...");
        const newToken = await refreshAccessToken();

        if (newToken) {
          console.log("✅ Token mới đã cập nhật, gửi lại request...");
          return handleCreateOrder(); // Gửi lại request
        } else {
          alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        }
      } else {
        alert("Lỗi tạo đơn hàng!");
      }
    }
  };

  // ✅ Hàm gọi API để lấy Access Token mới từ Refresh Token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const response = await axios.post("http://localhost:5000/api/auth/refresh-token", { refreshToken });

      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken); // Cập nhật token mới

      return newAccessToken;
    } catch (err) {
      console.error("❌ Lỗi refresh token:", err.response?.data || err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
  };

  return (
    <div>
      <h2>Tạo Đơn Hàng</h2>
      {items.map((item, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={item.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Số lượng"
            value={item.quantity}
            onChange={(e) => handleChange(index, "quantity", e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleAddItem}>Thêm sản phẩm</button>
      <button onClick={handleCreateOrder}>Tạo đơn</button>
    </div>
  );
};

export default CreateOrder;
