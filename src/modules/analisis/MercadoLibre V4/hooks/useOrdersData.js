// useOrdersData.js - VERSIÓN COMPLETA CON CARRITO
import { useState, useEffect, useRef, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";

// helpers (mantén tu formato de moneda)
const truncate2Decimals = (v) => Math.trunc((v || 0) * 100) / 100;

const formatCurrencyStr = (v) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(v ?? 0));

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Función para descargar imágenes
async function fetchImageAsUint8Array(url) {
  if (!url) throw new Error("No URL");
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("Image fetch failed: " + res.status);
    const contentType = res.headers.get("content-type") || "";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("jpeg") || contentType.includes("jpg")
      ? "jpg"
      : url.endsWith(".png")
      ? "png"
      : url.endsWith(".jpg") || url.endsWith(".jpeg")
      ? "jpg"
      : "png";
    const ab = await res.arrayBuffer();
    return { buffer: new Uint8Array(ab), ext };
  } catch (err) {
    console.warn("Error descargando imagen:", url, err.message);
    throw err;
  }
}

// Función para insertar fila con imagen
async function appendRowWithImage(ws, rowIndex, rowData, imageUrl, imageColIndex) {
  const row = ws.getRow(rowIndex);
  row.values = rowData;

  if (imageUrl) {
    try {
      const { buffer, ext } = await fetchImageAsUint8Array(imageUrl);
      const imageId = ws.workbook.addImage({
        buffer,
        extension: ext,
      });

      const col = imageColIndex - 1;
      ws.addImage(imageId, {
        tl: { col: col + 0.1, row: rowIndex - 1 + 0.15 },
        ext: { width: 64, height: 64 },
      });

      row.height = Math.max(row.height || 15, 48);
    } catch (err) {
      console.warn("No se pudo insertar imagen:", imageUrl);
      ws.getCell(rowIndex, imageColIndex).value = "Imagen no disponible";
    }
  }
  row.commit();
}

