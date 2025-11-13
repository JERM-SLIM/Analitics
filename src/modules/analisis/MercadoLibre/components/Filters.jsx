import React from "react";
import {
  Grid,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography
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
  setPage
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