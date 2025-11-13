import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./modules/auth/Login.jsx";
import "./components/css/main.css";
import MercadoLibreDashboard from "./modules/analisis/MercadoLibre/MercadoLibreDashboard.jsx";
import MercadoLibreDashboardV2 from "./modules/analisis/MercadoLibre V2/MercadoLibreDashboard.jsx";
import MercadoLibreDashboardV3 from "./modules/analisis/MercadoLibre V3/MercadoLibreDashboard.jsx"; 
import Menu from "./modules/menu/Menu.jsx";

// const router = createBrowserRouter([
//   { path: "/", element: <Login /> },
//   { path: "/mercadolibre-metricas", element: <MercadoLibreDashboard /> },
//   { path: "/mercadolibre-metricas-v2", element: <MercadoLibreDashboardV2 /> },
// ]);
const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/menu", element: <Menu /> },
  { path: "/mercadolibre-metricas", element: <MercadoLibreDashboard /> },
  { path: "/mercadolibre-metricas-v2", element: <MercadoLibreDashboardV2 /> },
  { path: "/mercadolibre-pedidos", element: <MercadoLibreDashboardV3 /> },
]);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
