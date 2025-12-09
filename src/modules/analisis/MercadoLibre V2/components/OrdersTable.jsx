// OrdersTable.jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Button,
  Tooltip,
  Grid,
  IconButton,
  Chip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";

const OrdersTable = ({
  items,
  page,
  setPage,
  pageSize,
  setPageSize,
  visibleRows,
  pageCount,
  setSelectedRow,
  setDrawerOpen,
  cart, // 🔹 Recibir el carrito
  toggleCartItem, // 🔹 Recibir función para agregar/quitar del carrito
  cartTotals,
  proveedoresPorCodigo,
  loadingProveedores,
  fetchProveedores,
  selectedProveedores,
  setSelectedProveedores,
}) => {
  
  const formatCurrency = (v) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(v ?? 0));

  const rowsPerPageOptions = [10, 25, 50, 100];

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(0);
  };

  const handlePageChange = (event, value) => setPage(value - 1);

  // Verificar si un producto está en el carrito
  const isInCart = (codigo) => {
    return cart && cart.some(item => item.codigo === codigo);
  };

  // Tooltip de stock detallado
  const StockTooltipContent = ({ row }) => (
    <Box sx={{ p: 1, maxWidth: 220 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
      >
        Stock Detallado
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="body2">Ful.Disponible (ml):</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {row.stock_disponible || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">Ful. tránsito (ml):</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {row.stock_en_transito || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">En camino a Ful:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {row.stock_encamino || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">CH a MX:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {row.stock_a_cedis || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">CALIDAD:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {row.stock_calidad || 0}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">RECIBO:</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {row.stock_recibo || 0}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const columns = [
    { field: "registro", headerName: "#", width: 60 },
    {
      field: "id",
      headerName: "CODIGO",
      flex: 1.5,
      renderCell: (params) => {
        const status = params.row.STATUS_PUBLICACION;
        let color = "red";
        let label = "Desconocido";

        if (status === "active") {
          color = "green";
          label = "Publicación activa";
        } else if (status === "paused") {
          color = "goldenrod";
          label = "Publicación pausada";
        } else {
          color = "red";
          label = "Publicación finalizada";
        }

        return (
          <Tooltip title={label} arrow>
            <span style={{ color, fontWeight: "bold", cursor: "help" }}>
              {params.value}
            </span>
          </Tooltip>
        );
      },
    },
    { field: "titulo", headerName: "Título", flex: 3 },
    {
      field: "precio_promedio_efectivo",
      headerName: "Precio Unit.",
      flex: 0,
      type: "number",
      renderCell: (params) => {
        const color = params.row.hubo_variacion_precio ? "#9c1818ff" : "#";
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              bgcolor: color,
              px: 2,
            }}
          >
            ${params.value.toFixed(2)}
          </Box>
        );
      },
    },
    { field: "utilidad", headerName: "Utilidad Neta", flex: 2, type: "number" },
    { field: "vendidos", headerName: "Vendidos", flex: 1, type: "number" },
    {
      field: "stock_total",
      headerName: "Stock",
      flex: 0,
      type: "number",
      renderCell: (params) => {
        const row = params.row;
        return (
          <Tooltip
            title={<StockTooltipContent row={row} />}
            arrow
            placement="top"
            enterDelay={300}
          >
            <span style={{ cursor: "help", fontWeight: "bold" }}>
              {params.value}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 180,
      renderCell: (params) => {
        const enCarrito = isInCart(params.row.codigo);
        const cantidadEnCarrito = cart.find(item => item.codigo === params.row.codigo)?.cartQuantity || 0;
        
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={enCarrito ? "Quitar del carrito" : "Agregar al carrito"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCartItem(params.row);
                }}
                sx={{
                  backgroundColor: enCarrito ? "#4caf50" : "transparent",
                  color: enCarrito ? "#fff" : "#4caf50",
                  border: enCarrito ? "none" : "1px solid #4caf50",
                  '&:hover': {
                    backgroundColor: enCarrito ? "#388e3c" : "rgba(76, 175, 80, 0.1)"
                  }
                }}
              >
                <ShoppingCartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedRow(params.row);
                setDrawerOpen(true);
              }}
            >
              Ver Detalle
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Card sx={{ backgroundColor: "#1e2a38" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#fff" }}>
            📄 Lista de publicaciones
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip 
              label={`${cart.length} en carrito`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
            <Typography variant="body2" sx={{ color: "#90caf9" }}>
              Total: {formatCurrency(cartTotals?.totalValue || 0)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: "#fff" }}>Filas</InputLabel>
              <Select
                value={pageSize}
                label="Filas"
                onChange={handlePageSizeChange}
                sx={{ backgroundColor: "#263238", color: "#fff" }}
              >
                {rowsPerPageOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography sx={{ color: "#fff" }}>
              Mostrando{" "}
              {items.length
                ? Math.min(pageSize, items.length - page * pageSize)
                : 0}{" "}
              de {items.length} registros
            </Typography>
          </Box>

          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            sx={{ bgcolor: "#263238", borderRadius: 1, px: 1 }}
          />
        </Box>

        {/* === TABLA PRINCIPAL === */}
        <DataGrid
          rows={visibleRows}
          columns={columns}
          autoHeight={false}
          density="compact"
          rowHeight={48}
          headerHeight={56}
          disableRowSelectionOnClick
          hideFooter
          sx={{
            height: 500,
            backgroundColor: "#263238",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1c2b36",
              color: "#000000ff",
              fontWeight: "bold",
              position: "sticky",
              top: 0,
              zIndex: 2,
            },
            "& .MuiDataGrid-cell": { 
              color: "#fff", 
              py: 0.5,
              display: "flex",
              alignItems: "center"
            },
            "& .MuiDataGrid-row": { 
              cursor: "pointer",
              '&:hover': {
                backgroundColor: "rgba(255, 255, 255, 0.05)"
              }
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default OrdersTable;