const useOrdersData = () => {
  //const [stores, setStores] = useState([]);
 // const [selectedStore, setSelectedStore] = useState("97892065");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(formatLocalDate(new Date()));
  const [toDate, setToDate] = useState(formatLocalDate(new Date()));
  const abortControllerRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState("unidades");
  const [sortOrder, setSortOrder] = useState("desc");

  // Estados del carrito - AGREGAR ESTOS
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Nuevos estados para filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [titleFilter, setTitleFilter] = useState("");

  // 🆕 NUEVOS FILTROS
  const [margenMin, setMargenMin] = useState("");
  const [margenMax, setMargenMax] = useState("");
  const [roiMin, setRoiMin] = useState("");
  const [roiMax, setRoiMax] = useState("");
  const [stockRiskFilter, setStockRiskFilter] = useState("all");
  const [abcFilter, setAbcFilter] = useState("all");
  const [onlyWithStockRisk, setOnlyWithStockRisk] = useState(false);
  const [onlyVariablePrice, setOnlyVariablePrice] = useState(false);
const [proveedoresPorCodigo, setProveedoresPorCodigo] = useState({});
const [loadingProveedores, setLoadingProveedores] = useState({});
const [selectedProveedores, setSelectedProveedores] = useState({});

// Función para obtener proveedores de un producto
const fetchProveedores = async (codigo) => {
  if (!codigo) return [];

  // ⬇️ Si ya existen, regresar inmediatamente
  if (proveedoresPorCodigo[codigo] !== undefined) {
    return proveedoresPorCodigo[codigo];
  }

  setLoadingProveedores(prev => ({ ...prev, [codigo]: true }));

  try {
    const res = await axios.get(
      `https://diler.com.mx:9092/costos?codigo_slim=${codigo}`,
      {
        headers: {
          Token: "v1qDm0ZuIEKFDIm/SNYKeg==",
          Accept: "application/json",
        },
      }
    );

    const proveedores = res.data?.result || [];

    setProveedoresPorCodigo(prev => ({
      ...prev,
      [codigo]: proveedores
    }));

    // ✅ CLAVE: regresamos los datos
    return proveedores;

  } catch (err) {
    console.error(`Error cargando proveedores para ${codigo}:`, err);

    setProveedoresPorCodigo(prev => ({
      ...prev,
      [codigo]: []
    }));

    return [];

  } finally {
    setLoadingProveedores(prev => ({ ...prev, [codigo]: false }));
  }
};

  /* const fetchStores = async () => {
    try {
      const res = await axios.get("https://diler.com.mx:9092/seller/access", {
        headers: { Token: "v1qDm0ZuIEKFDIm/SNYKeg==", Accept: "application/json" },
      });
      setStores(res.data.result || []);
    } catch (err) {
      console.error("Error cargando tiendas:", err);
      setStores([]);
    }
  };*/

// Funciones del carrito - AGREGAR ESTAS
// Modifica la función toggleCartItem para obtener proveedores automáticamente:
const toggleCartItem = (item) => {
  setCart(prevCart => {
    const exists = prevCart.some(cartItem => cartItem.codigo === item.codigo);
    if (exists) {
      return prevCart.filter(cartItem => cartItem.codigo !== item.codigo);
    } else {
      // Cuando se agrega al carrito, obtener proveedores
      if (item.codigo && !proveedoresPorCodigo[item.codigo]) {
        fetchProveedores(item.codigo);
      }
      
      return [...prevCart, { 
        ...item, 
        cartQuantity: 1,
        addedAt: new Date().toISOString()
      }];
    }
  });
};

const updateCartQuantity = (codigo, quantity) => {
  setCart(prevCart =>
    prevCart.map(item =>
      item.codigo === codigo 
        ? { ...item, cartQuantity: Math.max(1, quantity) }
        : item
    )
  );
};

const removeFromCart = (codigo) => {
  setCart(prevCart => prevCart.filter(item => item.codigo !== codigo));
};

const clearCart = () => {
  setCart([]);
};

// Calcular totales del carrito
const cartTotals = useMemo(() => {
  if (!cart || !Array.isArray(cart)) {
    return {
      totalItems: 0,
      totalProducts: 0,
      totalValue: 0,
      totalCost: 0,
      totalProfit: 0,
      margin: 0
    };
  }
  
  const totalItems = cart.reduce((sum, item) => sum + (item.cartQuantity || 1), 0);
  const totalProducts = cart.length;
  const totalValue = cart.reduce((sum, item) => 
    sum + (item.precio_promedio_efectivo || 0) * (item.cartQuantity || 1), 0
  );
  const totalCost = cart.reduce((sum, item) => 
    sum + (item.total_costos || 0) * (item.cartQuantity || 1), 0
  );
  const totalProfit = cart.reduce((sum, item) => 
    sum + (item.utilidad || 0) * (item.cartQuantity || 1), 0
  );
  
  return {
    totalItems,
    totalProducts,
    totalValue,
    totalCost,
    totalProfit,
    margin: totalValue > 0 ? ((totalProfit / totalValue) * 100) : 0
  };
}, [cart]);

const fetchData = async () => {
  if (abortControllerRef.current) abortControllerRef.current.abort();
  abortControllerRef.current = new AbortController();
  setLoading(true);
  
  try {
    const res = await axios.get("https://diler.com.mx:9092/orders/mercado/agrupado/v2", {
      params: {
        p_status: "paid,delivered",
        p_date_from: fromDate,
        p_date_to: toDate,
      },
      headers: {
        Token: "v1qDm0ZuIEKFDIm/SNYKeg==",
        Accept: "application/json",
      },
    });

    const data = res.data?.result || [];

    const mapped = data.map((d, idx) => {
      const vendidos = Number(d.TOTAL_CANTIDAD_VENDIDA || 0);
      const precio_total = Number(d.COMISION_UNITARIA_PROMEDIO || 0) + Number(d.COSTO_ENVIO_POR_UNIDAD || 0) + Number(d.TOTAL_PUBLICIDAD || 0);
      const total_costos = Number(d.COMISION_UNITARIA_PROMEDIO || 0) + Number(d.COSTO_ENVIO_POR_UNIDAD || 0) + Number(d.TOTAL_PUBLICIDAD || 0);
      const utilidad_total = Number(d.UTILIDAD_NETA || 0);
      const utilidad_unitaria = vendidos > 0 ? utilidad_total / vendidos : 0;

      return {
        id: d.CODIGO,
        codigo: d.CODIGO,
        itemId: d.MELI,
        titulo: d.SKU,
        store: d.TIENDA,
        vendidos,
        totalVendidos: vendidos,
        numero_ordenes: Number(d.NUMERO_DE_ORDENES || 0),
        unidades_por_orden: Number(d.UNIDADES_POR_ORDEN || 0),
        ticket_promedio: Number(d.TICKET_PROMEDIO || 0),
        desviacion_ventas: Number(d.DESVIACION_VENTAS ?? 0),
        precio: precio_total,
        totalMonto: precio_total,
        precio_unitario: vendidos > 0 ? precio_total / vendidos : 0,
        precio_max: Number(d.PRECIO_MAX || 0),
        precio_min: Number(d.PRECIO_MIN || 0),
        precio_promedio_efectivo: Number(d.PRECIO_PROMEDIO_EFECTIVO || 0),
        rango_precio: Number(d.RANGO_PRECIO || 0),
        hubo_variacion_precio: Boolean(d.HUBO_VARIACION_PRECIO),
        costo: Number(d.COSTO_TOTAL || 0),
        costo_unitario: Number(d.COSTO_TOTAL_UNITARIO || 0),
        costo_total_unitario: Number(d.COSTO_TOTAL_UNITARIO || 0),
        costo_envio: Number(d.TOTAL_ENVIO || 0),
        costoEnvio_unitario: vendidos > 0 ? Number(d.TOTAL_ENVIO) / vendidos : 0,
        costo_envio_por_unidad: Number(d.COSTO_ENVIO_POR_UNIDAD || 0),
        costo_envio_promedio: Number(d.COSTO_ENVIO_PROMEDIO || 0),
        costo_publicidad: Number(d.TOTAL_PUBLICIDAD || 0),
        costoPublicidad_unitario: vendidos > 0 ? Number(d.TOTAL_PUBLICIDAD) / vendidos : 0,
        total_costos: total_costos,
        comision: Number(d.TOTAL_COMISION || 0),
        comision_unitaria: vendidos > 0 ? Number(d.TOTAL_COMISION) / vendidos : 0,
        porcentaje_comision: Number(d.PORCENTAJE_COMISION || 0),
        comision_unitaria_max: Number(d.COMISION_UNITARIA_MAX || 0),
        comision_unitaria_min: Number(d.COMISION_UNITARIA_MIN || 0),
        comision_unitaria_promedio: Number(d.COMISION_UNITARIA_PROMEDIO || 0),
        comision_unitaria_rango: Number(d.COMISION_UNITARIA_RANGO || 0),
        comision_unitaria_tiene_cambio: Boolean(d.COMISION_UNITARIA_TIENE_CAMBIO),
        utilidad: utilidad_total,
        totalUtilidad: utilidad_total,
        utilidad_unitaria: utilidad_unitaria,
        utilidad_neta: Number(d.UTILIDAD_NETA || 0),
        total_utilidad_bruta: Number(d.TOTAL_UTILIDAD_BRUTA || 0),
        margen_bruto_porcentaje: Number(d.MARGEN_BRUTO_PORCENTAJE || 0),
        margen_neto_porcentaje: Number(d.MARGEN_NETO_PORCENTAJE || 0),
        margen_unitario: Number(d.MARGEN_UNITARIO || 0),
        roi_publicidad: Number(d.ROI_PUBLICIDAD || 0),
        score_rentabilidad: Number(d.SCORE_RENTABILIDAD || 0),
        stock_total: Number(d.STOCK_TOTAL || 0),
        stock_disponible: Number(d.STOCK_DISPONIBLE || 0),
        stock_en_transito: Number(d.STOCK_EN_TRANSITO || 0),
        stock_encamino: Number(d.ENV_ENCAMINO || 0),
        stock_ful_transfer: Number(d.STOCK_FUL_TRANSFER || 0),
        fulfillment_available: Number(d.FULFILLMENT_AVAILABLE || 0),
        cotizacion: Number(d.CANTIDAD_COTIZADA || 0),
        dias_inventario: Number(d.DIAS_INVENTARIO || 0),
        riesgo_stock_out: d.RIESGO_STOCK_OUT || "BAJO_RIESGO",
        sell_through_rate: Number(d.SELL_THROUGH_RATE || 0),
        stock_a_cedis : Number(d["CH-MX"] || 0),
        stock_calidad : Number(d.CALIDAD || 0),
        stock_recibo : Number(d.RECIBO || 0),
        combo_detalle: d.COMBOS_DONDE_SE_VENDE || [],
        tiene_combos: (d.COMBOS_DONDE_SE_VENDE && d.COMBOS_DONDE_SE_VENDE.length > 0) || false,
        picture_url: d.PICTURE_URL,
        STATUS_PUBLICACION: d.STATUS_PUBLICACION,
      };
    });

    setItems(mapped);
  } catch (err) {
    console.error("Error cargando datos agrupados:", err);
    setItems([]);
  } finally {
    setLoading(false);
  }
};

  // useEffect(() => {
  //   fetchStores();
  // }, []);

const handleBuscar = () => {
  console.log("🔘 Botón Buscar clickeado");
  console.log("📅 Fecha desde:", fromDate);
  console.log("📅 Fecha hasta:", toDate);
  
  setPage(0);
  fetchData();
};

  const {
    topVentas,
    topUtilidad,
    topMontoTotal,
    totalVendidos,
    totalUtilidad,
    totalUtilidadSinCostos,
    ticketPromedio,
    precioPromedio,
    margenPromedio
  } = useMemo(() => {
    if (!items.length) return {
      topVentas: [],
      topUtilidad: [],
      topMontoTotal : [],
      totalVendidos: 0,
      totalUtilidad: 0,
      totalUtilidadSinCostos: 0,
      ticketPromedio: 0,
      precioPromedio: 0,
      margenPromedio: 0,
      totalVentas: 0,
      totalCostos: 0,
      margenBrutoPromedio: 0,
      costoPromedioUnitario: 0,
      productosPrecioVariable: 0,
      topFulfillment: [],
      topOnTheWay: []
    };
    
    const totalVentas = items.reduce((acc, i) => acc + Number(i.precio || 0), 0);
    const totalCostos = items.reduce((acc, i) => acc + Number(i.costo || 0) + Number(i.comision || 0) + Number(i.costo_envio || 0) + Number(i.costo_publicidad || 0), 0);
    const totalVendidos = items.reduce((acc, i) => acc + Number(i.vendidos || 0), 0);
    const totalUtilidad = totalVentas - totalCostos;
    const totalUtilidadSinCostos = items.reduce((acc, i) => acc + ((i.precio || 0) - ((i.comision || 0) + (i.costo_envio || 0) + (i.costo_publicidad || 0))), 0);
    const ticketPromedio = totalVendidos ? totalVentas / totalVendidos : 0;
    const precioPromedio = items.length ? totalVentas / items.length : 0;
    const margenPromedio = totalVentas ? (totalUtilidad / totalVentas) * 100 : 0;
    const margenBrutoPromedio = totalVentas ? ((totalVentas - totalCostos) / totalVentas) * 100 : 0;
    const costoPromedioUnitario = totalVendidos ? totalCostos / totalVendidos : 0;
    const productosPrecioVariable = items.filter(i => i.hubo_variacion_precio).length;
    const topFulfillment = [...items].sort((a, b) => (b.fulfillment || 0) - (a.fulfillment || 0)).slice(0, 10);
    const topOnTheWay = [...items].sort((a, b) => (b.on_the_way || 0) - (a.on_the_way || 0)).slice(0, 10);

    // 🔹 Ordenamientos
    const sortedByVentas = [...items].sort(
      (a, b) => (b.totalVendidos || 0) - (a.totalVendidos || 0)
    );
    const sortedByUtilidad = [...items].sort(
      (a, b) => (b.totalUtilidad || 0) - (a.totalUtilidad || 0)
    );
    const sortedByMontoTotal =[...items].sort(
      (a, b) => (b.totalMonto || 0) - (a.totalMonto || 0)
    );

    return {
      topVentas: sortedByVentas.slice(0, 10),
      topUtilidad: sortedByUtilidad.slice(0, 10),
      topMontoTotal: sortedByMontoTotal.slice(0, 10),
      totalVentas,
      totalCostos,
      totalVendidos,
      totalUtilidad,
      totalUtilidadSinCostos,
      ticketPromedio,
      precioPromedio,
      margenPromedio,
      margenBrutoPromedio,
      costoPromedioUnitario,
      productosPrecioVariable,
      topFulfillment,
      topOnTheWay
    };
  }, [items]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // visibleRows con filtros aplicados
  const visibleRows = useMemo(() => {
    let filtered = [...items];

    // Aplicar filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => 
        item.STATUS_PUBLICACION === statusFilter
      );
    }

  // Aplicar filtro por título o código
if (titleFilter.trim() !== "") {
  const searchTerm = titleFilter.toLowerCase().trim();

  filtered = filtered.filter(item => {
    const t = item.titulo?.toLowerCase() || "";
    const c = String(item.codigo || "").toLowerCase();

    return t.includes(searchTerm) || c.includes(searchTerm);
  });
}

  // 🆕 FILTRO POR MARGEN NETO
  if (margenMin !== "") {
    const min = parseFloat(margenMin);
    filtered = filtered.filter(item => 
      item.margen_neto_porcentaje >= min
    );
  }
  if (margenMax !== "") {
    const max = parseFloat(margenMax);
    filtered = filtered.filter(item => 
      item.margen_neto_porcentaje <= max
    );
  }

  // 🆕 FILTRO POR ROI PUBLICIDAD
  if (roiMin !== "") {
    const min = parseFloat(roiMin);
    filtered = filtered.filter(item => 
      item.roi_publicidad >= min
    );
  }
  if (roiMax !== "") {
    const max = parseFloat(roiMax);
    filtered = filtered.filter(item => 
      item.roi_publicidad <= max
    );
  }

  // 🆕 FILTRO POR RIESGO DE STOCK
  if (stockRiskFilter !== "all") {
    filtered = filtered.filter(item => 
      item.riesgo_stock_out === stockRiskFilter
    );
  }

  // 🆕 FILTRO POR CLASIFICACIÓN ABC
  if (abcFilter !== "all") {
    filtered = filtered.filter(item => 
      item.clasificacion_abc === abcFilter
    );
  }

  // 🆕 FILTRO: SOLO PRODUCTOS CON RIESGO DE STOCK
  if (onlyWithStockRisk) {
    filtered = filtered.filter(item => 
      item.riesgo_stock_out && item.riesgo_stock_out !== 'BAJO_RIESGO'
    );
  }

  // 🆕 FILTRO: SOLO PRODUCTOS CON PRECIO VARIABLE
  if (onlyVariablePrice) {
    filtered = filtered.filter(item => 
      item.hubo_variacion_precio === true
    );
  }

    // Aplicar ordenamiento
    switch (sortBy) {
      case "ventas":
        filtered.sort((a, b) => {
          const aVal = a.totalVendidos ?? 0;
          const bVal = b.totalVendidos ?? 0;
          return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        });
        break;

      case "utilidad":
        filtered.sort((a, b) => {
          const aVal = a.totalUtilidad ?? 0;
          const bVal = b.totalUtilidad ?? 0;
          return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        });
        break;

      case "monto":
        filtered.sort((a, b) => {
          const aVal = Number(a.totalMonto ?? a.precio ?? 0);
          const bVal = Number(b.totalMonto ?? b.precio ?? 0);
          return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        });
        break;

      case "unidades":
      default:
        filtered.sort((a, b) => {
          const aVal = a.vendidos ?? 0;
          const bVal = b.vendidos ?? 0;
          if (bVal !== aVal) {
            return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
          }
          return String(a.itemId ?? "").localeCompare(String(b.itemId ?? ""));
        });
        break;
    }

    const start = page * pageSize;
    return filtered.slice(start, start + pageSize).map((item, idx) => ({
      ...item,
      registro: start + idx + 1,
      comision_unitaria: item.comision_unitaria ?? 0,
    }));
  }, [items, 
  statusFilter, 
  titleFilter, 
  margenMin, margenMax,
  roiMin, roiMax,
  stockRiskFilter,
  abcFilter,
  onlyWithStockRisk,
  onlyVariablePrice,
  sortBy, sortOrder, page, pageSize]);

  const exportItemsWithTotalsToExcel = async () => {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        alert("No hay registros para exportar.");
        return;
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Items_y_Totales");

      // Columnas actualizadas con nuevos campos
      ws.columns = [
        { header: "#", key: "registro", width: 6 },
        { header: "CÓDIGO", key: "codigo", width: 18 },
        { header: "MELI ID", key: "id", width: 18 },
        { header: "Sku", key: "sku", width: 50 },
        { header: "Estado", key: "status", width: 12 },
        { header: "Vendidos", key: "vendidos", width: 10 },
        { header: "Órdenes", key: "numero_ordenes", width: 10 },
        { header: "Precio Total", key: "precio", width: 15 },
        { header: "Utilidad Bruta", key: "total_utilidad_bruta", width: 15 },
        { header: "Comisión Total", key: "comision", width: 15 },
        { header: "Envío Total", key: "costo_envio", width: 15 },
        { header: "Publicidad Total", key: "costo_publicidad", width: 15 },
        { header: "Utilidad Total", key: "utilidad", width: 15 },
        { header: "Desv. Ventas", key: "desviacion_ventas", width: 12 },
        { header: "Variación Precio", key: "hubo_variacion_precio", width: 12 },
        { header: "Precio Máx", key: "precio_max", width: 12 },
        { header: "Precio Mín", key: "precio_min", width: 12 },
        { header: "Costo Envío Prom.", key: "costo_envio_promedio", width: 15 },
      ];

      ws.getRow(1).font = { bold: true };

      // Insertar items
      let rowIndex = 2;
      for (let idx = 0; idx < items.length; idx++) {
        const i = items[idx];
        ws.addRow({
          registro: idx + 1,
          codigo: i.codigo ?? "",
          id: i.itemId ?? "",
          sku: i.titulo,
          status: i.STATUS_PUBLICACION,
          vendidos: Number(i.vendidos ?? 0),
          numero_ordenes: Number(i.numero_ordenes ?? 0),
          precio: Number(i.precio ?? 0),
          total_utilidad_bruta: Number(i.total_utilidad_bruta ?? 0),
          comision: Number(i.comision ?? 0),
          costo_envio: Number(i.costo_envio ?? 0),
          costo_publicidad: Number(i.costo_publicidad ?? 0),
          utilidad: Number(i.utilidad ?? 0),
          desviacion_ventas: Number(i.desviacion_ventas ?? 0).toFixed(3),
          hubo_variacion_precio: i.hubo_variacion_precio ? "Sí" : "No",
          precio_max: Number(i.precio_max ?? 0),
          precio_min: Number(i.precio_min ?? 0),
          costo_envio_promedio: Number(i.costo_envio_promedio ?? 0),
        });
        rowIndex++;
      }

      // Calcular totales
      const totals = items.reduce(
        (acc, i) => {
          acc.vendidos += Number(i.vendidos ?? 0);
          acc.numero_ordenes += Number(i.numero_ordenes ?? 0);
          acc.precio += Number(i.precio ?? 0);
          acc.total_utilidad_bruta += Number(i.total_utilidad_bruta ?? 0);
          acc.comision += Number(i.comision ?? 0);
          acc.costo_envio += Number(i.costo_envio ?? 0);
          acc.costo_publicidad += Number(i.costo_publicidad ?? 0);
          acc.utilidad += Number(i.utilidad ?? 0);
          return acc;
        },
        {
          vendidos: 0,
          numero_ordenes: 0,
          precio: 0,
          total_utilidad_bruta: 0,
          comision: 0,
          costo_envio: 0,
          costo_publicidad: 0,
          utilidad: 0,
        }
      );

      // Insertar fila de totales
      ws.addRow({
        registro: "TOTAL",
        codigo: "",
        id: "",
        sku: "",
        status: "",
        vendidos: totals.vendidos,
        numero_ordenes: totals.numero_ordenes,
        precio: totals.precio,
        total_utilidad_bruta: totals.total_utilidad_bruta,
        comision: totals.comision,
        costo_envio: totals.costo_envio,
        costo_publicidad: totals.costo_publicidad,
        utilidad: totals.utilidad,
        desviacion_ventas: "",
        hubo_variacion_precio: "",
        precio_max: "",
        precio_min: "",
        costo_envio_promedio: "",
      });

      // Formato de columnas numéricas
      ws.columns.forEach((col) => {
        col.alignment = { horizontal: "right" };
      });

      // Descargar Excel
      const buf = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buf], { type: "application/octet-stream" }),
        `Items_y_Totales_${fromDate}_a_${toDate}.xlsx`
      );
    } catch (err) {
      console.error("Error exportItemsWithTotalsToExcel:", err);
      alert("Ocurrió un error al exportar los items con totales. Revisa la consola.");
    }
  };

  // Las funciones exportPageToExcel y exportAllToExcel se mantienen similares
