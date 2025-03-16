import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const CreateOrder = () => {
  const [items, setItems] = useState([{ name: "", quantity: 1 }]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const navigate = useNavigate(); // ✅ Hook điều hướng

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1 }]);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleCreateOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để tạo đơn hàng!");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1])); 
      const storeEmail = payload.email; 

      const requestData = {
        itemNames: items.map((item) => item.name),
        itemQuantities: items.map((item) => Number(item.quantity)),
        recipientAddress,
        recipientPhone,
        customerEmail,
        storeEmail,
      };

      const response = await axios.post("http://localhost:5000/api/orders/create", requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Tạo đơn hàng thành công!");
      console.log("✅ Response:", response.data);

      navigate("/orders"); // ✅ Chuyển sang trang danh sách đơn hàng
    } catch (err) {
      alert("Lỗi tạo đơn hàng!");
      console.error("❌ Lỗi tạo đơn hàng:", err.response?.data || err);
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

      <div>
        <input
          type="text"
          placeholder="Nhập địa chỉ giao hàng"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Nhập số điện thoại"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Nhập email khách hàng"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
      </div>

      <button onClick={handleCreateOrder}>Tạo đơn</button>
    </div>
  );
};

export default CreateOrder;
