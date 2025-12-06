import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  Divider,
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  Paper,
  Collapse,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert
} from "@mui/material";
import {
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Check as CheckIcon,
  CompareArrows as CompareArrowsIcon
} from "@mui/icons-material";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
};

const CartSummary = ({ 
  cart, 
  open, 
  onClose, 
  updateCartQuantity, 
  removeFromCart, 
  clearCart,
  cartTotals,
  onCheckout,
  proveedoresPorCodigo = {},
  loadingProveedores = {},
  selectedProveedores = {},
  setSelectedProveedores
}) => {
  const [expandedProveedores, setExpandedProveedores] = useState({});

  const toggleProveedores = (codigo) => {
    setExpandedProveedores(prev => ({
      ...prev,
      [codigo]: !prev[codigo]
    }));
  };

  // Función para seleccionar un proveedor
  const handleSelectProveedor = (codigoProducto, proveedor) => {
    if (!setSelectedProveedores) {
      console.error("setSelectedProveedores no está definido");
      return;
    }

    const newSelection = {
      ...selectedProveedores,
      [codigoProducto]: {
        ...proveedor,
        productoCodigo: codigoProducto,
        productoNombre: cart.find(item => item.codigo === codigoProducto)?.titulo || codigoProducto
      }
    };
    
    // Actualizar el estado padre
 // Solo llamar si la función existe
    if (typeof setSelectedProveedores === 'function') {
      setSelectedProveedores(newSelection);
    }
    };

  // Función para quitar la selección de un proveedor
  const handleRemoveProveedor = (codigoProducto) => {
    if (!setSelectedProveedores) {
      console.error("setSelectedProveedores no está definido");
      return;
    }

    const newSelection = { ...selectedProveedores };
    delete newSelection[codigoProducto];
    
    // Actualizar el estado padre
  if (typeof setSelectedProveedores === 'function') {
      setSelectedProveedores(newSelection);
    }
    };

  // Calcular totales actualizados con proveedores seleccionados
  const calcularTotalesActualizados = () => {
    if (!cart || cart.length === 0) {
      return cartTotals;
    }

    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalItems = 0;

    cart.forEach(item => {
      const cantidad = item.cartQuantity || 1;
      const precioOriginal = item.precio_promedio_efectivo || 0;
      const costoOriginal = 0; // CORRECCIÓN: usar el costo del item
      
      // Verificar si hay un proveedor seleccionado para este producto
      const proveedorSeleccionado = selectedProveedores[item.codigo];
      
      // Usar costo del proveedor si está seleccionado, si no usar costo original
      const costoUnitario = proveedorSeleccionado 
        ? proveedorSeleccionado.COST
        : costoOriginal;
      
      const costoTotal = costoUnitario * cantidad;
      const valorTotal = costoUnitario * cantidad;
      //const utilidadTotal = valorTotal - costoTotal;
      
      totalValue += valorTotal;
      totalCost += costoTotal;
      //totalProfit += utilidadTotal;
      totalItems += cantidad;
    });

    const margin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;

    return {
      totalProducts: cart.length,
      totalItems,
      totalValue,
      totalCost,
      totalProfit,
      margin
    };
  };

  const totalsActualizados = calcularTotalesActualizados();

  // Calcular ahorros comparados con el costo original
  const calcularAhorro = () => {
    if (!cart || cart.length === 0) return 0;
    
    let ahorroTotal = 0;
    
    cart.forEach(item => {
      const proveedorSeleccionado = selectedProveedores[item.codigo];
      if (proveedorSeleccionado) {
        const costoOriginal = 0;
        const costoProveedor = proveedorSeleccionado.COST || 0;
        const cantidad = item.cartQuantity || 1;
        
        // Si el costo del proveedor es menor, hay ahorro
        if (costoProveedor < costoOriginal) {
          ahorroTotal += (costoOriginal - costoProveedor) * cantidad;
        }
      }
    });
    
    return ahorroTotal;
  };

  const ahorroTotal = calcularAhorro();

  // Verificar si hay cambios en los costos
  const hayCambiosEnCostos = () => {
    return Object.keys(selectedProveedores).length > 0;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 500,
          backgroundColor: '#0f172a',
          color: '#fff',
          p: 2,
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 1, color: '#42a5f5' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Carrito de Selección
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Banner de ahorro si hay proveedores seleccionados */}
      {ahorroTotal > 0 && (
        <Alert 
          severity="success" 
          icon={<CompareArrowsIcon />}
          sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
            ¡Ahorro potencial de {formatCurrency(ahorroTotal)}!
          </Typography>
          <Typography variant="caption" sx={{ color: '#4caf50' }}>
            Has seleccionado proveedores con mejores precios
          </Typography>
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <Card sx={{ mb: 3, backgroundColor: hayCambiosEnCostos() ? 'rgba(76, 175, 80, 0.1)' : 'rgba(66, 165, 245, 0.1)', border: hayCambiosEnCostos() ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(66, 165, 245, 0.3)' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <InventoryIcon sx={{ color: hayCambiosEnCostos() ? '#4caf50' : '#42a5f5', fontSize: 24, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>
                  {totalsActualizados.totalProducts}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Productos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <AttachMoneyIcon sx={{ color: hayCambiosEnCostos() ? '#4caf50' : '#4caf50', fontSize: 24, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: hayCambiosEnCostos() ? '#4caf50' : '#fff' }}>
                  {formatCurrency(totalsActualizados.totalValue)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Costo Total
                </Typography>
              </Box>
            </Grid>
          </Grid>
    
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: '#374151', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              El carrito está vacío
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
              Agrega productos haciendo clic en 🛒
            </Typography>
          </Box>
        ) : (
          <List>
            {cart.map((item, index) => {
              const proveedores = proveedoresPorCodigo[item.codigo] || [];
              const tieneProveedores = proveedores.length > 0;
              const estaExpandido = expandedProveedores[item.codigo];
              const proveedorSeleccionado = selectedProveedores[item.codigo];
              const costoOriginal =  0; // CORRECCIÓN: usar el costo del item
              const costoActual = proveedorSeleccionado ? proveedorSeleccionado.COST : costoOriginal;
              const hayAhorro = proveedorSeleccionado && proveedorSeleccionado.COST < costoOriginal; // CORRECCIÓN: comparación correcta
              
              return (
                <React.Fragment key={item.codigo}>
                  <ListItem sx={{ 
                    backgroundColor: proveedorSeleccionado ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255,255,255,0.03)',
                    mb: 1,
                    borderRadius: 1,
                    border: proveedorSeleccionado ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                      {/* Imagen */}
                      <Box
                        component="img"
                        src={item.picture_url}
                        alt={item.titulo}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 1,
                          objectFit: 'cover',
                          mr: 2,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      />
                      
                      {/* Información */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                          {item.titulo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          Código: {item.codigo}
                        </Typography>
                        
                        {/* Cantidad */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => updateCartQuantity(item.codigo, (item.cartQuantity || 1) - 1)}
                            sx={{ color: '#94a3b8', p: 0.5 }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.cartQuantity || 1}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              updateCartQuantity(item.codigo, value);
                            }}
                            sx={{
                              width: 60,
                              mx: 1,
                              '& .MuiInputBase-input': {
                                textAlign: 'center',
                                color: '#fff',
                                fontSize: '0.875rem',
                                py: 0.5
                              }
                            }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => updateCartQuantity(item.codigo, (item.cartQuantity || 1) + 1)}
                            sx={{ color: '#94a3b8', p: 0.5 }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {/* Precio y costo */}
                      <Box sx={{ textAlign: 'right', ml: 2 }}>
                        {/* Precio de venta */}
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#42a5f5' }}>
                          {formatCurrency(item.precio_promedio_efectivo)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Precio venta
                        </Typography>
                        
                        {/* Costo */}
                        <Box sx={{ mt: 1 }}>
                          {/* Mostrar costo original si no hay proveedor seleccionado o si hay ahorro */}
                          {(!proveedorSeleccionado || hayAhorro) && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: hayAhorro ? '#ff9800' : '#ff9800',
                                textDecoration: hayAhorro ? 'line-through' : 'none',
                                fontSize: '0.8rem'
                              }}
                            >
                              {formatCurrency(costoOriginal)}
                            </Typography>
                          )}
                          
                          {/* Mostrar costo del proveedor si está seleccionado */}
                          {proveedorSeleccionado && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: hayAhorro ? '#4caf50' : '#ff9800',
                                fontSize: '0.9rem'
                              }}
                            >
                              {formatCurrency(costoActual)}
                            </Typography>
                          )}
                          
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Costo c/u
                          </Typography>
                        </Box>
                        
                        {/* Botón eliminar */}
                        <IconButton 
                          size="small" 
                          onClick={() => removeFromCart(item.codigo)}
                          sx={{ color: '#ef5350', ml: 1, mt: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Indicador de proveedor seleccionado */}
                    {proveedorSeleccionado && (
                      <Box sx={{ 
                        width: '100%', 
                        mt: 1, 
                        p: 1, 
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: 1,
                        border: '1px solid rgba(76, 175, 80, 0.2)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckIcon sx={{ color: '#4caf50', mr: 1, fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: '#c8e6c9', fontWeight: 'bold' }}>
                              Proveedor seleccionado:
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold', ml: 1 }}>
                              {proveedorSeleccionado.NOMBRE}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1 }}>
                              Costo: {formatCurrency(proveedorSeleccionado.COST)}
                            </Typography>
                            {hayAhorro && (
                              <Typography variant="caption" sx={{ color: '#4caf50', mr: 1, fontWeight: 'bold' }}>
                                (Ahorro: {formatCurrency(costoOriginal - proveedorSeleccionado.COST)})
                              </Typography>
                            )}
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveProveedor(item.codigo)}
                              sx={{ color: '#ef5350', p: 0.5 }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Sección de proveedores */}
                    {tieneProveedores && (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => toggleProveedores(item.codigo)}
                          startIcon={<LocalShippingIcon />}
                          endIcon={estaExpandido ? <RemoveIcon /> : <AddIcon />}
                          sx={{ 
                            fontSize: '0.65rem', 
                            color: '#42a5f5',
                            textTransform: 'none',
                            p: 0.5
                          }}
                        >
                          {estaExpandido ? 'Ocultar' : 'Ver'} proveedores ({proveedores.length})
                        </Button>
                        
                        <Collapse in={estaExpandido}>
                          <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid rgba(66, 165, 245, 0.3)' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                              Selecciona un proveedor:
                            </Typography>
                            
                            <RadioGroup 
                              value={proveedorSeleccionado?.PROVEEDOR_ID || ''}
                              onChange={(e) => {
                                const proveedorId = e.target.value;
                                const proveedor = proveedores.find(p => p.PROVEEDOR_ID === proveedorId);
                                if (proveedor) {
                                  handleSelectProveedor(item.codigo, proveedor);
                                }
                              }}
                            >
                              {proveedores.map((prov, idx) => {
                                const esSeleccionado = proveedorSeleccionado?.PROVEEDOR_ID === prov.PROVEEDOR_ID;
                                const esMasBarato = prov.COST < costoOriginal;
                                
                                return (
                                  <Box 
                                    key={idx} 
                                    sx={{ 
                                      mb: 1, 
                                      p: 1, 
                                      backgroundColor: esSeleccionado 
                                        ? 'rgba(76, 175, 80, 0.15)' 
                                        : 'rgba(66, 165, 245, 0.05)',
                                      borderRadius: 1,
                                      border: esSeleccionado 
                                        ? '1px solid rgba(76, 175, 80, 0.3)' 
                                        : '1px solid rgba(66, 165, 245, 0.1)',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: esSeleccionado 
                                          ? 'rgba(76, 175, 80, 0.2)' 
                                          : 'rgba(66, 165, 245, 0.1)'
                                      }
                                    }}
                                    onClick={() => handleSelectProveedor(item.codigo, prov)}
                                  >
                                    <FormControlLabel
                                      value={prov.PROVEEDOR_ID}
                                      control={<Radio size="small" sx={{ color: esSeleccionado ? '#4caf50' : '#42a5f5' }} />}
                                      label={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                          <Box>
                                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                              {prov.NOMBRE}
                                              {esMasBarato && (
                                                <Chip
                                                  label="Más barato"
                                                  size="small"
                                                  sx={{ 
                                                    ml: 1, 
                                                    height: 16, 
                                                    fontSize: '0.5rem',
                                                    backgroundColor: '#4caf50',
                                                    color: '#fff'
                                                  }}
                                                />
                                              )}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                Modelo: {prov.MODELO || 'N/A'}
                                              </Typography>
                                              <Typography variant="caption" sx={{ 
                                                color: prov.UNITS > 0 ? '#4caf50' : '#f44336',
                                                fontWeight: 'bold'
                                              }}>
                                                {prov.UNITS} unidades
                                              </Typography>
                                            </Box>
                                          </Box>
                                          <Box sx={{ textAlign: 'right' }}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                fontWeight: 'bold', 
                                                color: esMasBarato ? '#4caf50' : '#ff9800',
                                                fontSize: '0.8rem'
                                              }}
                                            >
                                              {formatCurrency(prov.COST)}
                                            </Typography>
                                            {esMasBarato && (
                                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                Ahorro: {formatCurrency(costoOriginal - prov.COST)}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      }
                                      sx={{ width: '100%', margin: 0 }}
                                    />
                                  </Box>
                                );
                              })}
                            </RadioGroup>
                            
                            {proveedorSeleccionado && (
                              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(76, 175, 80, 0.3)' }}>
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                  Costo actualizado para {item.cartQuantity || 1} unidades: {formatCurrency(proveedorSeleccionado.COST * (item.cartQuantity || 1))}
                                </Typography>
                                {hayAhorro && (
                                  <Typography variant="caption" sx={{ color: '#4caf50' }}>
                                    Ahorro total: {formatCurrency((costoOriginal - proveedorSeleccionado.COST) * (item.cartQuantity || 1))}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    )}

                    {loadingProveedores[item.codigo] && !tieneProveedores && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CircularProgress size={12} sx={{ color: '#42a5f5', mr: 1 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Cargando proveedores...
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                  {index < cart.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>

      {/* Resumen y acciones */}
      {cart.length > 0 && (
        <Paper sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: hayCambiosEnCostos() ? 'rgba(76, 175, 80, 0.1)' : 'rgba(30, 42, 56, 0.8)',
          border: hayCambiosEnCostos() ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: hayCambiosEnCostos() ? '#4caf50' : '#fff', fontWeight: 'bold' }}>
            {hayCambiosEnCostos() ? 'Resumen Actualizado con Proveedores' : 'Resumen del Carrito'}
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Productos:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                {totalsActualizados.totalProducts}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Unidades:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                {totalsActualizados.totalItems}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Valor Total:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: '#42a5f5', fontWeight: 'bold' }}>
                {formatCurrency(totalsActualizados.totalValue)}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Costo Total:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ 
                color: hayCambiosEnCostos() ? '#4caf50' : '#ff9800', 
                fontWeight: 'bold',
                textDecoration: hayCambiosEnCostos() ? 'none' : 'none'
              }}>
                {formatCurrency(totalsActualizados.totalCost)}
                {hayCambiosEnCostos() && (
                  <Typography 
                    component="span" 
                    variant="caption" 
                    sx={{ 
                      color: '#94a3b8', 
                      ml: 1,
                      textDecoration: 'line-through'
                    }}
                  >
                    {formatCurrency(calcularTotalesActualizados().totalValue)} 
                  </Typography>
                )}
              </Typography>
            </Grid>
          

            {/* Sección de ahorro */}
            {ahorroTotal > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1, borderColor: 'rgba(76, 175, 80, 0.3)' }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    Ahorro Total:
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {formatCurrency(ahorroTotal)}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearCart}
              sx={{ 
                color: '#ef5350',
                borderColor: '#ef5350',
                '&:hover': {
                  backgroundColor: 'rgba(239, 83, 80, 0.1)',
                  borderColor: '#ef5350'
                }
              }}
            >
              Vaciar Carrito
            </Button>
            
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={onCheckout}
              sx={{
                background: hayCambiosEnCostos() 
                  ? 'linear-gradient(45deg, #4caf50, #66bb6a)' 
                  : 'linear-gradient(45deg, #2196F3, #21CBF3)',
                '&:hover': {
                  background: hayCambiosEnCostos()
                    ? 'linear-gradient(45deg, #43a047, #5cb860)'
                    : 'linear-gradient(45deg, #1976D2, #00ACC1)'
                }
              }}
            >
              {hayCambiosEnCostos() ? 'Ver Resumen con Proveedores' : 'Ver Resumen Final'}
            </Button>
          </Box>
        </Paper>
      )}
    </Drawer>
  );
};

export default CartSummary;