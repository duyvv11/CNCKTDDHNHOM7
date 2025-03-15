import { createContext, useContext, useState, useEffect } from "react";

// Khởi tạo context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // ✅ Thêm state cho role
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("users");
      const storedRole = localStorage.getItem("role");  

      if (storedToken && storedUser && storedRole) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(storedRole);  // ✅ Lưu role từ localStorage
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("❌ Lỗi khi đọc localStorage:", error);
      localStorage.clear(); // ✅ Xóa toàn bộ nếu lỗi
    }
  }, []);

  // Hàm login để lưu thông tin người dùng
  const login = (newToken, newUser, newRole) => {
    try {
      localStorage.setItem("token", newToken);
      localStorage.setItem("users", JSON.stringify(newUser));
      localStorage.setItem("role", newRole);  // ✅ Lưu role vào localStorage

      setToken(newToken);
      setUser(newUser);
      setRole(newRole);  // ✅ Cập nhật state
      setIsLoggedIn(true);
    } catch (error) {
      console.error("❌ Lỗi khi lưu vào localStorage:", error);
    }
  };

  // Hàm logout để xóa dữ liệu
  const logout = () => {
    localStorage.clear(); // ✅ Xóa toàn bộ dữ liệu khi logout
    setToken(null);
    setUser(null);
    setRole(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
