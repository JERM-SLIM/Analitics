// cotizacionesListPage.jsx - VERSIÓN COMPLETA

import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Badge
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  SwapHoriz as SwapHorizIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";
import axios from "axios";
import api from "../../../../../services/api.js";
import * as XLSX from "xlsx";
import useOrdersData from "../../hooks/useOrdersData"; // ajusta ruta


const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
};


const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CotizacionesListPage = ({ onBack = {} }) => {

   const {
    proveedoresPorCodigo,
    loadingProveedores,
    fetchProveedores,
  } = useOrdersData();

const handleInitChangeProveedor = async (item, cotizacion) => {
  if (!item || !cotizacion) return;

  setItemToChange({
    ...item,
    proveedorActualNombre: cotizacion.PROVEEDOR_NOMBRE
  });

  const codigo = item.CODIGO; // ✅ AQUÍ ESTÁ LA CLAVE
  const proveedorActualId = cotizacion.PROVEEDOR_ID;

  if (!codigo) return;

  if (!proveedoresPorCodigo[codigo]) {
    await fetchProveedores(codigo);
  }

  const proveedoresProducto = proveedoresPorCodigo[codigo] || [];

  const proveedoresAlternativos = proveedoresProducto.filter(
    p => Number(p.PROVEEDOR_ID) !== Number(proveedorActualId)
  );

  setAvailableProveedores(proveedoresAlternativos);
  setShowChangeProveedorDialog(true);
};





  // Cambiar proveedor
// Cambiar proveedor// Cambiar proveedor (usando el endpoint existente)
const handleChangeProveedor = async () => {
  if (!itemToChange || !newProveedor || !selectedCotizacion) return;

  if (
    cantidadCancelar <= 0 ||
    cantidadCancelar > itemToChange.CANTIDAD_COTIZADA
  ) {
    alert(
      `La cantidad a cancelar debe ser mayor a 0 y menor o igual a ${itemToChange.CANTIDAD_COTIZADA}`
    );
    return;
  }

  try {
    const proveedorSeleccionado = availableProveedores.find(
      p => Number(p.PROVEEDOR_ID) === Number(newProveedor)
    );

    if (!proveedorSeleccionado) {
      alert("Proveedor no válido");
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmas el cambio de proveedor?\n\n` +
      `Producto: ${itemToChange.DESCRIPCION}\n` +
      `Cantidad a cancelar: ${cantidadCancelar}\n` +
      `Proveedor actual: ${itemToChange.proveedorActualNombre}\n` +
      `Nuevo proveedor: ${proveedorSeleccionado.NOMBRE}\n\n` +
      `Costo actual: ${formatCurrency(itemToChange.COSTO)}\n` +
      `Nuevo costo: ${formatCurrency(proveedorSeleccionado.COST)}`
    );

    if (!confirmar) return;

    // 🔗 ENDPOINT EXISTENTE
    await api.post("/web/cotizaciones/cancelar/item/cotizacion", {
      ID: selectedCotizacion.ID,
      CODIGO: itemToChange.CODIGO,
      CANCELADAS: cantidadCancelar,
      PROVEEDOR: proveedorSeleccionado.NOMBRE
    });

    alert("✅ Operación realizada correctamente");

    // Limpieza
    setShowChangeProveedorDialog(false);
    setNewProveedor("");
    setCantidadCancelar(1);
    setItemToChange(null);

    await fetchCotizaciones();

  } catch (err) {
    console.error(err);
    alert("❌ Error al procesar la operación");
  }
};




  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [proveedorFilter, setProveedorFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [cantidadCancelar, setCantidadCancelar] = useState(1);


  // Estados para diálogos
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [showChangeProveedorDialog, setShowChangeProveedorDialog] = useState(false);
  const [itemToChange, setItemToChange] = useState(null);
  const [newProveedor, setNewProveedor] = useState("");
  // const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [availableProveedores, setAvailableProveedores] = useState([]);
  
 
  // Cargar cotizaciones
const fetchCotizaciones = async () => { 
  try {
    setLoading(true);

    const response = await api.get("/web/cotizaciones/obtener/folios");

    const cotizacionesData = Array.isArray(response.data)
      ? response.data
      : [];

    setCotizaciones(cotizacionesData);
    setFilteredCotizaciones(cotizacionesData);

  } catch (error) {
    console.error("Error fetching cotizaciones:", error);
    setCotizaciones([]);
    setFilteredCotizaciones([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchCotizaciones();
  }, []);

  // Filtrar cotizaciones
  useEffect(() => {
    let filtered = [...cotizaciones];
    
    // Filtrar por tab (estado)
    if (selectedTab === 1) {
      filtered = filtered.filter(c => c.STATUS === "PENDIENTE");
    } else if (selectedTab === 2) {
      filtered = filtered.filter(c => c.STATUS === "APROBADA");
    } else if (selectedTab === 3) {
      filtered = filtered.filter(c => c.STATUS === "RECHAZADA");
    } else if (selectedTab === 4) {
      filtered = filtered.filter(c => c.STATUS === "COMPLETADA");
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.FOLIO?.toLowerCase().includes(term) ||
        c.PROVEEDOR_NOMBRE?.toLowerCase().includes(term) ||
        c.ITEMS?.some(item => 
          item.CODIGO?.toLowerCase().includes(term) ||
          item.DESCRIPCION?.toLowerCase().includes(term)
        )
      );
    }
    
    // Filtrar por status específico (si no es "all")
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.STATUS === statusFilter);
    }
    
    // Filtrar por proveedor
    if (proveedorFilter !== "all") {
      filtered = filtered.filter(c => c.PROVEEDOR_ID === parseInt(proveedorFilter));
    }
    
    // Filtrar por fecha
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(c => {
        const fechaCreacion = new Date(c.FECHA_CREACION);
        return fechaCreacion >= from;
      });
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // Fin del día
      filtered = filtered.filter(c => {
        const fechaCreacion = new Date(c.FECHA_CREACION);
        return fechaCreacion <= to;
      });
    }
    
    setFilteredCotizaciones(filtered);
  }, [cotizaciones, selectedTab, searchTerm, statusFilter, proveedorFilter, fromDate, toDate]);

  // Obtener proveedores únicos para el filtro
  const uniqueProveedores = Array.from(new Set(
    cotizaciones
      .filter(c => c.PROVEEDOR_ID && c.PROVEEDOR_NOMBRE)
      .map(c => ({ id: c.PROVEEDOR_ID, nombre: c.PROVEEDOR_NOMBRE }))
  ));

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDIENTE": return "warning";
      case "APROBADA": return "success";
      case "RECHAZADA": return "error";
      case "COMPLETADA": return "info";
      default: return "default";
    }
  };

  // Función para obtener icono según estado
  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDIENTE": return <PendingIcon />;
      case "APROBADA": return <CheckCircleIcon />;
      case "RECHAZADA": return <CancelIcon />;
      case "COMPLETADA": return <CheckCircleIcon />;
      default: return null;
    }
  };

  // Ver detalles de cotización
  const handleViewDetails = (cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setShowDetailDialog(true);
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      // Hoja de resumen
      const resumenData = [
        ['REPORTE DE COTIZACIONES'],
        ['Fecha de generación:', new Date().toLocaleDateString('es-MX')],
        ['Total de cotizaciones:', filteredCotizaciones.length],
        [''],
        ['Folio', 'Proveedor', 'Fecha', 'Estado', 'Total', 'Días Rango', 'Lead Time', 'Items']
      ];
      
      filteredCotizaciones.forEach(cot => {
        resumenData.push([
          cot.FOLIO,
          cot.PROVEEDOR_NOMBRE,
          formatDate(cot.FECHA_CREACION),
          cot.STATUS,
          formatCurrency(cot.TOTAL),
          cot.DIAS || 0,
          cot.LEADTIME || 0,
          cot.ITEMS?.length || 0
        ]);
      });
      
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
      
      // Hoja detallada por cotización
      filteredCotizaciones.forEach((cot, index) => {
        const detalleData = [
          [`COTIZACIÓN: ${cot.FOLIO}`],
          [`PROVEEDOR: ${cot.PROVEEDOR_NOMBRE}`],
          [`FECHA: ${formatDate(cot.FECHA_CREACION)}`],
          [`ESTADO: ${cot.STATUS}`],
          [`TOTAL: ${formatCurrency(cot.TOTAL)}`],
          [`DÍAS RANGO: ${cot.DIAS || 0}`],
          [`LEAD TIME: ${cot.LEADTIME || 0} días`],
          [''],
          ['ITEMS:'],
          ['Código', 'Descripción', 'Cantidad', 'Costo Original', 'Costo Nuevo', 'Modelo', 'Status']
        ];
        
        cot.ITEMS?.forEach(item => {
          detalleData.push([
            item.CODIGO,
            item.DESCRIPCION,
            item.CANTIDAD_COTIZADA,
            formatCurrency(item.COSTO),
            formatCurrency(item.COSTO_NUEVO),
            item.MODELO || 'N/A',
            item.STATUS === 0 ? 'Pendiente' : 'Procesado'
          ]);
        });
        
        const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
        XLSX.utils.book_append_sheet(wb, wsDetalle, `Cotización ${index + 1}`);
      });
      
      const fileName = `Reporte_Cotizaciones_${fecha}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert(`✅ Reporte exportado exitosamente: ${fileName}`);
      
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("❌ Error al generar el reporte Excel");
    }
  };

  // Calcular estadísticas
  const stats = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter(c => c.STATUS === "PENDIENTE").length,
    aprobadas: cotizaciones.filter(c => c.STATUS === "APROBADA").length,
    completadas: cotizaciones.filter(c => c.STATUS === "COMPLETADA").length,
    totalMonto: cotizaciones.reduce((sum, c) => sum + Number(c.TOTAL || 0), 0)
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProveedorFilter("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Volver al Dashboard
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🗂️ Administración de Cotizaciones
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchCotizaciones}
          >
            Actualizar
          </Button>
        </Box>
        
        <Typography variant="body1" color="textSecondary">
          Gestiona y administra todas las cotizaciones generadas desde el sistema
        </Typography>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Total Cotizaciones
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.pendientes}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats.aprobadas}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Aprobadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: '#9c27b0', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(stats.totalMonto)}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Monto Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterIcon sx={{ mr: 1, color: '#42a5f5' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filtros de Búsqueda
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            sx={{ mr: 2 }}
          >
            Exportar Excel
          </Button>
          
          {(searchTerm || statusFilter !== "all" || proveedorFilter !== "all" || fromDate || toDate) && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearFilters}
            >
              Limpiar Filtros
            </Button>
          )}
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar (folio, proveedor, producto)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#cfd8dc', mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="all">Todos los estados</MenuItem>
                <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                <MenuItem value="APROBADA">Aprobada</MenuItem>
                <MenuItem value="RECHAZADA">Rechazada</MenuItem>
                <MenuItem value="COMPLETADA">Completada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={proveedorFilter}
                onChange={(e) => setProveedorFilter(e.target.value)}
                label="Proveedor"
              >
                <MenuItem value="all">Todos los proveedores</MenuItem>
                {uniqueProveedores.map(prov => (
                  <MenuItem key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                type="date"
                label="Desde"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Hasta"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs de estados */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Badge badgeContent={stats.total} color="primary" showZero>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon fontSize="small" />
                  Todas
                </Box>
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={stats.pendientes} color="warning" showZero>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon fontSize="small" />
                  Pendientes
                </Box>
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={stats.aprobadas} color="success" showZero>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" />
                  Aprobadas
                </Box>
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={cotizaciones.filter(c => c.STATUS === "RECHAZADA").length} color="error" showZero>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon fontSize="small" />
                  Rechazadas
                </Box>
              </Badge>
            }
          />
          <Tab 
            label={
              <Badge badgeContent={stats.completadas} color="info" showZero>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" />
                  Completadas
                </Box>
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Tabla de cotizaciones */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Días/Lead Time</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Cargando cotizaciones...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredCotizaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No se encontraron cotizaciones con los filtros aplicados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCotizaciones.map((cotizacion) => (
                  <TableRow key={cotizacion.ID || cotizacion.FOLIO} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {cotizacion.FOLIO}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalShippingIcon sx={{ fontSize: 16, mr: 1, color: '#42a5f5' }} />
                        <Typography variant="body2">
                          {cotizacion.PROVEEDOR_NOMBRE || `Proveedor ${cotizacion.PROVEEDOR_ID}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(cotizacion.FECHA_CREACION)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(cotizacion.STATUS)}
                        label={cotizacion.STATUS}
                        color={getStatusColor(cotizacion.STATUS)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {formatCurrency(cotizacion.TOTAL)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={`${cotizacion.ITEMS?.length || 0} items`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <DateRangeIcon sx={{ fontSize: 14, color: '#757575' }} />
                        <Typography variant="caption">
                          {cotizacion.DIAS || 0}d / {cotizacion.LEADTIME || 0}d
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(cotizacion)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        
                        {cotizacion.STATUS === "PENDIENTE" && (
                          <>
                            <IconButton
                              size="small"
                              color="primary"
                              title="Editar"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            
                            <IconButton
                              size="small"
                              color="error"
                              title="Eliminar"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de detalles */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCotizacion && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon />
                Detalles de Cotización
              </Box>
              <Chip
                icon={getStatusIcon(selectedCotizacion.STATUS)}
                label={selectedCotizacion.STATUS}
                color={getStatusColor(selectedCotizacion.STATUS)}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
              {/* Información general */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      INFORMACIÓN GENERAL
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Folio:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selectedCotizacion.FOLIO}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Proveedor:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selectedCotizacion.PROVEEDOR_NOMBRE}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Fecha creación:</Typography>
                        <Typography variant="body2">
                          {formatDate(selectedCotizacion.FECHA_CREACION)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      DATOS DE TIEMPO Y MONTO
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Días analizados:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selectedCotizacion.DIAS || 0} días
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Lead Time:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selectedCotizacion.LEADTIME || 0} días
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          {formatCurrency(selectedCotizacion.TOTAL)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Items de la cotización */}
              <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                📦 Items de la Cotización ({selectedCotizacion.ITEMS?.length || 0})
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="center">Cantidad</TableCell>
                      <TableCell align="right">Costo Original</TableCell>
                      <TableCell align="right">Costo Nuevo</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCotizacion.ITEMS?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.CODIGO}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {item.DESCRIPCION}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Chip label={item.CANTIDAD_COTIZADA} size="small" />
                        </TableCell>
                        
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#757575' }}>
                            {formatCurrency(item.COSTO)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            {formatCurrency(item.COSTO_NUEVO)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {item.MODELO || 'N/A'}
                          </Typography>
                        </TableCell>
                        
                        
                        <TableCell align="center">
                          
                         <IconButton
  size="small"
  onClick={() => handleInitChangeProveedor(item, selectedCotizacion)}
  title="Cambiar proveedor"
  disabled={!selectedCotizacion || selectedCotizacion.STATUS !== "PENDIENTE"}
>
  <SwapHorizIcon fontSize="small" />
</IconButton>

                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Observaciones */}
              {selectedCotizacion.OBSERVACIONES && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    📝 Observaciones
                  </Typography>
                  <Typography variant="body2">
                    {selectedCotizacion.OBSERVACIONES}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowDetailDialog(false)}>
                Cerrar
              </Button>
              
              {selectedCotizacion.STATUS === "PENDIENTE" && (
                <>
                  <Button color="primary" variant="outlined">
                    Aprobar
                  </Button>
                  <Button color="error" variant="outlined">
                    Rechazar
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Diálogo para cambiar proveedor */}
      <Dialog
        open={showChangeProveedorDialog}
        onClose={() => setShowChangeProveedorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'warning.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SwapHorizIcon />
          Cambiar Proveedor
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          
          {itemToChange && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Estás por cambiar el proveedor para el producto:<br />
                  <strong>{itemToChange.DESCRIPCION}</strong> ({itemToChange.CODIGO})
                </Typography>
              </Alert>
              
              <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  PROVEEDOR ACTUAL
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {itemToChange.proveedorActualNombre}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Modelo: {itemToChange.MODELO || 'N/A'}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="textSecondary">
                    {formatCurrency(itemToChange.COSTO)}
                  </Typography>
                </Box>
              </Box>
              
              {loadingProveedores[itemToChange?.CODIGO]  ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Cargando proveedores alternativos...</Typography>
                </Box>
              ) : availableProveedores.length === 0 ? (
                <Alert severity="warning">
                  No se encontraron proveedores alternativos para este producto.
                </Alert>
              ) : (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                    PROVEEDORES ALTERNATIVOS DISPONIBLES
                  </Typography>
                  
                  <FormControl fullWidth>
                    <InputLabel>Selecciona nuevo proveedor</InputLabel>
                    <Select
                      value={newProveedor}
                      onChange={(e) => setNewProveedor(e.target.value)}
                      label="Selecciona nuevo proveedor"
                    >
                      {availableProveedores.map((proveedor) => (
                        <MenuItem key={proveedor.PROVEEDOR_ID} value={proveedor.PROVEEDOR_ID}>
                          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body1">
                                {proveedor.NOMBRE}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Modelo: {proveedor.MODELO || 'N/A'} | Stock: {proveedor.UNITS || 0}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: proveedor.COST < itemToChange.COSTO_NUEVO ? '#4caf50' : '#ff9800'
                              }}
                            >
                              {formatCurrency(proveedor.COST)}
                              {proveedor.COST < itemToChange.COSTO_NUEVO && (
                                <Typography variant="caption" color="#4caf50" sx={{ ml: 1 }}>
                                  (Ahorro: {formatCurrency(itemToChange.COSTO_NUEVO - proveedor.COST)})
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
  label="Cantidad a cancelar"
  type="number"
  fullWidth
  value={cantidadCancelar}
  onChange={(e) => setCantidadCancelar(Number(e.target.value))}
  inputProps={{
    min: 1,
    max: itemToChange?.CANTIDAD_COTIZADA
  }}
  sx={{ mt: 2 }}
  helperText={`Debe ser entre 1 y ${itemToChange?.CANTIDAD_COTIZADA}`}
/>

                  {newProveedor && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        RESUMEN DEL CAMBIO
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2">
                            Proveedor seleccionado: {availableProveedores.find(p => p.PROVEEDOR_ID === parseInt(newProveedor))?.NOMBRE}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Cantidad: {itemToChange.CANTIDAD_COTIZADA} unidades
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">
                            Total actual: {formatCurrency(itemToChange.COSTO * itemToChange.CANTIDAD_COTIZADA)}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            Nuevo total: {formatCurrency(
                              (availableProveedores.find(p => Number(p.PROVEEDOR_ID) === Number(newProveedor))?.COST || 0) * 
                              itemToChange.CANTIDAD_COTIZADA
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}


                </>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowChangeProveedorDialog(false)}>
            Cancelar
          </Button>
          
          {availableProveedores.length > 0 && newProveedor && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleChangeProveedor}
            >
              Confirmar Cambio
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CotizacionesListPage;