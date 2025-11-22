// ProductDrawer.jsx - VERSIÓN COMPACTA CON TUS CAMPOS
import React from "react";
import {
  Drawer, Typography, Box, Divider, Button, Chip, Tooltip, LinearProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent
} from "@mui/material";
import {
  TrendingUp, Inventory, LocalShipping, Star, Analytics, HelpOutline,
  AttachMoney, ShowChart, PieChart, Warning
} from "@mui/icons-material";

const ProductDrawer = ({ selectedRow, drawerOpen, setDrawerOpen }) => {
  const [formulaDialog, setFormulaDialog] = React.useState({ open: false, title: '', formula: '' });

  const formatCurrency = (v) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(v ?? 0));
  const formatPercent = (v) => `${Number(v ?? 0).toFixed(1)}%`;
  const formatNumber2 = (v) => Number(v ?? 0).toFixed(2);

  // FÓRMULAS CON TUS CAMPOS EXACTOS
  const formulas = {
    vendidos: { 
      descripcion: "Total unidades vendidas en el período", 
      formula: "SUM(h_cantidad_vendida)" 
    },
    numero_ordenes: { 
      descripcion: "Número único de órdenes procesadas", 
      formula: "COUNT(DISTINCT a_numero_de_orden)" 
    },
    unidades_por_orden: { 
      descripcion: "Promedio de unidades por orden", 
      formula: "total_cantidad_vendida / numero_ordenes" 
    },
    ticket_promedio: { 
      descripcion: "Valor promedio por orden", 
      formula: "total_ventas / numero_ordenes" 
    },
    stock_disponible: { 
      descripcion: "Stock listo para venta inmediata", 
      formula: "FULFILLMENT_AVAILABLE" 
    },
    dias_inventario: { 
      descripcion: "Días de inventario restante", 
      formula: "stock_disponible / (total_cantidad_vendida / días_período)" 
    },
    sell_through_rate: { 
      descripcion: "% de rotación del inventario", 
      formula: "(total_cantidad_vendida / (stock_disponible + total_cantidad_vendida)) × 100" 
    },
    precio_promedio_efectivo: { 
      descripcion: "Precio real incluyendo costos operativos", 
      formula: "(total_ventas + total_comision + costo_publicidad) / total_cantidad_vendida" 
    },
    utilidad: { 
      descripcion: "Ganancia neta después de costos", 
      formula: "total_ventas - (costo_publicidad + total_comision + costo_envio_total)" 
    },
    margen_neto_porcentaje: { 
      descripcion: "% de ganancia neta sobre ventas", 
      formula: "((total_ventas - costo_total_operativo) / total_ventas) × 100" 
    },
    total_utilidad_bruta: { 
      descripcion: "Utilidad bruta antes de costos específicos", 
      formula: "total_ventas - costos_directos" 
    },
    costo_total_unitario: { 
      descripcion: "Costo total por unidad vendida", 
      formula: "(total_comision + costo_envio_total + costo_publicidad) / total_cantidad_vendida" 
    },
    comision: { 
      descripcion: "Comisiones totales aplicadas", 
      formula: "SUM(comisiones_por_orden)" 
    },
    costo_publicidad: { 
      descripcion: "Inversión total en publicidad", 
      formula: "SUM(gasto_publicitario)" 
    },
    roi_publicidad: { 
      descripcion: "Retorno de inversión en publicidad", 
      formula: "((utilidad_attributed_to_ads - costo_publicidad) / costo_publicidad) × 100" 
    }
  };

  const showFormula = (title, formulaData) => {
    setFormulaDialog({ 
      open: true, 
      title, 
      formula: `${formulaData.descripcion}\n\nFÓRMULA:\n${formulaData.formula}`
    });
  };

  // Componente métrica compacta
  const Metric = ({ label, value, formulaKey, isCurrency = false, isPercent = false, color = "default" }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#cfd8dc', fontSize: '0.8rem' }}>{label}</Typography>
        <IconButton size="small" sx={{ color: '#42a5f5', ml: 0.2, p: 0.2 }} onClick={() => showFormula(label, formulas[formulaKey])}>
          <HelpOutline sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 
        color === 'success' ? '#4caf50' : color === 'warning' ? '#ff9800' : color === 'error' ? '#f44336' : '#ffffff'
      }}>
        {isCurrency ? formatCurrency(value) : isPercent ? formatPercent(value) : value}
      </Typography>
    </Box>
  );

  // Tarjeta compacta
  const CompactCard = ({ title, icon, children, color = "#42a5f5" }) => (
    <Card sx={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${color}20`, borderRadius: 1, mb: 1.5 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', color, fontSize: '0.9rem' }}>
          {icon}
          <span style={{ marginLeft: 6 }}>{title}</span>
        </Typography>
        {children}
      </CardContent>
    </Card>
  );

  if (!selectedRow) return null;

  return (
    <>
      <Drawer variant="temporary" anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { 
          width: 420, 
          backgroundColor: "#0f172a", 
          color: "#fff", 
          p: 2, 
          height: "100vh",
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        } }}>

        {/* HEADER COMPACTO */}
        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
          <Analytics sx={{ fontSize: 28, color: '#42a5f5', mb: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Dashboard Ejecutivo</Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Análisis Integral</Typography>
        </Box>
        <Divider sx={{ mb: 0.5, borderColor: "rgba(255,255,255,0.1)" }} />
        
        {/* PRODUCTO COMPACTO */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
          <Box component="img" src={selectedRow.picture_url} alt={selectedRow.titulo}
            sx={{ width: 60, height: 60, objectFit: "contain", borderRadius: 1, border: "1px solid rgba(255,255,255,0.1)", mr: 1.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', lineHeight: 1.2 }}>{selectedRow.titulo || "Sin título"}</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>COD: {selectedRow.codigo}</Typography>
          </Box>
        </Box>

        {/* RIESGO COMPACTO */}
        <Grid container spacing={1} sx={{ mb: 0.5 }}>
          <Grid item xs={12} >
            <Card sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="body2" sx={{ color: '#cfd8dc', mb: 1 }}>Riesgo Stock</Typography>
              <Chip
                label={selectedRow.riesgo_stock_out?.replace('_', ' ') || 'BAJO'}
                color={
                  selectedRow.riesgo_stock_out === "ALTO_RIESGO" || selectedRow.riesgo_stock_out === "SIN_STOCK" ? "error" :
                  selectedRow.riesgo_stock_out === "MEDIO_RIESGO" ? "warning" : "success"
                }
                size="small"
                sx={{ width: '100%' }}
              />
            </Card>
          </Grid>
        </Grid>

        {/* MÉTRICAS EN GRID COMPACTO */}
        <Grid container spacing={0.5}>
          {/* DESEMPEÑO COMERCIAL */}
          <Grid item xs={12}>
            <CompactCard title="Desempeño Comercial" icon={<ShowChart />} color="#42a5f5">
              <Metric label="Ventas Totales" value={selectedRow.vendidos} formulaKey="vendidos" />
              <Metric label="Órdenes" value={selectedRow.numero_ordenes} formulaKey="numero_ordenes" />
              <Metric label="Ticket Promedio" value={selectedRow.ticket_promedio} formulaKey="ticket_promedio" isCurrency />
              <Metric label="Unid./Orden" value={selectedRow.unidades_por_orden?.toFixed(1)} formulaKey="unidades_por_orden" />
              <Metric label="Precio Promedio" value={selectedRow.precio_promedio_efectivo} formulaKey="precio_promedio_efectivo" isCurrency />
            </CompactCard>
          </Grid>

          {/* RENTABILIDAD */}
          <Grid item xs={12}>
            <CompactCard title="Rentabilidad" icon={<AttachMoney />} color="#4caf50">
              <Metric label="Utilidad Neta" value={selectedRow.utilidad} formulaKey="utilidad" isCurrency 
                color={selectedRow.utilidad > 0 ? 'success' : 'error'} />
              <Metric label="Utilidad Bruta" value={selectedRow.total_utilidad_bruta} formulaKey="total_utilidad_bruta" isCurrency 
                color={selectedRow.total_utilidad_bruta > 0 ? 'success' : 'error'} />
              <Metric label="Margen Neto" value={selectedRow.margen_neto_porcentaje} formulaKey="margen_neto_porcentaje" isPercent 
                color={selectedRow.margen_neto_porcentaje > 20 ? 'success' : selectedRow.margen_neto_porcentaje > 10 ? 'warning' : 'error'} />
            </CompactCard>
          </Grid>

          {/* INVENTARIO */}
          <Grid item xs={6}>
            <CompactCard title="Inventario" icon={<Inventory />} color="#ff9800">
              <Metric label="Stock" value={selectedRow.stock_total} formulaKey="stock_disponible" />
              <Metric label="Días Inventario" value={selectedRow.dias_inventario} formulaKey="dias_inventario" />
              <Metric label="Rotación" value={selectedRow.sell_through_rate} formulaKey="sell_through_rate" isPercent 
                color={selectedRow.sell_through_rate > 30 ? 'success' : selectedRow.sell_through_rate > 15 ? 'warning' : 'error'} />
            </CompactCard>
          </Grid>

          {/* COSTOS */}
          <Grid item xs={6}>
            <CompactCard title="Costos" icon={<PieChart />} color="#f44336">
              <Metric label="(Comisión + Publicidad)/Unidad" value={selectedRow.costo_total_unitario} formulaKey="costo_total_unitario" isCurrency />
              <Metric label="Publicidad" value={selectedRow.costo_publicidad} formulaKey="costo_publicidad" isCurrency />
              <Metric label="Comisiones" value={selectedRow.comision} formulaKey="comision" isCurrency />
            </CompactCard>
          </Grid>
        </Grid>
      
        {/* BOTÓN COMPACTO */}
        <Button 
          variant="contained" 
          fullWidth 
          size="medium" 
          sx={{ mt: 2, fontWeight: 'bold', py: 1, background: "linear-gradient(45deg, #FF6B00 30%, #FF8F00 90%)" }}
          onClick={() => window.open(`https://articulo.mercadolibre.com.mx/MLM-${selectedRow.itemId}`, '_blank')}
        >
          <LocalShipping sx={{ mr: 1, fontSize: 18 }} />Ver en MercadoLibre
        </Button>
      </Drawer>

      {/* DIALOGO COMPACTO */}
      <Dialog open={formulaDialog.open} onClose={() => setFormulaDialog({ open: false, title: '', formula: '' })}
        PaperProps={{ sx: { backgroundColor: '#1e293b', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ backgroundColor: '#0f172a', color: 'white', py: 1.5, fontSize: '1rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpOutline sx={{ mr: 1, color: '#42a5f5' }} />
            {formulaDialog.title}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ color: 'white', py: 2 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, fontFamily: 'system-ui' }}>
            {formulaDialog.formula}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#0f172a', py: 1 }}>
          <Button onClick={() => setFormulaDialog({ open: false, title: '', formula: '' })} sx={{ color: '#42a5f5', fontWeight: 'bold' }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductDrawer;