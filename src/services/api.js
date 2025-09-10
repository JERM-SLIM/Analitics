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


export default api;
