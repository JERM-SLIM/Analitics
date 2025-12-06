import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton
} from "@mui/material";
import {
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";

const ProveedoresModal = ({ open, onClose, codigo, titulo, proveedores, loading }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
  };

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
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
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

        {/* Mejor proveedor recomendado */}
        {mejorProveedor && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
            icon={<AttachMoneyIcon />}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              🏆 Mejor opción recomendada
            </Typography>
            <Typography variant="body2" sx={{ color: '#4caf50' }}>
              {mejorProveedor.NOMBRE} - {formatCurrency(mejorProveedor.COST)} c/u
              {mejorProveedor.UNITS > 0 && ` - ${mejorProveedor.UNITS} unidades disponibles`}
            </Typography>
          </Alert>
        )}

        {/* Tabla de proveedores */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#42a5f5' }} />
            <Typography sx={{ ml: 2, color: '#fff' }}>Cargando proveedores...</Typography>
          </Box>
        ) : proveedores && proveedores.length > 0 ? (
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Proveedor
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Costo Unitario
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Unidades
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Modelo
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                    SKU
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proveedores.map((proveedor, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      backgroundColor: proveedor === mejorProveedor 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : index % 2 === 0 
                          ? 'rgba(255,255,255,0.02)' 
                          : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(66, 165, 245, 0.1)'
                      }
                    }}
                  >
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {proveedor === mejorProveedor && (
                          <Chip 
                            label="RECOMENDADO" 
                            size="small" 
                            sx={{ 
                              mr: 1, 
                              backgroundColor: '#4caf50', 
                              color: '#fff',
                              fontSize: '0.6rem',
                              height: 20
                            }} 
                          />
                        )}
                        {proveedor.NOMBRE}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Typography variant="body2" sx={{ 
                        color: proveedor.COST < (mejorProveedor?.COST || Infinity) 
                          ? '#4caf50' 
                          : '#fff',
                        fontWeight: 'bold'
                      }}>
                        {formatCurrency(proveedor.COST)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InventoryIcon sx={{ 
                          mr: 1, 
                          fontSize: 16,
                          color: proveedor.UNITS > 0 ? '#4caf50' : '#f44336' 
                        }} />
                        <Typography variant="body2" sx={{ 
                          color: proveedor.UNITS > 0 ? '#4caf50' : '#f44336',
                          fontWeight: proveedor.UNITS > 0 ? 'bold' : 'normal'
                        }}>
                          {proveedor.UNITS}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {proveedor.MODELO || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {proveedor.SKU || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ backgroundColor: 'rgba(66, 165, 245, 0.1)' }}>
            <Typography variant="body2" sx={{ color: '#42a5f5' }}>
              No se encontraron proveedores para este producto.
            </Typography>
          </Alert>
        )}

        {/* Estadísticas */}
        {proveedores && proveedores.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Proveedores</Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {proveedores.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Costo Promedio</Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {formatCurrency(
                      proveedores.reduce((sum, p) => sum + p.COST, 0) / proveedores.length
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Disponibilidad Total</Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {proveedores.reduce((sum, p) => sum + p.UNITS, 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Botones de acción */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#94a3b8' }}>
            Cerrar
          </Button>
          {mejorProveedor && (
            <Button
              variant="contained"
              startIcon={<AttachMoneyIcon />}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#43a047' }
              }}
              onClick={() => {
                // Aquí podrías agregar lógica para crear una orden de compra
                alert(`Orden de compra creada con ${mejorProveedor.NOMBRE}`);
              }}
            >
              Crear Orden con {mejorProveedor.NOMBRE}
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ProveedoresModal;