// Analitics/src/modules/analisis/MercadoLibre V4/components/OrdersCards.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Pagination,
  Chip,
  Tooltip,
  Modal
} from "@mui/material";
import {
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon
} from "@mui/icons-material";

// Función auxiliar para formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
};

// Función para obtener color según el valor del indicador
const getIndicatorColor = (value, type) => {
  switch (type) {
    case 'margen':
      if (value > 20) return "#4caf50";
      if (value > 10) return "#ff9800";
      return "#f44336";
    case 'stock':
      if (value === 'SIN_STOCK') return "#f44336";
      if (value === 'ALTO_RIESGO') return "#ff9800";
      if (value === 'MEDIO_RIESGO') return "#ffeb3b";
      return "#4caf50";
    default:
      return value >= 0 ? "#4caf50" : "#f44336";
  }
};

// Función para obtener icono de stock
const getStockIcon = (riskLevel) => {
  switch (riskLevel) {
    case 'SIN_STOCK': return '❌ SIN_STOCK';
    case 'ALTO_RIESGO': return '⚠️ ALTO_RIESGO';
    case 'MEDIO_RIESGO': return '📉 MEDIO_RIESGO';
    case 'BAJO_RIESGO': return '✅ BAJO_RIESGO';
    default: return '📦';
  }
};

