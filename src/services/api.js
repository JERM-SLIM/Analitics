import axios from "axios";

const isTest = import.meta.env.VITE_ENV === "test";

const api = axios.create({
  baseURL: isTest ? "https://diler.com.mx:9096" : "https://diler.com.mx:9095",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    ...(isTest && { "x-env": "test" }),
  },
});

/**
 * 🚨 INTERCEPTOR DE RESPUESTAS
 * Detecta token inválido o expirado
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error de red o sin respuesta
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 🔴 Token inválido / expirado
    if (
      status === 401 ||
      data?.error === "Token invalido o expirado"
    ) {
      // Mostrar mensaje al usuario
      alert("⚠️ Tu sesión ha expirado. Por favor inicia sesión nuevamente.");

      // Limpiar sesión (ajusta si usas otros keys)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirigir al inicio o login
      window.location.href = "/"; // o "/login"

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