const exportPageToExcel = async () => {
    try {
      if (!visibleRows || visibleRows.length === 0) {
        alert("No hay filas visibles para exportar.");
        return;
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(`Órdenes_Página_${page + 1}`);

      // Definir columnas (incluyendo columna para imagen)
      ws.columns = [
        { header: "#", key: "registro", width: 6 },
        { header: "ID", key: "id", width: 18 },
        { header: "Título", key: "titulo", width: 70 },
        { header: "Precio Unit.", key: "precio_unitario", width: 14 },
        { header: "Costo Unit.", key: "costo_unitario", width: 14 },
        { header: "Vendidos", key: "vendidos", width: 10 },
        { header: "Fulfillment", key: "fulfillment", width: 12 },
        { header: "Comisión U.", key: "comision_unitaria", width: 14 },
        { header: "Envío U.", key: "costoEnvio_unitario", width: 12 },
        { header: "Publicidad U.", key: "costoPublicidad_unitario", width: 14 },
        { header: "Utilidad Unit", key: "utilidad_unitaria", width: 14 },
        { header: "Imagen", key: "imagen", width: 18 },
      ];

      // Estilo encabezado
      ws.getRow(1).font = { bold: true };

      // Rellenar filas con imágenes
      let rowIndex = 2;
      for (const r of visibleRows) {
        const valores = [
          r.registro,
          r.itemId,
          r.titulo,
          formatCurrencyStr(r.precio_unitario),
          formatCurrencyStr(r.costo_unitario),
          r.vendidos,
          r.fulfillment,
          formatCurrencyStr(r.comision_unitaria),
          formatCurrencyStr(r.costoEnvio_unitario),
          formatCurrencyStr(r.costoPublicidad_unitario),
          r.utilidad_unitaria.toFixed(2),
          "" // Celda de imagen queda vacía
        ];

        await appendRowWithImage(ws, rowIndex, valores, r.picture_url, 12);
        rowIndex++;
      }

      // Generar buffer y descargar
      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `Ordenes_Página_${page + 1}_con_imagenes.xlsx`);
    } catch (err) {
      console.error("Error exportando a Excel:", err);
      alert("Error al exportar. Ver consola para detalles.");
    }
  };

  const exportAllToExcel = async () => {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        alert("No hay registros para exportar.");
        return;
      }

      // Aplicar el mismo ordenamiento que visibleRows
      let sorted = [...items];
      switch (sortBy) {
        case "ventas":
          sorted.sort((a, b) => {
            const valueA = a.precio || 0;
            const valueB = b.precio || 0;
            return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
          });
          break;
        case "utilidad":
          sorted.sort((a, b) => {
            const valueA = a.utilidad || 0;
            const valueB = b.utilidad || 0;
            return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
          });
          break;
        case "unidades":
        default:
          sorted.sort((a, b) => {
            const valueA = a.vendidos || 0;
            const valueB = b.vendidos || 0;
            if (valueB !== valueA) {
              return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
            }
            return String(a.itemId ?? "").localeCompare(String(b.itemId ?? ""));
          });
          break;
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Órdenes_Totales");

      // Definir columnas (encabezado, key y ancho)
      ws.columns = [
        { header: "#", key: "registro", width: 6 },
        { header: "ID", key: "id", width: 18 },
        { header: "Título", key: "titulo", width: 70 },
        { header: "Precio Unit.", key: "precio_unitario", width: 14 },
        { header: "Costo Unit.", key: "costo_unitario", width: 14 },
        { header: "Vendidos", key: "vendidos", width: 10 },
        { header: "Fulfillment", key: "fulfillment", width: 12 },
        { header: "Comisión U.", key: "comision_unitaria", width: 14 },
        { header: "Envío U.", key: "costoEnvio_unitario", width: 12 },
        { header: "Publicidad U.", key: "costoPublicidad_unitario", width: 14 },
        { header: "Utilidad T.", key: "utilidad", width: 14 },
        { header: "Precio T.", key: "precio", width: 18 },
      ];

      // Estilo encabezado
      ws.getRow(1).font = { bold: true };

      // Hacer wrap del título para que no se corte en Excel
      ws.getColumn("titulo").alignment = { wrapText: true };

      // Rellenar filas (sin imágenes)
      for (let idx = 0; idx < sorted.length; idx++) {
        const r = sorted[idx];
        ws.addRow({
          registro: idx + 1,
          id: r.itemId ?? r.id ?? "",
          titulo: r.titulo ?? "",
          precio_unitario: formatCurrencyStr(r.precio_unitario),
          costo_unitario: formatCurrencyStr(r.costo_unitario),
          vendidos: Number(r.vendidos ?? 0),
          fulfillment: Number(r.fulfillment ?? 0),
          comision_unitaria: formatCurrencyStr(r.comision_unitaria),
          costoEnvio_unitario: formatCurrencyStr(r.costoEnvio_unitario),
          costoPublicidad_unitario: formatCurrencyStr(r.costoPublicidad_unitario),
          utilidad: Number(r.utilidad ?? 0).toFixed(2),
          precio: formatCurrencyStr(r.precio),
        });
      }

      // Alineación para columnas numéricas (opcional, mejora presentación)
      ["vendidos", "fulfillment"].forEach((k) => {
        ws.getColumn(k).alignment = { horizontal: "right" };
      });
      ["precio_unitario","costo_unitario","comision_unitaria","costoEnvio_unitario","costoPublicidad_unitario","utilidad","precio"].forEach((k) => {
        ws.getColumn(k).alignment = { horizontal: "right" };
      });

      // Generar buffer y descargar
      const buf = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buf], { type: "application/octet-stream" }),
        `Ordenes_Totales_${fromDate}_a_${toDate}.xlsx`
      );
    } catch (err) {
      console.error("Error exportAllToExcel (sin imágenes):", err);
      alert("Ocurrió un error al exportar todo. Revisa la consola para más detalles.");
    }
  };

  return {
    // stores,
    items,
    loading,
    fetchData: handleBuscar,
    topVentas,
    topUtilidad,
    totalVendidos,
    totalUtilidad,
    topMontoTotal,
    totalUtilidadSinCostos,
    ticketPromedio,
    precioPromedio,
    margenPromedio,
    // selectedStore,
    // setSelectedStore,
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
    // 🛒 AGREGAR ESTAS PROPIEDADES DEL CARRITO
    cart,
    toggleCartItem,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotals,
    showCart,
    setShowCart,
    proveedoresPorCodigo,
  loadingProveedores,
  fetchProveedores, // Para poder forzar la carga si es necesario
    // 🚚 Estados y funciones de proveedores
  proveedoresPorCodigo,
  loadingProveedores,
  fetchProveedores,
  
  // ✅ AÑADE ESTOS DOS - SON LOS QUE FALTAN
  selectedProveedores,
  setSelectedProveedores,
  };
};

export default useOrdersData;