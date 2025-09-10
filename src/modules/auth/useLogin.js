import { useState, useCallback } from "react";
import api from "../../Services/api";
import { useNavigate } from "react-router-dom";

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
      if (response.status === 200) {
        navigate("/mercadolibre-metricas");
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
