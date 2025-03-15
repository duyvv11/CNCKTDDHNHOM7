import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      console.log("🔑 Phản hồi từ API:", res.data);
  
      // Lưu token + user + role vào context
      login(res.data.token, res.data.user, res.data.user.role); // ✅ Sửa lỗi
  
      // Lưu vào localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("users", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role); // ✅ Lưu role vào localStorage
      localStorage.setItem("email", res.data.user.email); 
      console.log("✅ Token đã lưu:", res.data.token);
      console.log("✅ Role đã lưu:", res.data.user.role);
  
      alert("Đăng nhập thành công!");
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
