// MercadoLibreDashboard.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material"; // Agregar esta importación

import Filters from "./components/Filters";
import Kpis from "./components/Kpis";
import TopCharts from "./components/TopCharts";
import OrdersTable from "./components/OrdersTable";
import ProductDrawer from "./components/ProductDrawer";
import useOrdersData from "./hooks/useOrdersData";
import SelectedProductsPage from "./components/SelectedProductsPage";
import PurchaseDrawer from "./components/PurchaseDrawer";
import PurchaseCart from "./components/PurchaseCart";

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
    statusFilter,
    setStatusFilter,
    titleFilter,
    setTitleFilter,
    // 🔹 NUEVOS ESTADOS Y FUNCIONES
    selectedProducts,
    setSelectedProducts,
    purchaseOrders,
    addToPurchaseCart,
    removeFromPurchaseCart,
    updateProductQuantity,
    updateProductSupplier, // Nueva función
    createPurchaseOrder,
    clearCart, // Nueva función
  } = useOrdersData();

  // Estados locales
  const [drawerPurchaseOpen, setDrawerPurchaseOpen] = React.useState(false);
  const [drawerProduct, setDrawerProduct] = React.useState(null);
  const [view, setView] = React.useState("main");

  const handleOpenPurchaseDrawer = (product) => {
    setDrawerProduct(product);
    setDrawerPurchaseOpen(true);
  };
  
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
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        titleFilter={titleFilter}
        setTitleFilter={setTitleFilter}
      />

     {/* Botón para ver carrito */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Button
          variant="contained"
          color="warning"
          onClick={() => setView("selected-products")}
          startIcon={<ShoppingCartIcon />}
          sx={{ 
            position: 'relative',
            '&::after': selectedProducts.length > 0 ? {
              content: `"${selectedProducts.length}"`,
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } : {}
          }}
        >
          Ver Carrito ({selectedProducts.length})
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="success" onClick={exportPageToExcel}>
            Descargar Página Actual
          </Button>
          <Button variant="contained" color="primary" onClick={exportAllToExcel}>
            Descargar Todas las Páginas
          </Button>
        </Box>
      </Box>

      {view === "main" && (
        <>
          {/* 🔹 MOSTRAR CARRITO DE COMPRAS */}
          {selectedProducts.length > 0 && (
            <PurchaseCart
              selectedProducts={selectedProducts}
              onRemoveProduct={removeFromPurchaseCart}
              onUpdateQuantity={updateProductQuantity}
              onCreateOrder={createPurchaseOrder}
            />
          )}

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
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
          />

          <ProductDrawer
            selectedRow={selectedRow}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        </>
      )}

      {view === "selected-products" && (
        <SelectedProductsPage
          items={items}
          selectedProducts={selectedProducts}
          onOpenDrawer={handleOpenPurchaseDrawer}
        />
      )}

      <PurchaseDrawer
        open={drawerPurchaseOpen}
        onClose={() => setDrawerPurchaseOpen(false)}
        product={drawerProduct}
      />
    </Box>
  );
}

export default MercadoLibreDashboard;