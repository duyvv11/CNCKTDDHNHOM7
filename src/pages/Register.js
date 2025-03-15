import { useState } from "react";
import axios from "axios";
import "./Register.css"; // Import file CSS
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("store");
  const navigate = useNavigate(); // Khởi tạo navigate ở cấp component

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", { email, password, role });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login"); // Chuyển hướng đến trang đăng nhập
    } catch (err) {
      alert("Lỗi đăng ký / Đã có tài khoản này");
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng Ký</h2>
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
      </select>
      <button onClick={handleRegister}>Đăng ký</button>
    </div>
  );
};

export default Register;
