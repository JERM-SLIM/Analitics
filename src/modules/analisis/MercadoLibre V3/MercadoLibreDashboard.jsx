// MercadoLibreDashboard.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import Filters from "./components/Filters";
import Kpis from "./components/Kpis";
import TopCharts from "./components/TopCharts";
import OrdersCards from "./components/OrdersCards";
import ProductDrawer from "./components/ProductDrawer";
import useOrdersData from "./hooks/useOrdersData";
import EnhancedKpis from "./components/EnhancedKpis";

function MercadoLibreDashboard() {
  const {
    stores,
    items,
    loading,
    fetchData,
    topVentas,
    topUtilidad,
    totalVendidos,
    totalUtilidad,
    totalUtilidadSinCostos,
    ticketPromedio,
    precioPromedio,
    margenPromedio,
    selectedStore,
    setSelectedStore,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    page,
    setPage,
    pageSize,
    setPageSize,
    visibleRows,
    pageCount,
    selectedRow,
    setSelectedRow,
    drawerOpen,
    setDrawerOpen,
    exportPageToExcel,
    exportAllToExcel,
    exportItemsWithTotalsToExcel,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    // ✅ NUEVOS FILTROS QUE FALTABAN
    statusFilter,
    setStatusFilter,
    titleFilter,
    setTitleFilter,margenMin,
setMargenMin,
margenMax,
setMargenMax,
roiMin,
setRoiMin,
roiMax,
setRoiMax,
stockRiskFilter,
setStockRiskFilter,
abcFilter,
setAbcFilter,
onlyWithStockRisk,
setOnlyWithStockRisk,
onlyVariablePrice,
setOnlyVariablePrice,
  } = useOrdersData();

  return (
    <Box sx={{ padding: 2, background: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" sx={{ color: "#fff", mb: 3 }}>
        Mercado Libre - Análisis de Pedidos V3
      </Typography>

      {/* ✅ PASAR TODOS LOS FILTROS AL COMPONENTE FILTERS */}
<Filters
  loading={loading}
  stores={stores}
  selectedStore={selectedStore}
  setSelectedStore={setSelectedStore}
  fromDate={fromDate}
  setFromDate={setFromDate}
  toDate={toDate}
  setToDate={setToDate}
  fetchData={fetchData}
  setPage={setPage}
  sortBy={sortBy}
  setSortBy={setSortBy}
  sortOrder={sortOrder}
  setSortOrder={setSortOrder}

  // Filtros básicos
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
  titleFilter={titleFilter}
  setTitleFilter={setTitleFilter}

  // 🔥 Filtros avanzados
  margenMin={margenMin}
  setMargenMin={setMargenMin}
  margenMax={margenMax}
  setMargenMax={setMargenMax}

  roiMin={roiMin}
  setRoiMin={setRoiMin}
  roiMax={roiMax}
  setRoiMax={setRoiMax}

  stockRiskFilter={stockRiskFilter}
  setStockRiskFilter={setStockRiskFilter}

  abcFilter={abcFilter}
  setAbcFilter={setAbcFilter}

  onlyWithStockRisk={onlyWithStockRisk}
  setOnlyWithStockRisk={setOnlyWithStockRisk}

  onlyVariablePrice={onlyVariablePrice}
  setOnlyVariablePrice={setOnlyVariablePrice}
/>


      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, gap: 1 }}>
        <Button variant="contained" color="success" onClick={exportPageToExcel}>
          Descargar Página Actual
        </Button>
        <Button variant="contained" color="primary" onClick={exportAllToExcel}>
          Descargar Todas las Páginas
        </Button>
        <Button variant="contained" color="primary" onClick={exportItemsWithTotalsToExcel}>
          Descargar Resumen Totales
        </Button>
      </Box>

    <OrdersCards
  visibleRows={visibleRows}
  page={page}
  setPage={setPage}
  pageCount={pageCount}
  setSelectedRow={setSelectedRow}
  setDrawerOpen={setDrawerOpen}
/>


      <ProductDrawer
        selectedRow={selectedRow}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </Box>
  );
}

export default MercadoLibreDashboard;