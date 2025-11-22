import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  Button,
  TextField,
  Card,
  CardContent,
} from "@mui/material";

export default function PurchaseDrawer({ open, onClose, product }) {
  if (!product) return null;

  // Lógica para sugerir proveedor (después puedes reemplazarlo con datos reales)
  const proveedor =
    product.COSTO <= 50
      ? "Proveedor A"
      : product.COSTO <= 120
      ? "Proveedor B"
      : "Proveedor C";

  const utilidad = product.PRICE - product.COSTO;
  const margen = ((utilidad / product.COSTO) * 100).toFixed(1);

  // Cantidad editable por el usuario
  const [cantidadCompra, setCantidadCompra] = useState(
    Math.max(20 - product.STOCK, 5)
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 3, background: "#1e272e", color: "white" }}>
        {/* ------------------------------------------------------- */}
        {/* TITULO PRINCIPAL */}
        {/* ------------------------------------------------------- */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          🛒 Compra de Producto
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          {product.TITLE}
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Código: <b>{product.CODIGO}</b>
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ------------------------------------------------------- */}
        {/* TARJETA DE INFORMACIÓN GENERAL */}
        {/* ------------------------------------------------------- */}
        <Card sx={{ background: "#263238", color: "white", mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">Costo:</Typography>
                <Chip label={`$${product.COSTO}`} color="warning" sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Precio:</Typography>
                <Chip label={`$${product.PRICE}`} color="primary" sx={{ mt: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Margen:
                </Typography>
                <Chip
                  label={`${margen}% (${utilidad.toFixed(2)} util.)`}
                  color={margen >= 30 ? "success" : "error"}
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Proveedor sugerido:
                </Typography>
                <Chip label={proveedor} color="info" sx={{ mt: 1 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------- */}
        {/* TARJETA DE REABASTECIMIENTO */}
        {/* ------------------------------------------------------- */}
        <Card sx={{ background: "#37474f", color: "white", mb: 2 }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              📦 Reabastecimiento recomendado
            </Typography>

            <TextField
              label="Cantidad a comprar"
              type="number"
              value={cantidadCompra}
              onChange={(e) => setCantidadCompra(Number(e.target.value))}
              fullWidth
              InputProps={{
                inputProps: { min: 1 }
              }}
              sx={{
                background: "white",
                borderRadius: 1,
              }}
            />
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* ------------------------------------------------------- */}
        {/* BOTÓN PRINCIPAL */}
        {/* ------------------------------------------------------- */}
        <Button
          fullWidth
          variant="contained"
          color="success"
          sx={{ py: 1.5, fontSize: "1rem" }}
          onClick={() => {
            const compra = {
              codigo: product.CODIGO,
              titulo: product.TITLE,
              proveedor,
              costo: product.COSTO,
              cantidad: cantidadCompra,
              total: cantidadCompra * product.COSTO,
            };

            console.log("Orden generada:", compra);

            // Aquí conectar con tu backend (API POST)
            // await axios.post("/api/compras", compra);

            onClose();
          }}
        >
          Generar Orden de Compra
        </Button>
      </Box>
    </Drawer>
  );
}
