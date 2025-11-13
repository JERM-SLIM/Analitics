// MercadoLibreDashboard.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import Filters from "./components/Filters";
import Kpis from "./components/Kpis";
import TopCharts from "./components/TopCharts";
import OrdersTable from "./components/OrdersTable";
import ProductDrawer from "./components/ProductDrawer";
import useOrdersData from "./hooks/useOrdersData";

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
    setSortOrder
  } = useOrdersData();

  return (
    <Box sx={{ padding: 2, background: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" sx={{ color: "#fff", mb: 3 }}>
        Dashboard Mercado Libre
      </Typography>

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
      // ESTOS SON LOS IMPORTANTES PARA LOS FILTROS:
      sortBy={sortBy}
      setSortBy={setSortBy}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
    />

    {/* <Kpis
        topVentas={topVentas}
        topUtilidad={topUtilidad}
        totalVendidos={totalVendidos}
        totalUtilidad={totalUtilidad}
        totalUtilidadSinCostos={totalUtilidadSinCostos}
        ticketPromedio={ticketPromedio}
        precioPromedio={precioPromedio}
        margenPromedio={margenPromedio}
      /> */}

      {/* <TopCharts topVentas={topVentas} topUtilidad={topUtilidad} /> */}

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

      <OrdersTable
        items={items}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        visibleRows={visibleRows}
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