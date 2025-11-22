// components/PurchaseCart.jsx
import React, { useState } from "react";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material"; // Agregar esta importación

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  TextField,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon
} from "@mui/icons-material";

const PurchaseCart = ({ 
  selectedProducts, 
  onRemoveProduct, 
  onUpdateQuantity,
  onUpdateSupplier, // Nueva función
  onCreateOrder,
  onClearCart // Nueva función
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [supplier, setSupplier] = useState("");
  const [priority, setPriority] = useState("medium");

  const totalCost = selectedProducts.reduce(
    (sum, product) => sum + (product.costo_unitario * product.quantity), 
    0
  );

    // Agregar esta función para manejar cambio de proveedor
  const handleSupplierChange = (productId, newSupplier) => {
    onUpdateSupplier(productId, newSupplier);
  };
  
  const handleCreateOrder = () => {
    const orderData = {
      supplier,
      priority,
      notes: orderNotes,
      total: totalCost
    };
    
    onCreateOrder(orderData);
    setOpenDialog(false);
    setOrderNotes("");
    setSupplier("");
    setPriority("medium");
  };

  if (selectedProducts.length === 0) {
    return (
      <Card sx={{ backgroundColor: "#1e2a38", color: "white", mb: 2 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CartIcon sx={{ fontSize: 48, color: "gray", mb: 2 }} />
          <Typography variant="h6" color="gray">
            Carrito de Compras Vacío
          </Typography>
          <Typography variant="body2" color="gray" sx={{ mt: 1 }}>
            Selecciona productos de la tabla para agregarlos al carrito
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ backgroundColor: "#1e2a38", color: "white", mb: 2 }}>
       <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              🛒 Carrito de Compras ({selectedProducts.length} productos)
            </Typography>
            <Chip 
              label={`Total: $${totalCost.toFixed(2)}`} 
              color="primary" 
              variant="outlined"
            />
          </Box>

          <TableContainer component={Paper} sx={{ backgroundColor: "#263238" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Producto</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Proveedor</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Costo Unit.</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cantidad</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subtotal</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell sx={{ color: "white" }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {product.picture_url && (
                          <img 
                            src={product.picture_url} 
                            alt={product.titulo}
                            style={{ 
                              width: 40, 
                              height: 40, 
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {product.titulo}
                          </Typography>
                          <Typography variant="caption" color="gray">
                            ID: {product.itemId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    {/* Columna de Proveedor Editable */}
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={product.proveedor || "Proveedor A"}
                          onChange={(e) => handleSupplierChange(product.id, e.target.value)}
                          sx={{ 
                            color: "white",
                            backgroundColor: '#37474f',
                            '& .MuiSelect-icon': { color: 'white' }
                          }}
                        >
                          <MenuItem value="Proveedor A">Proveedor A</MenuItem>
                          <MenuItem value="Proveedor B">Proveedor B</MenuItem>
                          <MenuItem value="Proveedor C">Proveedor C</MenuItem>
                          <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell sx={{ color: "white" }}>
                      ${product.costo_unitario?.toFixed(2) || "0.00"}
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                          sx={{ color: "white" }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          size="small"
                          type="number"
                          value={product.quantity}
                          onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value) || 1)}
                          inputProps={{ 
                            min: 1, 
                            style: { 
                              textAlign: 'center', 
                              color: 'white',
                              padding: '6px 8px'
                            } 
                          }}
                          sx={{ 
                            width: 70, 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                              },
                            }
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                          sx={{ color: "white" }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    
                    <TableCell sx={{ color: "white", fontWeight: 'bold' }}>
                      ${((product.costo_unitario || 0) * product.quantity).toFixed(2)}
                    </TableCell>
                    
                    <TableCell>
                      <IconButton 
                        onClick={() => onRemoveProduct(product.id)}
                        sx={{ color: "#ff6b6b" }}
                        title="Eliminar del carrito"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={onClearCart}
              startIcon={<DeleteIcon />}
            >
              Limpiar Todo
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => setOpenDialog(true)}
              startIcon={<ShoppingCartIcon />}
            >
              Generar Orden de Compra
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para crear orden */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#1e2a38", color: "white" }}>
          📋 Crear Orden de Compra
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#263238", color: "white" }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Proveedor</InputLabel>
                <Select
                  value={supplier}
                  label="Proveedor"
                  onChange={(e) => setSupplier(e.target.value)}
                  sx={{ color: "white" }}
                >
                  <MenuItem value="proveedor_a">Proveedor A</MenuItem>
                  <MenuItem value="proveedor_b">Proveedor B</MenuItem>
                  <MenuItem value="proveedor_c">Proveedor C</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Prioridad</InputLabel>
                <Select
                  value={priority}
                  label="Prioridad"
                  onChange={(e) => setPriority(e.target.value)}
                  sx={{ color: "white" }}
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notas de la orden"
                multiline
                rows={3}
                fullWidth
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                sx={{ 
                  '& .MuiInputBase-input': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'white' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Resumen de la Orden:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  • Productos: {selectedProducts.length}
                </Typography>
                <Typography variant="body2">
                  • Total: ${totalCost.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1e2a38" }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "white" }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateOrder}
            disabled={!supplier}
          >
            Confirmar Orden
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PurchaseCart;