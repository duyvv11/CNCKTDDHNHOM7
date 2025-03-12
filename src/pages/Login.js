import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("📩 Gửi request với:", { email, password }); 
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("Đăng nhập thành công!");
      window.location.href = "/orders";
    } catch (err) {
      alert("Sai thông tin đăng nhập!");
    }
  };

  return (
    <div>
      <h2>Đăng Nhập</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Đăng nhập</button>
    </div>
  );
};

export default Login;

