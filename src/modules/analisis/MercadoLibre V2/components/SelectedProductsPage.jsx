import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function SelectedProductsPage({ items, selectedProducts, onOpenDrawer }) {
  const productosSeleccionados = items.filter((i) =>
    selectedProducts.includes(i.ID)
  );

  const columns = [
    { field: "CODIGO", headerName: "Código", flex: 1 },
    { field: "TITLE", headerName: "Título", flex: 2 },
    { field: "PRICE", headerName: "Precio Venta", flex: 1 },
    { field: "COSTO", headerName: "Costo", flex: 1 },
    { field: "STOCK", headerName: "Stock", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => onOpenDrawer(params.row)}
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Card sx={{ background: "#1e272e", color: "white" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🛒 Productos Seleccionados para Compra
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Total seleccionados: <b>{productosSeleccionados.length}</b>
          </Typography>

          <Divider sx={{ my: 2, borderColor: "#ffffff3b" }} />

          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={productosSeleccionados}
              columns={columns}
              getRowId={(row) => row.ID}
              rowHeight={45}
              sx={{
                background: "#263238",
                color: "white",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1c2b36",
                },
                "& .MuiDataGrid-cell": {
                  color: "white",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
