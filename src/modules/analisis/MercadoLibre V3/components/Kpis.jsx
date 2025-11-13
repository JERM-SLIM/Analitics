import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Tooltip
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip
} from "recharts";
import AnimatedNumber from "../AnimatedNumber";

const Kpis = ({
  topVentas,
  topUtilidad,
  totalVendidos,
  totalUtilidad,
  totalUtilidadSinCostos,
  ticketPromedio,
  precioPromedio,
  margenPromedio
}) => {
  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(v ?? 0));

  const kpis = [
    {
      title: "Unidades vendidas",
      rawValue: totalVendidos,
      tooltip: "Total unidades vendidas en el periodo",
      icon: <ShoppingCartIcon />,
      colorFrom: "#11998e",
      colorTo: "#38ef7d",
      sparkData: topVentas.map((d) => ({ name: d.titulo, value: d.vendidos })),
      format: (v) => Math.round(v).toLocaleString("es-MX"),
      unit: "Unidades",
    },
   {
      title: "Utilidad sin Costo",
      rawValue: totalUtilidadSinCostos,
      tooltip: "Ventas menos comisiones, envío y publicidad (sin costo de compra)",
      icon: <AttachMoneyIcon />,
      colorFrom: "#ff6a00",
      colorTo: "#ee0979",
      sparkData: topUtilidad.map((d) => {
        const utilidadSinCosto = (d.precio || 0) - ((d.comision || 0) + (d.costo_envio || 0) + (d.costo_publicidad || 0));
        return { name: d.titulo, value: utilidadSinCosto };
      }),
      format: formatCurrency,
      unit: "Pesos MXN",
    },
    {
      title: "Utilidad Total",
      rawValue: totalUtilidad,
      tooltip: "Utilidad neta = ventas - costos",
      icon: <AttachMoneyIcon />,
      colorFrom: "#ff7e5f",
      colorTo: "#feb47b",
      sparkData: topUtilidad.map((d) => ({ name: d.titulo, value: d.utilidad })),
      format: formatCurrency,
      unit: "Pesos MXN",
    },
    {
      title: "Ticket Promedio",
      rawValue: ticketPromedio,
      tooltip: "Promedio de venta por unidad",
      icon: <TrendingUpIcon />,
      colorFrom: "#4facfe",
      colorTo: "#00f2fe",
      sparkData: topVentas.map((d) => ({ name: d.titulo, value: d.precio || 0 })),
      format: formatCurrency,
      unit: "MXN por unidad",
    },
    {
      title: "Precio Promedio",
      rawValue: precioPromedio,
      tooltip: "Precio promedio de los productos vendidos",
      icon: <ShowChartIcon />,
      colorFrom: "#845ec2",
      colorTo: "#d65db1",
      sparkData: topVentas.map((d) => ({ name: d.titulo, value: d.precio || 0 })),
      format: formatCurrency,
      unit: "MXN promedio",
    },
    {
      title: "Margen Promedio",
      rawValue: margenPromedio,
      tooltip: "Promedio de margen (utilidad/ventas) %",
      icon: <TrendingUpIcon />,
      colorFrom: "#f7971e",
      colorTo: "#ffd200",
      sparkData: topUtilidad.map((d) => ({ name: d.titulo, value: (d.utilidad / (d.precio || 1)) * 100 })),
      format: (v) => `${Number(v).toFixed(2)}%`,
      unit: "Porcentaje %",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      {kpis.map((kpi, idx) => (
        <Grid item xs={12} sm={6} md={2} key={kpi.title}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${kpi.colorFrom} 0%, ${kpi.colorTo} 100%)`,
              boxShadow: "none",
              borderRadius: 1,
              minHeight: 80,
              color: "#fff",
              overflow: "visible",
              // Eliminar completamente cualquier efecto de hover
              "&:hover": {
                boxShadow: "none",
                transform: "none",
                cursor: "default"
              },
              // Eliminar transiciones que puedan causar efectos no deseados
              transition: "none"
            }}
          >
            <CardContent sx={{ display: "flex", gap: 1, alignItems: "center", p: 0.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.12)",
                  flexShrink: 0,
                }}
              >
                <Box sx={{ color: "#fff" }}>{kpi.icon}</Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Tooltip
                  title={kpi.tooltip}
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "rgba(0,0,0,0.8)",
                        boxShadow: "none",
                        color: "#fff",
                        fontSize: 11,
                      },
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 12, opacity: 0.95 }}>
                    {kpi.title}
                  </Typography>
                </Tooltip>

                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.05 }}>
                  <AnimatedNumber value={kpi.rawValue ?? 0} format={kpi.format} duration={800} />
                </Typography>

                <Typography sx={{ fontSize: 11, opacity: 0.9 }}>{kpi.unit}</Typography>
              </Box>
            </CardContent>

            <Box sx={{ height: 40, px: 1.25, pb: 1.25 }}>
              {kpi.sparkData && kpi.sparkData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={kpi.sparkData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`grad-${idx}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="rgba(255, 255, 255, 0.9)"
                      fill={`url(#grad-${idx})`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Kpis;