// 🆕 FUNCIÓN AUXILIAR PARA MANEJAR VALORES (CADENA O NÚMERO)
const parseComboValue = (value) => {
  if (value === null || value === undefined) return 0;
  
  // Si es una cadena, limpia las comillas y convierte a número
  if (typeof value === 'string') {
    const cleaned = value.replace(/"/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  
  // Si ya es un número, úsalo directamente
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// 🆕 FUNCIÓN PARA FORMATO DE NÚMEROS
const formatNumber = (value) => {
  return new Intl.NumberFormat('es-MX').format(Number(value) || 0);
};

// Componente Modal de Proveedores
const ProveedoresModal = ({ open, onClose, codigo, titulo, proveedores, loading }) => {
  // Calcular mejor proveedor (menor costo con unidades disponibles)
  const mejorProveedor = proveedores && proveedores.length > 0
    ? proveedores.reduce((best, current) => {
        // Priorizar proveedores con unidades disponibles
        if (current.UNITS > 0 && (best === null || current.COST < best.COST)) {
          return current;
        }
        return best;
      }, null)
    : null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        maxWidth: '90vw',
        maxHeight: '80vh',
        bgcolor: '#1e293b',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        overflow: 'auto'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon sx={{ mr: 1, color: '#42a5f5' }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
              Proveedores Disponibles
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ color: '#fff', minWidth: 'auto' }}>
            <CloseIcon />
          </Button>
        </Box>

        {/* Información del producto */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(66, 165, 245, 0.1)', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>
            {titulo}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Código: {codigo}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography sx={{ color: '#fff' }}>Cargando proveedores...</Typography>
          </Box>
        ) : proveedores && proveedores.length > 0 ? (
          <>
            {/* Mejor proveedor recomendado */}
            {mejorProveedor && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 1 }}>
                  🏆 Mejor opción recomendada
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: '#c8e6c9' }}>Proveedor:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      {mejorProveedor.NOMBRE}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: '#c8e6c9' }}>Costo:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {formatCurrency(mejorProveedor.COST)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: '#c8e6c9' }}>Disponible:</Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 'bold', 
                      color: mejorProveedor.UNITS > 0 ? '#4caf50' : '#f44336'
                    }}>
                      {mejorProveedor.UNITS} unidades
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Lista de todos los proveedores */}
            <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 'bold' }}>
              Todos los proveedores ({proveedores.length})
            </Typography>
            
            <Grid container spacing={2}>
              {proveedores.map((proveedor, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ 
                    backgroundColor: proveedor === mejorProveedor 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : 'rgba(255,255,255,0.05)',
                    border: proveedor === mejorProveedor 
                      ? '1px solid rgba(76, 175, 80, 0.3)' 
                      : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                          {proveedor.NOMBRE}
                          {proveedor === mejorProveedor && (
                            <Chip 
                              label="RECOMENDADO" 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                backgroundColor: '#4caf50', 
                                color: '#fff',
                                fontSize: '0.6rem',
                                height: 18
                              }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: proveedor.COST < (mejorProveedor?.COST || Infinity) 
                            ? '#4caf50' 
                            : '#fff',
                          fontWeight: 'bold'
                        }}>
                          {formatCurrency(proveedor.COST)}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            Modelo:
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#fff' }}>
                            {proveedor.MODELO || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            SKU:
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#fff' }}>
                            {proveedor.SKU || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <InventoryIcon sx={{ 
                              mr: 1, 
                              fontSize: 16,
                              color: proveedor.UNITS > 0 ? '#4caf50' : '#f44336' 
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: proveedor.UNITS > 0 ? '#4caf50' : '#f44336',
                              fontWeight: 'bold'
                            }}>
                              {proveedor.UNITS} unidades disponibles
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <LocalShippingIcon sx={{ fontSize: 48, color: '#374151', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              No se encontraron proveedores para este producto
            </Typography>
          </Box>
        )}

        {/* Botones de acción */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ color: '#94a3b8' }}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default function OrdersCards({
  visibleRows,
  page,
  setPage,
  pageCount,
  setSelectedRow,
  setDrawerOpen,
  cart = [],
  toggleCartItem,
  proveedoresPorCodigo = {},
  loadingProveedores = {},
  fetchProveedores
}) {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [proveedorModal, setProveedorModal] = useState({
    open: false,
    codigo: null,
    titulo: null
  });

  const handleOpen = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
    setSelectedCardId(row.id || row.codigo || Math.random().toString());
  };

  const handleOpenProveedores = (codigo, titulo, e) => {
    e.stopPropagation();
    
    if (!proveedoresPorCodigo[codigo] && fetchProveedores) {
      fetchProveedores(codigo);
    }
    
    setProveedorModal({
      open: true,
      codigo,
      titulo
    });
  };

  const startNumber = page * (visibleRows.length > 0 ? Math.ceil(visibleRows.length / visibleRows.length) * 12 : 0) + 1;

  // Tooltip content para stock detallado
  const StockTooltipContent = ({ row }) => (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Stock Detallado
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="body2">Disponible:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.stock_disponible || 0}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">En tránsito:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.stock_en_transito || 0}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">En camino:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.stock_encamino || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">CH a MX:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.stock_a_cedis || 0}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Recibo:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.stock_recibo || 0}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Calidad:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.stock_calidad || 0}
          </Typography>
        </Grid>
         <Grid item xs={6}>
          <Typography variant="body2">Cotizacion:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.cotizacion || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">Días inventario:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.dias_inventario || 0}d
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  // TOOLTIP CONTENT PARA VENTAS CON INFORMACIÓN DE COMBOS
  const VentasTooltipContent = ({ row }) => {
    const ventasIndividuales = row.vendidos || 0;
    const ventasCombos = row.tiene_combos 
      ? (row.combo_detalle || []).reduce((total, combo) => 
          total + parseComboValue(combo.VENTAS_INDIVIDUAL || combo.VENTAS_COMBO_TOTAL), 0)
      : 0;
    const ventasTotales = ventasIndividuales + ventasCombos;
    const porcentajeCombos = ventasTotales > 0 
      ? Math.round((ventasCombos / ventasTotales) * 100) 
      : 0;

    return (
      <Box sx={{ p: 1, minWidth: 250 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Resumen de Ventas
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Ventas Individuales:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {formatNumber(ventasIndividuales)} uds
            </Typography>
          </Box>
          
          {row.tiene_combos && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Ventas en Combos:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ce93d8' }}>
                  {formatNumber(ventasCombos)} uds
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Ventas:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {formatNumber(ventasTotales)} uds
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">% Ventas en Combos:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ce93d8' }}>
                  {porcentajeCombos}%
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* SECCIÓN PARA MOSTRAR INFORMACIÓN DETALLADA DE COMBOS */}
        {row.tiene_combos && (
          <>
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ce93d8' }}>
                📦 Desglose por Combo
              </Typography>
              {(row.combo_detalle || []).map((combo, idx) => {
                const cantidad = parseComboValue(combo.CANTIDAD_EN_COMBO);
                const ventasCombo = parseComboValue(combo.VENTAS_COMBO_TOTAL);
                const ventasIndividual = parseComboValue(combo.VENTAS_INDIVIDUAL);
                const codigo = combo.CODIGO_COMBO ? String(combo.CODIGO_COMBO).replace(/"/g, '') : 'N/A';
                
                return (
                  <Box 
                    key={idx} 
                    sx={{ 
                      mb: 1.5, 
                      p: 1, 
                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      borderRadius: 1,
                      border: '1px solid rgba(156, 39, 176, 0.2)'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e1bee7', mb: 0.5 }}>
                      {codigo}
                    </Typography>
                    
                    <Grid container spacing={0.5}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#b39ddb' }}>
                          Cant. por combo:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {cantidad}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#b39ddb' }}>
                          Ventas del combo:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatNumber(ventasCombo)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#b39ddb' }}>
                          Ventas individuales (desglosadas):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {formatNumber(ventasIndividual)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* SI NO TIENE COMBOS, MOSTRAR MENSAJE */}
        {!row.tiene_combos && (
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#9e9e9e' }}>
              Este producto no forma parte de ningún combo.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Tooltip content para precios
  const PriceTooltipContent = ({ row }) => (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Precios
      </Typography>
      <Box sx={{ minWidth: 120 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Promedio:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.precio_promedio_efectivo)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Mínimo:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.precio_min)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Máximo:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.precio_max)}
          </Typography>
        </Box>
        {(() => {
          const min = row.precio_min;
          const max = row.precio_max;
          if (!min || !max || min === 0) return null;

          const diff = max - min;
          const percent = (diff / min) * 100;
          let color = "text.secondary";
          let label = "Sin cambio";
          let arrow = "→";

          if (percent > 0) {
            color = "#4caf50";
            label = "Aumento";
            arrow = "↑";
          } else if (percent < 0) {
            color = "#f44336";
            label = "Disminución";
            arrow = "↓";
          }

          return (
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <Typography variant="body2">Variación:</Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold", color }}>
                {arrow} {percent.toFixed(1)}%
              </Typography>
            </Box>
          );
        })()}
      </Box>
    </Box>
  );

  // Tooltip content para costos
  const CostTooltipContent = ({ row }) => (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Costos Desglosados
      </Typography>
      <Box sx={{ minWidth: 140 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Producto:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.costo)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Comisión:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.comision_unitaria_promedio)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Envío:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.costo_envio_por_unidad)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">Publicidad:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatCurrency(row.costo_publicidad)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Total:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ff9800" }}>
            {formatCurrency(row.total_costos)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mt: 3 }}>
      {/* PAGINACIÓN ARRIBA */}
      {pageCount > 1 && (
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 3,
          p: 2,
          backgroundColor: "rgba(30, 42, 56, 0.8)",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#fff",
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            Productos ({visibleRows.length} resultados)
          </Typography>
          
          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={(e, value) => setPage(value - 1)}
            color="primary"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.75rem',
                minWidth: '32px',
                height: '32px',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(33, 150, 243, 0.3)',
                  border: '1px solid rgba(33, 150, 243, 0.5)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }
            }}
          />

          <Typography 
            variant="body2" 
            sx={{ 
              color: "#cfd8dc",
              fontStyle: "italic",
              fontSize: '0.75rem'
            }}
          >
            Página {page + 1} de {pageCount}
          </Typography>
        </Box>
      )}

      {/* TARJETAS CON NUMERACIÓN */}
      <Grid container spacing={1.5}>
        {visibleRows.map((row, idx) => {
          const cardNumber = startNumber + idx;
          const cardId = row.id || row.codigo || Math.random().toString();
          const isSelected = selectedCardId === cardId;
          
          // 🛒 VERIFICAR SI EL PRODUCTO ESTÁ EN EL CARRITO
          const isInCart = cart && Array.isArray(cart) 
            ? cart.some(cartItem => cartItem.codigo === row.codigo) 
            : false;
          
          // 🆕 Calcular ventas totales para mostrar
          const ventasIndividuales = row.vendidos || 0;
          const ventasCombos = row.tiene_combos 
            ? (row.combo_detalle || []).reduce((total, combo) => 
                total + parseComboValue(combo.VENTAS_INDIVIDUAL || combo.VENTAS_COMBO_TOTAL), 0)
            : 0;
          const ventasTotales = ventasIndividuales + ventasCombos;
          
          // 🛒 Obtener información de proveedores
          const proveedores = proveedoresPorCodigo[row.codigo] || [];
          const tieneProveedores = proveedores.length > 0;
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card
                sx={{
                  height: "100%",
                  background: isSelected 
                    ? "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)" 
                    : isInCart
                    ? "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)" 
                    : "#ffffff15",
                  border: isSelected 
                    ? "2px solid #6366f1" 
                    : isInCart
                    ? "2px solid #4caf50"
                    : "1px solid #ffffff22",
                  backdropFilter: "blur(8px)",
                  borderRadius: 2,
                  color: "#fff",
                  transition: "0.2s",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: isSelected 
                      ? "0px 6px 20px rgba(99, 102, 241, 0.4)" 
                      : isInCart
                      ? "0px 6px 20px rgba(76, 175, 80, 0.4)"
                      : "0px 4px 12px rgba(0,0,0,0.3)"
                  }
                }}
              >
                
                {/* NÚMERO DE TARJETA */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    backgroundColor: isSelected 
                      ? "rgba(99, 102, 241, 0.9)" 
                      : isInCart
                      ? "rgba(76, 175, 80, 0.9)"
                      : "rgba(33, 150, 243, 0.9)",
                    color: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    zIndex: 1,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  {cardNumber}
                </Box>

                {/* 🛒 INDICADOR DE CARRITO (si está en el carrito) */}
                {isInCart && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: row.store ? 40 : 6,
                      backgroundColor: "#4caf50",
                      color: "white",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: "bold",
                      zIndex: 1,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                    }}
                  >
                    🛒
                  </Box>
                )}

                {/* TIENDA */}
                {row.store && (
                  <Chip
                    label={row.store}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      zIndex: 2,
                      backgroundColor: "#2196f3",
                      color: "#fff",
                      fontWeight: "bold",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.25)"
                    }}
                  />
                )}

                {/* INDICADOR DE SELECCIÓN */}
                {isSelected && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: row.store ? 40 : 6,
                      backgroundColor: "#6366f1",
                      color: "white",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: "bold",
                      zIndex: 1,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                    }}
                  >
                    ✓
                  </Box>
                )}

                <CardContent sx={{ p: 1.5, pt: 2.5, '&:last-child': { pb: 1.5 } }}>

                  {/* IMAGEN */}
                  {row.picture_url && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1.5,
                        height: 80,
                        overflow: 'hidden',
                        borderRadius: 1.5,
                        backgroundColor: isSelected ? '#ffffff15' : isInCart ? 'rgba(76, 175, 80, 0.1)' : '#ffffff08',
                        border: isSelected ? '1px solid rgba(255,255,255,0.2)' : isInCart ? '1px solid rgba(76, 175, 80, 0.3)' : 'none'
                      }}
                    >
                      <img
                        src={row.picture_url}
                        alt={row.titulo || row.codigo}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </Box>
                  )}

                  {/* TÍTULO Y CÓDIGO */}
                  <Typography 
                    variant="subtitle2"
                    sx={{ 
                      mb: 0.5, 
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      height: '2.2em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.1,
                      color: isSelected ? '#e0e7ff' : isInCart ? '#c8e6c9' : '#fff'
                    }}
                  >
                    {row.titulo || row.codigo || "Sin título"}
                  </Typography>

                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.65rem', 
                      mb: 1,
                      opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.8,
                      display: 'block',
                      color: isSelected ? '#c7d2fe' : isInCart ? '#a5d6a7' : '#94a3b8'
                    }}
                  >
                    Código: {row.codigo}
                  </Typography>

                  {/* TARJETA COMBINADA - INFORMACIÓN DE COMBOS */}
                  {row.tiene_combos && (
                    <Box sx={{ 
                      mb: 1.5,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: isSelected ? 'rgba(156, 39, 176, 0.15)' : isInCart ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)',
                      border: '1px solid rgba(156, 39, 176, 0.3)'
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 'bold',
                          color: isSelected ? '#e1bee7' : isInCart ? '#d1c4e9' : '#ce93d8',
                          display: 'block',
                          mb: 0.5
                        }}
                      >
                        📦 PARTE DE {row.combo_detalle?.length || 0} COMBO(S)
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.6rem',
                          color: isSelected ? '#d1c4e9' : isInCart ? '#b39ddb' : '#b39ddb',
                          display: 'block'
                        }}
                      >
                        Ventas en combos: {formatNumber(ventasCombos)} uds
                      </Typography>
                    </Box>
                  )}

                  {/* DATOS PRINCIPALES CON TOOLTIPS */}
                  <Grid container spacing={1} sx={{ mb: 1.5 }}>
                    {/* STOCK CON TOOLTIP */}
                    <Grid item xs={4}>
                      <Tooltip 
                        title={<StockTooltipContent row={row} />} 
                        placement="top"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: 'rgba(30, 42, 56, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: 2,
                            }
                          }
                        }}
                      >
                        <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.7 }}>
                            Stock
                          </Typography>
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: isSelected ? '#e0e7ff' : isInCart ? '#c8e6c9' : '#fff' }}>
                            {(row.stock_disponible + row.stock_encamino + row.stock_en_transito) || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>

                    {/* 🆕 VENTAS CON TOOLTIP DE COMBOS */}
                    <Grid item xs={4}>
                      <Tooltip 
                        title={<VentasTooltipContent row={row} />} 
                        placement="top"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: 'rgba(30, 42, 56, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: 2,
                              maxWidth: 300
                            }
                          }
                        }}
                      >
                        <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.7 }}>
                            Ventas
                          </Typography>
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: isSelected ? '#e0e7ff' : isInCart ? '#c8e6c9' : '#fff' }}>
                            {formatNumber(ventasTotales)}
                            {row.tiene_combos && (
                              <Typography 
                                component="span" 
                                sx={{ 
                                  fontSize: '0.55rem',
                                  color: '#ce93d8',
                                  ml: 0.5
                                }}
                              >
                                (+{formatNumber(ventasCombos)})
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>

                    {/* UTILIDAD */}
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.7 }}>
                          Utilidad Neta
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontWeight: "bold", 
                            fontSize: "0.75rem",
                            color: getIndicatorColor(row.utilidad)
                          }}
                        >
                          {formatCurrency(row.utilidad)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* PRECIO Y COSTO CON TOOLTIPS */}
                  <Grid container spacing={1} sx={{ mb: 1.5 }}>
                    {/* PRECIO PROMEDIO CON TOOLTIP */}
                    <Grid item xs={6}>
                      <Tooltip 
                        title={<PriceTooltipContent row={row} />} 
                        placement="top"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: 'rgba(30, 42, 56, 0.95)',
                              border: '1px solid rgba(0, 0, 0, 0.2)',
                              borderRadius: 2,
                            }
                          }
                        }}
                      >
                        <Box sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          background: isSelected ? "rgba(255,255,255,0.12)" : isInCart ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.7 }}>
                            Precio Promedio
                          </Typography>
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: isSelected ? '#e0e7ff' : isInCart ? '#c8e6c9' : '#fff' }}>
                            {formatCurrency(row.precio_promedio_efectivo)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>

                    {/* COSTO TOTAL CON TOOLTIP */}
                    <Grid item xs={6}>
                      <Tooltip 
                        title={<CostTooltipContent row={row} />} 
                        placement="top"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: 'rgba(30, 42, 56, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: 2,
                            }
                          }
                        }}
                      >
                        <Box sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          background: isSelected ? "rgba(255,255,255,0.12)" : isInCart ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.7 }}>
                            Costo Total Promedio
                          </Typography>
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: "#ff9800" }}>
                            {formatCurrency(row.total_costos)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                  </Grid>

                  {/* MARGEN SI EXISTE */}
                  {row.margen && (
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : isInCart ? 0.9 : 0.7 }}>
                        Margen
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontWeight: "bold", 
                          fontSize: "0.75rem",
                          color: getIndicatorColor(row.margen, 'margen')
                        }}
                      >
                        {Number(row.margen).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}

                  {/* CHIPS COMPACTOS */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, mb: 1.5 }}>
                    {/* CHIP DE COMBO */}
                    {row.tiene_combos && (
                      <Tooltip 
                        title={
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              Información de Combo
                            </Typography>
                            {(row.combo_detalle || []).map((combo, idx) => {
                              const cantidad = parseComboValue(combo.CANTIDAD_EN_COMBO);
                              const ventas = parseComboValue(combo.VENTAS_COMBO_TOTAL);
                              const codigo = combo.CODIGO_COMBO ? String(combo.CODIGO_COMBO).replace(/"/g, '') : 'N/A';
                              return (
                                <Typography key={idx} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  • {codigo}: {cantidad} uds/combo ({ventas} ventas)
                                </Typography>
                              );
                            })}
                          </Box>
                        }
                        placement="top"
                        arrow
                      >
                        <Chip
                          label="COMBO"
                          size="small"
                          sx={{
                            fontSize: '0.55rem',
                            height: '18px',
                            background: isSelected ? "rgba(156, 39, 176, .5)" : isInCart ? "rgba(156, 39, 176, .4)" : "rgba(156, 39, 176, .35)",
                            color: "#e1bee7",
                            fontWeight: "bold",
                            '&:hover': {
                              background: isSelected ? "rgba(156, 39, 176, .7)" : isInCart ? "rgba(156, 39, 176, .5)" : "rgba(156, 39, 176, .5)",
                            }
                          }}
                        />
                      </Tooltip>
                    )}

                    {/* CHIP DE CARRITO (si está en el carrito) */}
                    {isInCart && (
                      <Chip
                        label="EN CARRITO"
                        size="small"
                        sx={{
                          fontSize: '0.55rem',
                          height: '18px',
                          background: "rgba(76, 175, 80, .5)",
                          color: "#fff",
                          fontWeight: "bold",
                          '&:hover': {
                            background: "rgba(76, 175, 80, .7)",
                          }
                        }}
                      />
                    )}

                    {/* ACTIVO */}
                    {row.STATUS_PUBLICACION === "active" && (
                      <Chip
                        label="ACTIVO"
                        size="small"
                        sx={{
                          fontSize: "0.55rem",
                          height: "18px",
                          background: isSelected ? "rgba(76, 175, 80, .5)" : isInCart ? "rgba(76, 175, 80, .4)" : "rgba(76, 175, 80, .3)",
                          color: "#fff",
                          fontWeight: "bold"
                        }}
                      />
                    )}

                    {/* PAUSADO / FINALIZADO */}
                    {row.STATUS_PUBLICACION && row.STATUS_PUBLICACION !== "active" && (
                      <Chip
                        label={row.STATUS_PUBLICACION === "paused" ? "PAUSADO" : "FINALIZADO"}
                        size="small"
                        sx={{
                          fontSize: "0.55rem",
                          height: "18px",
                          background: isSelected 
                            ? row.STATUS_PUBLICACION === "paused"
                              ? "rgba(255, 152, 0, .5)"
                              : "rgba(255, 82, 82, .5)"
                            : isInCart
                            ? row.STATUS_PUBLICACION === "paused"
                              ? "rgba(255, 152, 0, .4)"
                              : "rgba(255, 82, 82, .4)"
                            : row.STATUS_PUBLICACION === "paused"
                              ? "rgba(255, 152, 0, .3)"
                              : "rgba(255, 82, 82, .3)",
                          color: "#fff",
                          fontWeight: "bold"
                        }}
                      />
                    )}

                    {row.hubo_variacion_precio && (
                      <Chip
                        label="PRECIO VAR"
                        size="small"
                        sx={{
                          fontSize: '0.55rem',
                          height: '18px',
                          background: isSelected ? "rgba(255, 152, 0, .5)" : isInCart ? "rgba(255, 152, 0, .4)" : "rgba(255, 152, 0, .35)",
                          color: "#ff9800",
                          fontWeight: "bold"
                        }}
                      />
                    )}

                    {row.riesgo_stock_out && row.riesgo_stock_out !== 'BAJO_RIESGO' && (
                      <Tooltip title={row.riesgo_stock_out.replace('_', ' ')}>
                        <Chip
                          icon={<span style={{ color: "#fff", fontSize: '0.8rem' }}>{getStockIcon(row.riesgo_stock_out)}</span>}
                          label=""
                          size="small"
                          sx={{
                            fontSize: '0.55rem',
                            height: '18px',
                            minWidth: '18px',
                            background: getIndicatorColor(row.riesgo_stock_out, 'stock'),
                            color: "#fff",
                            fontWeight: "bold"
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* BOTÓN VER DETALLES */}
                  <Button
                    size="small"
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpen(row)}
                    sx={{ 
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      padding: '4px 8px',
                      minHeight: '28px',
                      background: isSelected 
                        ? "linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)" 
                        : isInCart
                        ? "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)"
                        : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      '&:hover': {
                        background: isSelected 
                          ? "linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)" 
                          : isInCart
                          ? "linear-gradient(45deg, #43a047 30%, #5cb860 90%)"
                          : "linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)",
                      }
                    }}
                  >
                    {isSelected ? "Detalles Abiertos" : "Ver Detalles"}
                  </Button>

                  {/* 🛒 BOTÓN PARA AGREGAR/QUITAR DEL CARRITO */}
                  <Button
                    size="small"
                    fullWidth
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (toggleCartItem) {
                        toggleCartItem(row);
                      }
                    }}
                    sx={{ 
                      mt: 1,
                      borderRadius: 1,
                      fontSize: '0.65rem',
                      padding: '3px 6px',
                      minHeight: '24px',
                      borderColor: isInCart ? '#4caf50' : '#ffffff55',
                      color: isInCart ? '#4caf50' : '#ffffff',
                      backgroundColor: isInCart ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                      '&:hover': {
                        borderColor: isInCart ? '#66bb6a' : '#ffffff88',
                        backgroundColor: isInCart ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    {isInCart ? (
                      <>
                        <span style={{ marginRight: '4px' }}>✓</span>
                        Quitar del Carrito
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '4px' }}>🛒</span>
                        Agregar al Carrito
                      </>
                    )}
                  </Button>

                  {/* 🚚 BOTÓN PARA VER PROVEEDORES */}
                  {row.codigo && (
                    <Button
                      size="small"
                      fullWidth
                      variant="text"
                      onClick={(e) => handleOpenProveedores(row.codigo, row.titulo, e)}
                      sx={{ 
                        mt: 0.5,
                        fontSize: '0.6rem',
                        padding: '2px 4px',
                        minHeight: '20px',
                        color: '#42a5f5',
                        '&:hover': {
                          backgroundColor: 'rgba(66, 165, 245, 0.1)',
                        }
                      }}
                    >
                      <LocalShippingIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                      Ver Proveedores
                      {tieneProveedores && (
                        <Chip
                          label={proveedores.length}
                          size="small"
                          sx={{ 
                            ml: 1, 
                            height: 16, 
                            fontSize: '0.5rem',
                            backgroundColor: 'rgba(66, 165, 245, 0.2)',
                            color: '#42a5f5'
                          }}
                        />
                      )}
                    </Button>
                  )}

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal de proveedores */}
      <ProveedoresModal
        open={proveedorModal.open}
        onClose={() => setProveedorModal({ open: false, codigo: null, titulo: null })}
        codigo={proveedorModal.codigo}
        titulo={proveedorModal.titulo}
        proveedores={proveedorModal.codigo ? proveedoresPorCodigo[proveedorModal.codigo] : []}
        loading={proveedorModal.codigo ? loadingProveedores[proveedorModal.codigo] : false}
      />

      {/* PAGINACIÓN ABAJO */}
      {pageCount > 1 && (
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          mt: 2,
          pt: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={(e, value) => setPage(value - 1)}
            color="primary"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.75rem',
                minWidth: '32px',
                height: '32px',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(33, 150, 243, 0.3)',
                  border: '1px solid rgba(33, 150, 243, 0.5)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}