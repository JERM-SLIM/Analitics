import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import "../../components/css/menu.css";
import MercadoLibreDashboard from "../analisis/MercadoLibre/MercadoLibreDashboard";
import MercadoLibreDashboardV2 from "../analisis/MercadoLibre V2/MercadoLibreDashboard";

import MercadoLibreDashboardV3 from "../analisis/MercadoLibre V3/MercadoLibreDashboard";


export default function Menu() {
  const [selectedCard, setSelectedCard] = useState(null);

  const cards = [
    // {
    //   title: "MercadoLibre Dashboard V1",
    //   description: "Dashboard clásico de métricas.",
    //   component: <MercadoLibreDashboard />,
    // },
        {
      title: "MercadoLibre Dashboard V2",
      description: "Dashboard clásico de métricas.",
      component: <MercadoLibreDashboardV2 />,
    },
    {
      title: "MercadoLibre Pedidos",
      description: "Próximas métricas y análisis.",
      component: <MercadoLibreDashboardV3 />,
    },
  ];

  
  return (
    <div className="menu-body">
      <AnimatePresence mode="wait">
        {!selectedCard ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="menu-cards"
          >
            <h1 className="menu-title">Panel de Métricas</h1>
            <div className="card-grid">
              {cards.map((card, idx) => (
                <motion.div
                  key={idx}
                  className="card"
                  onClick={() => setSelectedCard(card)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="menu-content"
          >
            <div className="menu-header">
              <button
                className="back-button"
                onClick={() => setSelectedCard(null)}
              >
                ← Regresar al menú
              </button>
              <h2 className="content-title">{selectedCard.title}</h2>
            </div>
            <div className="content-body">{selectedCard.component}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}