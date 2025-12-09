import { useState, useCallback } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const useLogin = (username, password) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post("/web/auth/login", {
        user: username,
        password,
      });
      if (response.status === 200 && (username =="PEDRO" || username =="JOSORIO" || username =="JEDUARDO" || username =="HUGO")) {
          // Guardar sesión en localStorage
        const encryptedPassword = CryptoJS.AES.encrypt(password, "secret-key").toString();
        localStorage.setItem("password", encryptedPassword);
        localStorage.setItem("username", username);
        navigate("/menu");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al iniciar sesión. Revise su conexión.");
      }
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return { handleLogin, loading, error };
};

export default useLogin;
