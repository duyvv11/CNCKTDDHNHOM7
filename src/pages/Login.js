import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      console.log("🔑 Phản hồi từ API:", res.data); // Kiểm tra dữ liệu trả về

      login(res.data.token, res.data.user); // Lưu token + user vào context

      login(res.data.token, res.data.user); // ✅ Lưu token + user

      alert("Đăng nhập thành công!");
      localStorage.setItem("token", res.data.token);
      console.log("✅ Token đã lưu vào localStorage:", res.data.token);
      navigate("/orders"); // ✅ Điều hướng ngay lập tức
    } catch (err) {
      alert("Sai thông tin đăng nhập!");
    }
  };

  return (
    <div>
      <h2>Đăng Nhập</h2>
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
      <button onClick={handleLogin}>Đăng nhập</button>
    </div>
  );
};

export default Login;
