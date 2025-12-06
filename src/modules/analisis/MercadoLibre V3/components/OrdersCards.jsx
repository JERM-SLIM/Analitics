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
  Tooltip
} from "@mui/material";

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

export default function OrdersCards({
  visibleRows,
  page,
  setPage,
  pageCount,
  setSelectedRow,
  setDrawerOpen
}) {
  const [selectedCardId, setSelectedCardId] = useState(null);

  const handleOpen = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
    // Guardar el ID de la tarjeta seleccionada
    setSelectedCardId(row.id || row.codigo || Math.random().toString());
  };

  // Calcular el número de inicio para la numeración
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
          <Typography variant="body2">Días inventario:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {row.dias_inventario || 0}d
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

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
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card
                sx={{
                  height: "100%",
                  background: isSelected 
                    ? "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)" 
                    : "#ffffff15",
                  border: isSelected 
                    ? "2px solid #6366f1" 
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

                {/* INDICADOR DE SELECCIÓN */}
                {isSelected && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
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
                        backgroundColor: isSelected ? '#ffffff15' : '#ffffff08',
                        border: isSelected ? '1px solid rgba(255,255,255,0.2)' : 'none'
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
                      color: isSelected ? '#e0e7ff' : '#fff'
                    }}
                  >
                    {row.titulo || row.codigo || "Sin título"}
                  </Typography>

                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.65rem', 
                      mb: 1.5,
                      opacity: isSelected ? 0.9 : 0.8,
                      display: 'block',
                      color: isSelected ? '#c7d2fe' : '#94a3b8'
                    }}
                  >
                    Código: {row.codigo}
                  </Typography>

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
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : 0.7 }}>
                            Stock
                          </Typography>
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: isSelected ? '#e0e7ff' : '#fff' }}>
                            {(row.stock_disponible + row.stock_encamino + row.stock_en_transito) || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>

                    {/* VENTAS */}
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : 0.7 }}>
                          Ventas
                        </Typography>
                        <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: isSelected ? '#e0e7ff' : '#fff' }}>
                          {row.vendidos || 0}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* UTILIDAD */}
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : 0.7 }}>
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
                          background: isSelected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : 0.7 }}>
                            Precio Promedio
                          </Typography>
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.75rem", color: isSelected ? '#e0e7ff' : '#fff' }}>
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
                          background: isSelected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : 0.7 }}>
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
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: isSelected ? 0.9 : 0.7 }}>
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
                    
                    {/* ACTIVO */}
                    {row.STATUS_PUBLICACION === "active" && (
                      <Chip
                        label="ACTIVO"
                        size="small"
                        sx={{
                          fontSize: "0.55rem",
                          height: "18px",
                          background: isSelected ? "rgba(76, 175, 80, .5)" : "rgba(76, 175, 80, .3)",
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
                          background: isSelected ? "rgba(255, 152, 0, .5)" : "rgba(255, 152, 0, .35)",
                          color: "#ff9800",
                          fontWeight: "bold"
                        }}
                      />
                    )}

                    {row.riesgo_stock_out && row.riesgo_stock_out !== 'BAJO_RIESGO' && (
                      <Tooltip title={row.riesgo_stock_out.replace('_', ' ')}>
                        <Chip
                          icon={<span style={{ color: "#fff",fontSize: '0.8rem' }}>{getStockIcon(row.riesgo_stock_out)}</span>}
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
                        : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      '&:hover': {
                        background: isSelected 
                          ? "linear-gradient(45deg, #4F46E5 30%, #7C3AED 90%)" 
                          : "linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)",
                      }
                    }}
                  >
                    {isSelected ? "Detalles Abiertos" : "Ver Detalles"}
                  </Button>

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

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