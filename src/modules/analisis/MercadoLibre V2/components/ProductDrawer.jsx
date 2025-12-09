import React from "react";
import {
  Drawer,
  Typography,
  Box,
  Divider,
  Button
} from "@mui/material";

const ProductDrawer = ({ selectedRow, drawerOpen, setDrawerOpen }) => {
  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(v ?? 0));

  const formatNumber2 = (v) => Number(v ?? 0).toFixed(2);

  if (!selectedRow) return null;

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: 300,
          backgroundColor: "#1e2a38",
          color: "#fff",
          padding: 1,
          top: 0,
          height: "100vh",
        },
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Detalles del Producto
        </Typography>
        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.2)" }} />
        
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Box
            component="img"
            src={selectedRow.picture_url}
            alt={`Imagen de ${selectedRow.itemId}`}
            sx={{
              width: "50%",
              maxHeight: 150,
              objectFit: "scale-down",
              borderRadius: 1,
            }}
          />
        </Box>
        
        <Box sx={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 1, mt: 1 }}>
          <Typography sx={{ color: "#fff" }}>Item ID</Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.itemId}</Typography>
          <Typography sx={{ color: "#fff" }}>Vendidos</Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.vendidos}</Typography>
          
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>Precio unitario</Typography>
          <Typography
            sx={{
              fontWeight: "bold",
              color: selectedRow.precio_variable ? "#ff6b6b" : "#fff",
            }}
          >
            {formatCurrency(selectedRow.precio_promedio_efectivo)}
          </Typography>
          
          <Typography sx={{ color: "#fff" }}>Comisión unitaria</Typography>
          <Typography sx={{ color: "#fff" }}>- {formatCurrency(selectedRow.comision_unitaria)}</Typography>
          <Typography sx={{ color: "#fff" }}>Envío unitario</Typography>
          <Typography sx={{ color: "#fff" }}>- {formatCurrency(selectedRow.costoEnvio_unitario)}</Typography>
          <Typography sx={{ color: "#fff" }}>Publicidad unitaria</Typography>
          <Typography sx={{ color: "#fff" }}>- {formatCurrency(selectedRow.costo_publicidad)}</Typography>
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>Utilidad unitaria</Typography>
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>= {formatNumber2(selectedRow.utilidad_unitaria)}</Typography>
          
          <Typography sx={{ color: "#fff", fontWeight: "bold", mt: 2 }}>Precio total</Typography>
          <Typography sx={{ color: "#fff", fontWeight: "bold", mt: 2 }}>{formatCurrency(selectedRow.precio_promedio_efectivo * selectedRow.vendidos)}</Typography>
          <Typography sx={{ color: "#fff" }}>Comisión total</Typography>
          <Typography sx={{ color: "#fff" }}>- {formatCurrency(selectedRow.comision)}</Typography>
          <Typography sx={{ color: "#fff" }}>Costo envío total</Typography>
          <Typography sx={{ color: "#fff" }}>- {formatCurrency(selectedRow.costo_envio)}</Typography>
          <Typography sx={{ color: "#fff" }}>Publicidad total</Typography>
          <Typography sx={{ color: "#fff" }}>- {formatCurrency(selectedRow.costo_publicidad)}</Typography>
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>Utilidad</Typography>
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>= {formatCurrency(selectedRow.utilidad)}</Typography>
          


          <Typography sx={{ color: "#fff" }}>En Transito: </Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.transfer ?? 0}</Typography>


          <Typography sx={{ color: "#fff" }}>Disponible: </Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.stock_disponible ?? 0}</Typography>

          <Typography sx={{ color: "#fff" }}>En Camino: </Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.stock_encamino ?? 0}</Typography>

          <Typography sx={{ color: "#fff" }}>Recibo: </Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.stock_recibo ?? 0}</Typography>

          <Typography sx={{ color: "#fff" }}>Calidad: </Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.stock_calidad ?? 0}</Typography>

          <Typography sx={{ color: "#fff" }}>CH a MX: </Typography>
          <Typography sx={{ color: "#fff" }}>{selectedRow.stock_a_cedis ?? 0}</Typography>
          


        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            href={selectedRow.link}
            target="_blank"
            variant="contained"
            color="secondary"
            fullWidth
          >
            Ver en MercadoLibre
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProductDrawer;