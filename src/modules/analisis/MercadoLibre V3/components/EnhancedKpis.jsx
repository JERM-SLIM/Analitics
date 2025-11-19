// components/EnhancedKpis.jsx
import React from "react";
import { Card, CardContent, Typography, Box, Grid } from "@mui/material";

const EnhancedKpis = ({ 
  totalVendidos, 
  totalUtilidad, 
  items,
  ticketPromedio,
  precioPromedio 
}) => {
  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(v ?? 0));

  // Calcular promedios de los nuevos indicadores
  const promedioMargenNeto = items.length > 0 
    ? items.reduce((acc, item) => acc + (item.margen_neto_porcentaje || 0), 0) / items.length 
    : 0;

  const promedioROI = items.length > 0 
    ? items.reduce((acc, item) => acc + (item.roi_publicidad || 0), 0) / items.length 
    : 0;

  const promedioUnidadesPorOrden = items.length > 0 
    ? items.reduce((acc, item) => acc + (item.unidades_por_orden || 0), 0) / items.length 
    : 0;

  return (
    <Card sx={{ backgroundColor: "#1e2a38", mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
          📊 Indicadores Clave de Performance
        </Typography>
        
        <Grid container spacing={2}>
          {/* KPIs Existentes */}
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#263238", borderRadius: 1 }}>
              <Typography variant="h4" sx={{ color: "#4CAF50", fontWeight: "bold" }}>
                {totalVendidos}
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                Total Vendidos
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#263238", borderRadius: 1 }}>
              <Typography variant="h4" sx={{ color: "#2196F3", fontWeight: "bold" }}>
                {formatCurrency(totalUtilidad)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                Utilidad Total
              </Typography>
            </Box>
          </Grid>

          {/* Nuevos KPIs */}
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#263238", borderRadius: 1 }}>
              <Typography variant="h4" sx={{ color: promedioMargenNeto > 15 ? "#4CAF50" : "#FF9800", fontWeight: "bold" }}>
                {promedioMargenNeto.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                Margen Neto Prom.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#263238", borderRadius: 1 }}>
              <Typography variant="h4" sx={{ color: promedioROI > 100 ? "#4CAF50" : "#FF9800", fontWeight: "bold" }}>
                {promedioROI.toFixed(0)}%
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                ROI Pub. Prom.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#263238", borderRadius: 1 }}>
              <Typography variant="h4" sx={{ color: "#9C27B0", fontWeight: "bold" }}>
                {formatCurrency(ticketPromedio)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                Ticket Promedio
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#263238", borderRadius: 1 }}>
              <Typography variant="h4" sx={{ color: "#FF9800", fontWeight: "bold" }}>
                {promedioUnidadesPorOrden.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                Unid/Orden Prom.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EnhancedKpis;