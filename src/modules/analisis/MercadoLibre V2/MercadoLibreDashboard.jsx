// MercadoLibreDashboard.jsx
import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";

import Filters from "./components/Filters";
import Kpis from "./components/Kpis";
import TopCharts from "./components/TopCharts";
import OrdersTable from "./components/OrdersTable";
import ProductDrawer from "./components/ProductDrawer";
import useOrdersData from "./hooks/useOrdersData";
import SelectedProductsPage from "./components/SelectedProductsPage";
import PurchaseDrawer from "./components/PurchaseDrawer";
import PurchaseCart from "./components/PurchaseCart";
import CartSummary from "./components/CartSummary";
import FloatingCartButton from "./components/FloatingCartButton";
import CheckoutPage from "./components/CheckoutPage";
import CotizacionesListPage from "./components/Cotizaciones/CotizacionesListPage"; // 🆕 NUEVO COMPONENTE

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
    
    // 🆕 AGREGAR TODOS LOS NUEVOS FILTROS
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
    
    selectedProducts,
    setSelectedProducts,
    purchaseOrders,
    addToPurchaseCart,
    removeFromPurchaseCart,
    updateProductQuantity,
    updateProductSupplier,
    createPurchaseOrder,
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

  // Estados locales
  const [drawerPurchaseOpen, setDrawerPurchaseOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [view, setView] = useState("main");

  // Estado para controlar qué vista mostrar
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const [showCotizaciones, setShowCotizaciones] = useState(false); 
  
  
      // Si estamos en modo cotizaciones, mostrar la página de administración
    if (showCotizaciones) {
      return (
        <CotizacionesListPage 
          onBack={() => setShowCotizaciones(false)}
          proveedoresPorCodigo={proveedoresPorCodigo}
        />
      );
    }
  

  // Si estamos en modo checkout, mostrar la página de resumen
  if (showCheckout) {
    return (
      <CheckoutPage 
        cart={cart || []}
        cartTotals={cartTotals}
        onBack={() => setShowCheckout(false)}
        selectedProveedores={selectedProveedores}
        proveedoresPorCodigo={proveedoresPorCodigo}
        fromDate={fromDate}
        toDate={toDate}
      />
    );
  }

  const handleOpenPurchaseDrawer = (product) => {
    setDrawerProduct(product);
    setDrawerPurchaseOpen(true);
  };

  // Variables seguras para evitar undefined
  const safeSelectedProducts = selectedProducts || [];
  const safeSelectedProductsCount = safeSelectedProducts.length;
  const safeCart = cart || [];
  
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
        
        // 🆕 PASAR LOS NUEVOS FILTROS AL COMPONENTE FILTERS
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

      {/* Botón para ver carrito */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* 🆕 BOTÓN PARA VER COTIZACIONES */}
                   <Button
                     variant="outlined"
                     onClick={() => setShowCotizaciones(true)}
                     sx={{
                       color: '#fff',
                       borderColor: '#fff',
                       '&:hover': {
                         borderColor: '#42a5f5',
                         backgroundColor: 'rgba(66, 165, 245, 0.1)'
                       }
                     }}
                   >
                    Ver Cotizaciones
                   </Button>
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
          {safeSelectedProductsCount > 0 && (
            <PurchaseCart
              selectedProducts={safeSelectedProducts}
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
            cart={safeCart}
            toggleCartItem={toggleCartItem}
            cartTotals={cartTotals}
            proveedoresPorCodigo={proveedoresPorCodigo}
            loadingProveedores={loadingProveedores}
            fetchProveedores={fetchProveedores}
            selectedProveedores={selectedProveedores}
            setSelectedProveedores={setSelectedProveedores}
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
          selectedProducts={safeSelectedProducts}
          onOpenDrawer={handleOpenPurchaseDrawer}
        />
      )}

      {/* Drawer del carrito */}
      <CartSummary
        cart={safeCart}
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
        cart={safeCart} 
        onClick={() => setShowCart(true)} 
      />
    </Box>
  );
}

export default MercadoLibreDashboard;