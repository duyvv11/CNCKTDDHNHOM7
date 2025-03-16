import { useState } from "react";
import axios from "axios";
import "./Register.css"; // Import file CSS
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("store"); // Mặc định là 'store'
  const [error, setError] = useState(""); // State để lưu lỗi từ server
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(""); // Xóa lỗi trước đó
    console.log("📩 Dữ liệu gửi đi:", { email, password, role });

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        role,
      });

      console.log("✅ Phản hồi từ server:", response.data);
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login"); // Chuyển hướng đến trang đăng nhập
    } catch (err) {
      if (err.response) {
        console.error("❌ Lỗi từ server:", err.response.data);
        setError(err.response.data.message || "Đăng ký thất bại!");
      } else {
        console.error("❌ Lỗi không xác định:", err.message);
        setError("Lỗi kết nối đến server!");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng Ký</h2>
      {error && <p className="error-message">{error}</p>} {/* Hiển thị lỗi nếu có */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="store">Cửa hàng</option>
        <option value="shipper">Shipper</option>
        <option value="customer">Khách hàng</option>
      </select>
      <button onClick={handleRegister}>Đăng ký</button>
    </div>
  );
};

export default Register;
