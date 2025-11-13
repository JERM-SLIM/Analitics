// Filters.jsx - versión final
import React from "react";
import {
  Grid,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel
} from "@mui/material";

const Filters = ({
  loading,
  stores,
  selectedStore,
  setSelectedStore,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  fetchData,
  setPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  return (
    <>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={32} />
          <Typography sx={{ ml: 1, color: "#fff" }}>Buscando datos...</Typography>
        </Box>
      )}

      <Grid container spacing={2} sx={{ mb: 3, justifyContent: "center" }}>
        {/* Selección de tienda */}
        <Grid item xs={12} sm={2}>
          <Select
            value={selectedStore || "all"}
            onChange={(e) => {
              setSelectedStore(e.target.value);
              setPage(0);
            }}
            fullWidth
            sx={{ backgroundColor: "#263238", color: "#fff" }}
          >
            <MenuItem value="all">Todas las tiendas</MenuItem>
            {stores.map((s) => (
              <MenuItem key={s.seller_id} value={s.seller_id?.toString() || ""}>
                {s.nickname}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Fechas */}
        <Grid item xs={12} sm={1.5}>
          <TextField
            type="date"
            label="Desde"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: "#fff" } }}
            sx={{ input: { color: "#fff" }, backgroundColor: "#263238" }}
          />
        </Grid>

        <Grid item xs={12} sm={1.5}>
          <TextField
            type="date"
            label="Hasta"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: "#fff" } }}
            sx={{ input: { color: "#fff" }, backgroundColor: "#263238" }}
          />
        </Grid>

     {/* Filtro de ordenamiento */}
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth sx={{ backgroundColor: "#263238" }}>
          <InputLabel sx={{ color: "#fff" }}>Ordenar por</InputLabel>
          <Select
            value={sortBy || "unidades"} // Valor por defecto
            onChange={(e) => {
              console.log("🔄 Cambiando sortBy a:", e.target.value);
              setSortBy(e.target.value);
              setPage(0);
            }}
            sx={{ color: "#fff" }}
          >
            <MenuItem value="monto">Monto de venta total</MenuItem>
            <MenuItem value="utilidad">Utilidad</MenuItem>
            <MenuItem value="unidades">Unidades vendidas</MenuItem>
          </Select>
        </FormControl>
      </Grid>

    {/* Dirección de orden */}
    <Grid item xs={12} sm={2}>
      <FormControl fullWidth sx={{ backgroundColor: "#263238" }}>
        <InputLabel sx={{ color: "#fff" }}>Orden</InputLabel>
        <Select
          value={sortOrder || "desc"} // Valor por defecto
          onChange={(e) => {
            console.log("🔄 Cambiando sortOrder a:", e.target.value);
            setSortOrder(e.target.value);
            setPage(0);
          }}
          sx={{ color: "#fff" }}
        >
          <MenuItem value="desc">Descendente</MenuItem>
          <MenuItem value="asc">Ascendente</MenuItem>
        </Select>
      </FormControl>
    </Grid>
        {/* Botón buscar */}
        <Grid item xs={12} sm={2} display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={fetchData}
            sx={{ height: "56px", width: "100%" }}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default Filters;