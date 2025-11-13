// analisis/Analitics/src/modules/analisis/MercadoLibre V3/components/OrdersTable.jsx
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
  Button,Tooltip 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const OrdersTable = ({
  items,
  page,
  setPage,
  pageSize,
  setPageSize,
  visibleRows,
  pageCount,
  setSelectedRow,
  setDrawerOpen
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

  const columns = [
    { field: "registro", headerName: "#", width: 60 },{
  field: "itemId",
  headerName: "ID",
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
    } else{
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
    { field: "titulo", headerName: "Título", flex: 4 },
    {
      field: "precio_unitario",
      headerName: "Precio Unit.",
      flex: 0,
      type: "number",
      renderCell: (params) => {
        const color = params.row.precio_variable ? "#9c1818ff" : "#";
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
    { field: "costo_unitario", headerName: "Costo Unit.", flex: 1, type: "number" },
    { field: "vendidos", headerName: "Vendidos", flex: 0, type: "number" },
    { field: "fulfillment", headerName: "Fulfillment", flex: 0, type: "number" },
    {
      field: "comision_unitaria",
      headerName: "Comisión U.",
      flex: 1,
      type: "number",
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 2,
          }}
        >
          {formatCurrency(params.value)}
        </Box>
      ),
    },
    {
      field: "costoEnvio_unitario",
      headerName: "Envío U.",
      flex: 1,
      type: "number",
      renderCell: (params) => (
        <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", px: 2 }}>
          {formatCurrency(params.value)}
        </Box>
      )
    },
    { field: "costoPublicidad_unitario", headerName: "Publicidad U.", flex: 1, type: "number" },
    { field: "precio", headerName: "Precio T.", flex: 0, type: "number" },
    { field: "utilidad", headerName: "Utilidad T.", flex: 0, type: "number" },
    {
      field: "acciones",
      headerName: "Detalles",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setSelectedRow(params.row);
            setDrawerOpen(true);
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Card sx={{ backgroundColor: "#1e2a38" }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>📄 Lista de publicaciones</Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: "#fff" }}>Filas</InputLabel>
              <Select value={pageSize} label="Filas" onChange={handlePageSizeChange} sx={{ backgroundColor: "#263238", color: "#fff" }}>
                {rowsPerPageOptions.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <Typography sx={{ color: "#fff" }}>
              Mostrando {items.length ? Math.min(pageSize, items.length - page * pageSize) : 0} de {items.length} registros
            </Typography>
          </Box>

          <Pagination count={pageCount} page={page + 1} onChange={handlePageChange} color="primary" showFirstButton showLastButton sx={{ bgcolor: "#263238", borderRadius: 1, px: 1 }} />
        </Box>

        <DataGrid
          rows={visibleRows}
          columns={columns}
          autoHeight={false}
          density="compact"
          rowHeight={48}
          headerHeight={56}
          disableSelectionOnClick
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
            "& .MuiDataGrid-cell": { color: "#fff", py: 0.5 },
            "& .MuiDataGrid-row": { cursor: "pointer" },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default OrdersTable;