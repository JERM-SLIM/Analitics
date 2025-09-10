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
  const [selectedStore, setSelectedStore] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const abortControllerRef = useRef(null);

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




const fetchAdCost = async (itemId, sellerId) => {
  try {
    const res = await axios.get(
      `https://diler.com.mx:9092/seller/api`,
      {
        params: {
          seller: sellerId,          // tu seller_id
          endpoint_type: 'ads',      // tipo de endpoint
          reference_id: itemId,      // item_id
        },
        headers: {
         Token: "v1qDm0ZuIEKFDIm/SNYKeg==",
          Accept: 'application/json',
        },
      }
    );

    const data = res.data;

    // Retornar el costo total de publicidad
    return data.metrics_summary?.total_amount || 0;

  } catch (err) {
    console.error(`Error fetchAdCost para item ${itemId}:`, err);
    return 0;
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

      let counts = {};
      let detailsMap = {};
      let summaryMap = {}; // Acumula por itemId


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
          const id = item.ITEM_ID;
          const tilulo = item.TITLE;
          const vendidos = item.QUANTITY;
          const precio = item.UNIT_PRICE;
          const costo = item.COSTO_ULTIMA_COMPRA || 0;
          const comision = item.SALE_FEE || 0;
          const costoEnvio = item.SHIPPING_COST || 0;
          const costoPublicidad = 0;

          const crossdock = item.CROSSDOCK || 0;
          const transfer = item.TRANSFER || 0;
          const fulfillment = item.FULFILLMENT || 0;
          const onTheWay = item.ON_THE_WAY || 0;
          counts[id] = (counts[id] || 0) + vendidos;

           detailsMap[id] = {
            id,
            titulo: tilulo,
            store: store.seller_id,
            vendidos: counts[id],
            precio,
            comision,
            costoEnvio,
            costo,
            costoPublicidad,
            crossdock,
            transfer,
            fulfillment,
            onTheWay,
        }
      };




        for (const item of res.data.result || []) {
    const id = item.ITEM_ID;
    const vendidos = item.QUANTITY;
    const costo = item.COSTO_ULTIMA_COMPRA || 0;
    const comision = item.SALE_FEE || 0;
    const costoEnvio = item.SHIPPING_COST || 0;
    const costoPublicidad = 0; // si quieres mantener publicidad aparte
    const precio = item.UNIT_PRICE || 0;

    if (!summaryMap[id]) {
      summaryMap[id] = {
        id,
        store: store.seller_id,
        titulo: item.TITLE,
        vendidos: 0,
        totalCosto: 0,
        totalComision: 0,
        totalCostoEnvio: 0,
        costoPublicidad: 0,
        precio_total: 0,
        crossdock: item.CROSSDOCK || 0,
        transfer: item.TRANSFER || 0,
        fulfillment: item.FULFILLMENT || 0,
        onTheWay: item.ON_THE_WAY || 0,
      };
    }

    summaryMap[id].vendidos += vendidos;
    summaryMap[id].totalCosto += costo * vendidos;
    summaryMap[id].totalComision += comision * vendidos;
    summaryMap[id].totalCostoEnvio += costoEnvio * vendidos;
    summaryMap[id].precio_total = precio; // Asumimos que el precio es constante por item
  }
      }
      
    
