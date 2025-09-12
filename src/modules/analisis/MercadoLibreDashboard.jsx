import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Select,
  MenuItem,
  Tooltip,
  TextField,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function MercadoLibreDashboard() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("97892065");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const abortControllerRef = useRef(null);
  const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(50);

  // --- Obtener tiendas ---
  const fetchStores = async () => {
    try {
      const res = await axios.get("https://diler.com.mx:9092/seller/access", {
        headers: {
          Token: "v1qDm0ZuIEKFDIm/SNYKeg==",
          Accept: "application/json",
        },
      });
      setStores(res.data.result || []);
    } catch (err) {
      console.error("Error cargando tiendas:", err);
    }
  };

  // --- Traer datos de órdenes ---
  const fetchData = async () => {
    if (!stores.length || !selectedStore || !fromDate || !toDate) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const selectedStoresArr = stores.filter(
        (s) => s.seller_id?.toString() === selectedStore
      );

      if (!selectedStoresArr.length) {
        setItems([]);
        setLoading(false);
        return;
      }

      let summaryMap = {};

      for (const store of selectedStoresArr) {
  const res = await axios.get("https://diler.com.mx:9092/orders/search", {
    params: {
      seller: store.seller_id,
      inicio: `${fromDate} 00:00:00.000-06:00`,
      fin: `${toDate} 23:59:59.000-06:00`,
    },
    headers: {
      Token: "v1qDm0ZuIEKFDIm/SNYKeg==",
      Accept: "application/json",
    },
    signal: abortControllerRef.current.signal,
  });

  for (const item of res.data.result || []) {
    const itemId = item.ITEM_ID;
    const variante_id = item.VARIATION_ID || 0;
    const orderId = item.ID;
    const key = `${itemId}_${variante_id}`; // agrupar por item + variante
    const orderKey = orderId; // track por orden para no duplicar costos
        const orderKey2 = `${orderId}_${key}`; // track por orden para no duplicar costos

  const fechaDia = item.date_ads;
  const adsKey = `${key}_${fechaDia}`; // track por item+variante+día para ads

    const vendidos = item.QUANTITY || 0;
    const costo = item.COSTO_ULTIMA_COMPRA || 0;
    const comision = item.SALE_FEE || 0;
    const costoEnvio = item.SHIPPING_COST || 0;
    const costoPublicidad = item.COSTO_ADS || 0;
    const precio = item.UNIT_PRICE || 0;
    const total = item.TOTAL || 0;


    if (!summaryMap[key]) {
      summaryMap[key] = {
        id: key,
        itemId: itemId,
        variante_id: variante_id,
        store: store.nickname,
        titulo: item.TITLE,
        vendidos: 0,
        totalCosto: 0,
        costo_unitario: costo,
        totalComision: 0,
        comision_unitaria: comision,
        totalCostoEnvio: 0,
        costoEnvio_unitario: costoEnvio,
        totalCostoPublicidad: 0,
        costoPublicidad_unitario: costoPublicidad,
        precio_total: 0,
        precio_unitario: precio,
        
        transfer: item.TRANSFER || 0,
        fulfillment: item.FULFILLMENT || 0,
        onTheWay: item.ON_THE_WAY || 0,
        itemsOrdenesContadas: {}, // track de órdenes
        adsPorDiaContados: {},    // track de ads por día

      };
    }

    const record = summaryMap[key];

    // Sumar costos fijos solo una vez por orden
    if (!record.itemsOrdenesContadas[orderKey2]) {
      record.totalComision += comision;
      record.totalCostoEnvio += costoEnvio;
      record.totalCosto += costo;
      record.itemsOrdenesContadas[orderKey2] = true;
          // Sumar cantidades y precio total siempre
    record.vendidos += vendidos;
    record.precio_total += total;
    }

     if (!record.adsPorDiaContados[adsKey]) {
    record.totalCostoPublicidad += costoPublicidad;
    record.adsPorDiaContados[adsKey] = true;
  }


  }
}

      const allItems = Object.values(summaryMap).map((i) => {
        const totalCostos = i.totalCosto + i.totalComision + i.totalCostoEnvio + i.totalCostoPublicidad;
        const utilidad = i.precio_total - totalCostos;
          const utilidad_unitaria = i.vendidos ? utilidad / i.vendidos : 0; // utilidad por unidad


        return {
          id: i.id,
          itemId: i.itemId,
          variante_id: i.variante_id,
          store: i.store,
          titulo: i.titulo,
          vendidos: i.vendidos,
          precio: i.precio_total,
          precio_unitario: i.precio_unitario,
          costo: i.totalCosto,
          costo_unitario: i.costo_unitario,
          comision: i.totalComision,
          comision_unitaria: i.comision_unitaria,
          costo_envio: i.totalCostoEnvio,
          costoEnvio_unitario: i.costoEnvio_unitario,
          costo_publicidad: i.totalCostoPublicidad,
          costoPublicidad_unitario: i.costoPublicidad_unitario,
          total_costos: totalCostos,
          utilidad: utilidad,
          utilidad_unitaria: utilidad_unitaria,
          transfer: i.transfer,
          fulfillment: i.fulfillment,
          on_the_way: i.onTheWay,
          link: `https://articulo.mercadolibre.com.mx/MLM-${i.itemId.substring(3)}`,
        };
      });

      setItems(allItems);
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Error fetchData:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  // --- DataGrid con paginación server ---


// --- Exportar solo la página actual ---
// Exportar solo la página actual
const exportPageToExcel = () => {
  if (!items.length) return;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(pageItems);
  XLSX.utils.book_append_sheet(wb, ws, `Órdenes_Página_${page + 1}`);

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Ordenes_Página_${page + 1}.xlsx`);
};

// Exportar todas las órdenes
const exportAllToExcel = () => {
  if (!items.length) return;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(items);
  XLSX.utils.book_append_sheet(wb, ws, `Órdenes_Totales`);

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Ordenes_Totales_${fromDate}_a_${toDate}.xlsx`);
};


  // --- Efectos ---
  useEffect(() => { fetchStores(); }, []);
  useEffect(() => { if (stores.length) fetchData(); }, [selectedStore, stores, fromDate, toDate]);

  // --- KPIs ---
  const {
    topVentas,
    topUtilidad,
    totalVendidos,
    totalUtilidad,
    ticketPromedio,
    precioPromedio,
    margenPromedio,
  } = useMemo(() => {
    if (!items.length) return {
      topVentas: [], topUtilidad: [], totalVendidos: 0, totalUtilidad: 0,
      ticketPromedio: 0, precioPromedio: 0, margenPromedio: 0,
    };

console.log(items.map(i => ({
  itemId: i.itemId,
  vendidos: i.vendidos,
  precio_total: i.precio,
  totalCosto: i.total_costos,
  utilidad: i.utilidad
})));

    const totalVendidos = items.reduce((acc, i) => acc + i.vendidos, 0);
    const totalUtilidad = items.reduce((acc, i) => acc + parseFloat(i.utilidad), 0);

    const precioPromedio = items.reduce((acc, i) => acc + i.precio, 0) / items.length;
    const ticketPromedio = totalVendidos ? items.reduce((acc, i) => acc + i.precio, 0) / totalVendidos : 0;
    const margenPromedio = totalVendidos ? (totalUtilidad / items.reduce((acc, i) => acc + i.precio, 0)) * 100 : 0;

    const sortedByVentas = [...items].sort((a, b) => b.vendidos - a.vendidos);
    const sortedByUtilidad = [...items].sort((a, b) => b.utilidad - a.utilidad);

    return {
      topVentas: sortedByVentas.slice(0, 10),
      topUtilidad: sortedByUtilidad.slice(0, 10),
      totalVendidos,
      totalUtilidad,
      ticketPromedio,
      precioPromedio,
      margenPromedio,
    };
  }, [items]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress color="inherit" />
    </Box>
  );

  return (
    <Box sx={{ padding: 2, background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", minHeight: "100vh" }}>
      <Typography variant="h3" gutterBottom sx={{ color: "#fff", textAlign: "center", mb: 3 }}>
        Dashboard Mercado Libre
      </Typography>

      {/* Selector de tienda y fechas */}
      <Grid container spacing={2} sx={{ mb: 3, justifyContent: "center" }}>
        <Grid item xs={12} sm={4}>
          <Select
            value={selectedStore || "all"}
            onChange={(e) => setSelectedStore(e.target.value)}
            fullWidth
            sx={{ backgroundColor: "#263238", color: "#fff" }}
          >
            <MenuItem value="all">Todas las tiendas</MenuItem>
            {stores.map((s) => (
              <MenuItem key={s.seller_id} value={s.seller_id?.toString() || ""}>{s.nickname}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={3}>
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
        <Grid item xs={12} sm={3}>
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
      </Grid>

{/* KPIs */}
<Grid container spacing={2} sx={{ mb: 3 }}>
  {[
    { 
      title: "Suma total de unidades vendidas", 
      value: totalVendidos,
      tooltip: "Suma total de unidades vendidas de todos los productos"
    },
    { 
      title: "Utilidad Total", 
      value: `$${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalUtilidad)}`,
      tooltip: "Suma de la utilidad de todos los productos (precio total - costos - comisión - envío - publicidad)"
    },
    { 
      title: "Ticket Promedio", 
      value: `$${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ticketPromedio)}`,
      tooltip: "Promedio de venta por unidad: (total vendido / total unidades)"
    },
    { 
      title: "Precio Promedio", 
      value: `$${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precioPromedio)}`,
      tooltip: "Promedio de precio de todos los productos vendidos"
    },
    { 
      title: "Margen Promedio", 
      value: `${margenPromedio.toFixed(2)}%`,
      tooltip: "Margen promedio = (utilidad total / ventas totales) * 100%"
    },
  ].map((kpi) => (
    <Grid item xs={12} sm={6} md={2} key={kpi.title}>
      <Card sx={{ backgroundColor: "#1e2a38" }}>
        <Tooltip title={kpi.tooltip} arrow>
          <CardContent>
            <Typography sx={{ color: "#cfd8dc" }}>{kpi.title}</Typography>
            <Typography variant="h6" sx={{ color: "#fff" }}>{kpi.value}</Typography>
          </CardContent>
        </Tooltip>
      </Card>
    </Grid>
  ))}
</Grid>


      {/* Top 10 Ventas y Utilidad */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#1e2a38" }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#fff" }}>Top 10 por Ventas</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topVentas}>
                  <XAxis dataKey="titulo" tick={{ fontSize: 12, fill: "#fff" }} />
                  <YAxis tick={{ fill: "#fff" }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Bar dataKey="vendidos" fill="#1976d2" name="Vendidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#1e2a38" }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#fff" }}>Top 10 por Utilidad</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topUtilidad}>
                  <XAxis dataKey="titulo" tick={{ fontSize: 12, fill: "#fff" }} />
                  <YAxis tick={{ fill: "#fff" }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Bar dataKey="utilidad" fill="#388e3c" name="Utilidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, gap: 1 }}>
      <Button variant="contained" color="success" onClick={exportPageToExcel}>
        Descargar Página Actual
      </Button>
      <Button variant="contained" color="primary" onClick={exportAllToExcel}>
        Descargar Todas las Órdenes
      </Button>
    </Box>


      {/* Tabla de items */}
      <Card sx={{ backgroundColor: "#1e2a38" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>📄 Lista completa de publicaciones</Typography>
          <DataGrid
  rows={items}
  columns={[
    { field: "itemId", headerName: "ID", flex: 1 },
    { field: "titulo", headerName: "Título", flex: 2 },
    { field: "precio", headerName: "Precio", flex: 1, type: "number" },
    { field: "precio_unitario", headerName: "Precio Unit.", flex: 1, type: "number" },
    { field: "vendidos", headerName: "Vendidos", flex: 1, type: "number" },
    { field: "costo_unitario", headerName: "Costo Unit.", flex: 1, type: "number" },
    { field: "costo", headerName: "Costo T.", flex: 1, type: "number" },
    { field: "comision_unitaria", headerName: "Comisión U.", flex: 1, type: "number" },
    { field: "comision", headerName: "Comisión T.", flex: 1, type: "number" },
    { field: "costoEnvio_unitario", headerName: "Envio U.", flex: 1, type: "number" },
    { field: "costo_envio", headerName: "Envio T.", flex: 1, type: "number" },
    { field: "costo_publicidad", headerName: "Publicidad T.", flex: 1, type: "number" },
    { field: "costoPublicidad_unitario", headerName: "Publicidad Uni.", flex: 1, type: "number" },
    { field: "utilidad", headerName: "Utilidad", flex: 1, type: "number" },
    { field: "utilidad_unitaria", headerName: "Utilidad Unit", flex: 1, type: "number" },
    { field: "transfer", headerName: "Transfer", flex: 1, type: "number" },
    { field: "fulfillment", headerName: "Fulfillment", flex: 1, type: "number" },
    { field: "on_the_way", headerName: "En Camino", flex: 1, type: "number" },
    {
      field: "link",
      headerName: "Link",
      flex: 1,
      renderCell: (params) => (
        <Button variant="outlined" size="small" href={params.value} target="_blank">
          Ver
        </Button>
      ),
    },
  ]}
  page={page}
  pageSize={pageSize}
  rowsPerPageOptions={[50]}
  paginationMode="client" // <-- cambiar a client
  onPageChange={(newPage) => setPage(newPage)}
  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
  autoHeight
  disableSelectionOnClick
  sx={{
    backgroundColor: "#263238",
    "& .MuiDataGrid-cell": { color: "#fff" },
    "& .MuiDataGrid-columnHeaders": { 
      backgroundColor: "#1c2b36", 
      color: "#000000ff",      // <-- asegurarte de que el color contraste
      fontWeight: "bold",
    },
    "& .MuiDataGrid-footerContainer": { backgroundColor: "#1c2b36", color: "#fff" },
  }}
/>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MercadoLibreDashboard;
