import { useState } from "react";
import axios from "axios";

const CreateOrder = () => {
  const [items, setItems] = useState([{ name: "", quantity: 1 }]);
  const [address, setAddress] = useState("");  // ✅ Thêm địa chỉ
  const [phone, setPhone] = useState("");      // ✅ Thêm số điện thoại

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1 }]);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // ✅ Hàm gọi API tạo đơn hàng
  const handleCreateOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔹 Token từ localStorage:", token);
      if (!token) {
        console.error("❌ Không có token, yêu cầu bị từ chối!");
        alert("Bạn cần đăng nhập để tạo đơn hàng!");
        return;
      }

      const requestData = {
        itemNames: items.map((item) => item.name),
        itemQuantities: items.map((item) => Number(item.quantity)),
        address,  // ✅ Gửi địa chỉ
        phone,    // ✅ Gửi số điện thoại
      };

      console.log("🔹 Sending request:", requestData);

      const response = await axios.post("http://localhost:5000/api/orders/create", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Response:", response.data);
      alert("Tạo đơn hàng thành công!");
    } catch (err) {
      console.error("❌ Lỗi tạo đơn hàng:", err.response?.data || err);
      alert("Lỗi tạo đơn hàng!");
    }
  };

  return (
    <div>
      <h2>Tạo Đơn Hàng</h2>

      {/* Nhập danh sách sản phẩm */}
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

      {/* Nhập địa chỉ */}
      <div>
        <input
          type="text"
          placeholder="Nhập địa chỉ giao hàng"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Nhập số điện thoại */}
      <div>
        <input
          type="text"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <button onClick={handleCreateOrder}>Tạo đơn</button>
    </div>
  );
};

export default CreateOrder;