// --- Luego generas allItems ---
const allItems = Object.values(summaryMap).map((i) => {
  const totalCostos = i.totalCosto + i.totalComision + i.totalCostoEnvio + i.costoPublicidad;
  const utilidad = i.precio_total * i.vendidos - totalCostos;

  return {
    id: i.id,
    store: i.store,
    titulo: i.titulo,
    vendidos: i.vendidos,
    precio: i.precio_total,
    costo: i.totalCosto.toFixed(2),
    comision: i.totalComision.toFixed(2),
    costo_envio: i.totalCostoEnvio.toFixed(2),
    costo_publicidad: i.costoPublicidad.toFixed(2),
    total_costos: totalCostos.toFixed(2),
    utilidad: utilidad.toFixed(2),
    crossdock: i.crossdock,
    transfer: i.transfer,
    fulfillment: i.fulfillment,
    on_the_way: i.onTheWay,
    link: `https://articulo.mercadolibre.com.mx/${i.id}`,
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
  const exportToExcel = () => {
  if (!items.length) return;

  // Transformar los datos a un formato amigable para Excel
  const wsData = items.map((i) => ({
    ID: i.id,
    Tienda: i.store,
    Título: i.titulo,
    Precio: i.precio,
    Vendidos: i.vendidos,
    "Costo De Compra": i.costo,
    Comisión: i.comision,
    "Costo Envío": i.costo_envio,
    "Costo Publicidad": i.costo_publicidad,
    Utilidad: i.utilidad,
    "Stock Crossdock": i.crossdock,
    "Stock Transfer": i.transfer,
    "Stock Fulfillment": i.fulfillment,
    "En Camino": i.on_the_way,
    Link: i.link,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Publicaciones");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `MercadoLibreDashboard_${fromDate}_a_${toDate}.xlsx`);
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

    const totalVendidos = items.reduce((acc, i) => acc + i.vendidos, 0);
    const totalUtilidad = items.reduce((acc, i) => acc + parseFloat(i.utilidad), 0);

    const precioPromedio = items.reduce((acc, i) => acc + i.precio, 0) / items.length;
    const ticketPromedio = totalVendidos ? items.reduce((acc, i) => acc + i.precio * i.vendidos, 0) / totalVendidos : 0;
    const margenPromedio = totalVendidos ? (totalUtilidad / items.reduce((acc, i) => acc + i.precio * i.vendidos, 0)) * 100 : 0;

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
    { title: "Suma total de unidades vendidas", value: totalVendidos, tooltip: "Suma total de unidades vendidas" },
    { title: "Utilidad Total", value: `$${totalUtilidad.toFixed(2)}`, tooltip: "Suma de la utilidad de todos los productos (precio - comisión - costo envío)" },
    { title: "Ticket Promedio", value: `$${ticketPromedio.toFixed(2)}`, tooltip: "Promedio de venta por unidad (total vendido / total unidades)" },
    { title: "Precio Promedio", value: `$${precioPromedio.toFixed(2)}`, tooltip: "Promedio de precio de los productos vendidos" },
    { title: "Margen Promedio", value: `${margenPromedio.toFixed(2)}%`, tooltip: "Margen promedio = (utilidad total / ventas totales) * 100%" },
  ].map((kpi) => (
    <Grid item xs={12} sm={6} md={2} key={kpi.title}>
      <Card sx={{ backgroundColor: "#1e2a38" }}>
        <Tooltip title={kpi.tooltip} arrow>
          <CardContent sx={{ cursor: "pointer" }}>
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

<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
  <Button variant="contained" color="success" onClick={exportToExcel}>
    Descargar Excel
  </Button>
</Box>

      {/* Tabla de items */}
      <Card sx={{ backgroundColor: "#1e2a38" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>📄 Lista completa de publicaciones</Typography>
          <DataGrid
            rows={items}
            columns={[
               { field: "id", headerName: "ID", flex: 1 },
    { field: "store", headerName: "Tienda", flex: 1 },
    { field: "titulo", headerName: "Título", flex: 2 },
    { field: "precio", headerName: "Precio", flex: 1, type: "number" },
    { field: "vendidos", headerName: "Vendidos", flex: 1, type: "number" },
    { field: "costo", headerName: "Costo De Compra", flex: 1, type: "number" },
    { field: "comision", headerName: "Comisión", flex: 1, type: "number" },
    { field: "costo_envio", headerName: "Costo Envío", flex: 1, type: "number" },
    { field: "costo_publicidad", headerName: "Costo Publicidad", flex: 1, type: "number" },
    { field: "utilidad", headerName: "Utilidad", flex: 1, type: "number" },
    { field: "utilidad_total", headerName: "Utilidad Total", flex: 1, type: "number" },
    { field: "crossdock", headerName: "Stock Crossdock", flex: 1, type: "number" },
    { field: "transfer", headerName: "Stock Transfer", flex: 1, type: "number" },
    { field: "fulfillment", headerName: "Stock Fulfillment", flex: 1, type: "number" },
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
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoHeight
            disableSelectionOnClick
            sx={{
              color: "#eceff1",
              borderColor: "#37474f",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#263238",
                color: "#000000ff",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": { color: "#eceff1" },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#263238",
                color: "#eceff1",
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default MercadoLibreDashboard;
