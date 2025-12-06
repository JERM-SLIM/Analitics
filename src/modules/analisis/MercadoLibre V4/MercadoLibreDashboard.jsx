// MercadoLibreDashboard.jsx - VERSIÓN COMPLETA CON CHECKOUT
import React, { useState } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import Filters from "./components/Filters";
import Kpis from "./components/Kpis";
import TopCharts from "./components/TopCharts";
import OrdersCards from "./components/OrdersCards";
import ProductDrawer from "./components/ProductDrawer";
import useOrdersData from "./hooks/useOrdersData";
import EnhancedKpis from "./components/EnhancedKpis";
import CartSummary from "./components/CartSummary";
import FloatingCartButton from "./components/FloatingCartButton";
import CheckoutPage from "./components/CheckoutPage";

function MercadoLibreDashboard() {
  const {
    // stores,
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
    margenMin,
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
    // Nuevos estados del carrito (necesitas agregarlos en useOrdersData.js)
    cart,
    toggleCartItem,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotals,
      proveedoresPorCodigo,
  loadingProveedores,
  fetchProveedores,
    selectedProveedores,
  setSelectedProveedores,
  } = useOrdersData();

  // Estado para controlar qué vista mostrar
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Si estamos en modo checkout, mostrar la página de resumen
  if (showCheckout) {
    return (
      <CheckoutPage 
        cart={cart}
        cartTotals={cartTotals}
        onBack={() => setShowCheckout(false)}
          // AÑADE ESTAS PROPS:
      selectedProveedores={selectedProveedores}
      proveedoresPorCodigo={proveedoresPorCodigo}
      />
    );
  }

  // Modo dashboard normal
  return (
    <Box sx={{ 
      padding: 2, 
      background: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)", 
      minHeight: "100vh",
      position: 'relative'
    }}>
      
      {/* Título principal */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: "#fff" }}>
          Mercado Libre - Análisis de Ventas y Productos
        </Typography>
        
        {/* Botón para ir al checkout si hay productos en el carrito */}
        {cart.length > 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowCheckout(true)}
            sx={{
              background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #43a047 30%, #5cb860 90%)'
              }
            }}
          >
            🛒 Ver Resumen ({cart.length})
          </Button>
        )}
      </Box>  
      
      {/* ✅ PASAR TODOS LOS FILTROS AL COMPONENTE FILTERS */}
      <Filters
        loading={loading}
        // stores={stores}
        // selectedStore={selectedStore}
        // setSelectedStore={setSelectedStore}
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

      {/* Botones de exportación */}
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

      {/* Tarjetas de productos */}
      <OrdersCards
        visibleRows={visibleRows}
        page={page}
        setPage={setPage}
        pageCount={pageCount}
        setSelectedRow={setSelectedRow}
        setDrawerOpen={setDrawerOpen}
        cart={cart}
        toggleCartItem={toggleCartItem}
        cartTotals={cartTotals}
        proveedoresPorCodigo={proveedoresPorCodigo}
        loadingProveedores={loadingProveedores}
        fetchProveedores={fetchProveedores}
          selectedProveedores={selectedProveedores}
          setSelectedProveedores={setSelectedProveedores}
      />

      {/* Drawer de detalles del producto */}
      <ProductDrawer
        selectedRow={selectedRow}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      {/* Drawer del carrito */}
      <CartSummary
        cart={cart}
        open={showCart}
        onClose={() => setShowCart(false)}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        cartTotals={cartTotals}
        onCheckout={() => {
          setShowCheckout(true);
          setShowCart(false);
        }}
        proveedoresPorCodigo={proveedoresPorCodigo}
        loadingProveedores={loadingProveedores}
        selectedProveedores={selectedProveedores}
        setSelectedProveedores={setSelectedProveedores}
      />

      {/* Botón flotante del carrito */}
      <FloatingCartButton 
        cart={cart} 
        onClick={() => setShowCart(true)} 
      />

    </Box>
  );
}

export default MercadoLibreDashboard;