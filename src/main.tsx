import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./modules/auth/Login.jsx";
import "./components/css/main.css";
import MercadoLibreDashboard from "./modules/analisis/MercadoLibreDashboard.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/mercadolibre-metricas", element: <MercadoLibreDashboard /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
