// /analisis/Analitics/src/modules/analisis/MercadoLibre V3/hooks/useOrdersData.js
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
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("97892065");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(formatLocalDate(new Date()));
  const [toDate, setToDate] = useState(formatLocalDate(new Date()));
  const abortControllerRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState("unidades"); // Nuevo estado
  const [sortOrder, setSortOrder] = useState("desc"); // Nuevo estado

  // ahora es un objeto para mapear sets por publicación
  const preciosPorPublicacion = {};

  const fetchStores = async () => {
    try {
      const res = await axios.get("https://diler.com.mx:9092/seller/access", {
        headers: { Token: "v1qDm0ZuIEKFDIm/SNYKeg==", Accept: "application/json" },
      });
      setStores(res.data.result || []);
    } catch (err) {
      console.error("Error cargando tiendas:", err);
      setStores([]);
    }
  };

const fetchData = async () => {
  setLoading(true);
  setPage(0);

  try {
    const res = await axios.get("https://diler.com.mx:9092/orders/mercado/agrupado", {
      params: {
        p_seller: selectedStore === "all" ? "SLIM" : "SLIM", // Ajusta si manejas más sellers
        p_status: "paid",
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
      const precio_total = Number(d.TOTAL_UTILIDAD_BRUTA || 0) + Number(d.TOTAL_COMISION || 0) + Number(d.TOTAL_PUBLICIDAD || 0); // Aproximación si no viene total de venta
      const total_costos =
        Number(d.TOTAL_COMISION || 0) +
        Number(d.TOTAL_ENVIO || 0) +
        Number(d.TOTAL_PUBLICIDAD || 0);

      const utilidad_total = Number(d.UTILIDAD_NETA || 0);
      const utilidad_unitaria = vendidos > 0 ? utilidad_total / vendidos : 0;

      return {
        id: d.CODIGO,
        itemId: d.MELI,
        titulo: d.SKU,
        store: d.TIENDA,
        vendidos,
        precio: precio_total,
        precio_unitario: vendidos > 0 ? precio_total / vendidos : 0,
        costo: 0,
        costo_unitario: 0,
        comision: Number(d.TOTAL_COMISION || 0),
        comision_unitaria: vendidos > 0 ? Number(d.TOTAL_COMISION) / vendidos : 0,
        costo_envio: Number(d.TOTAL_ENVIO || 0),
        costoEnvio_unitario: vendidos > 0 ? Number(d.TOTAL_ENVIO) / vendidos : 0,
        costo_publicidad: Number(d.TOTAL_PUBLICIDAD || 0),
        costoPublicidad_unitario: vendidos > 0 ? Number(d.TOTAL_PUBLICIDAD) / vendidos : 0,
        total_costos: total_costos,
        utilidad: utilidad_total,
        utilidad_unitaria: utilidad_unitaria,
        totalMonto: precio_total,
        totalUtilidad: utilidad_total,
        totalVendidos: vendidos,
        picture_url: null,
        STATUS_PUBLICACION: null,
        desviacion_ventas: Number(d.DESVIACION_VENTAS ?? 0),

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


  useEffect(() => {
    fetchStores();
  }, []);

  const handleBuscar = () => {
    setPage(0);
    fetchData();
  };

  const {
    topVentas,
    topUtilidad,
    topMontoTotal, // 🔹 nuevo
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
    const productosPrecioVariable = items.filter(i => i.precio_variable).length;
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
      topMontoTotal: sortedByMontoTotal.slice(0, 10), // 🔹 agregado
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

  // En useOrdersData.js - VAMOS A VERIFICAR LA FUNCIÓN visibleRows:// visibleRows corregido
// visibleRows corregido

const itemsConDesviacion = useMemo(
  () => items.filter(i => i.desviacion_ventas && i.desviacion_ventas > 0),
  [items]
);

const visibleRows = useMemo(() => {
  let sorted = [...items];

  switch (sortBy) {
    case "ventas":
      sorted.sort((a, b) => {
        const aVal = a.totalVendidos ?? 0;
        const bVal = b.totalVendidos ?? 0;
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      });
      break;

    case "utilidad":
      sorted.sort((a, b) => {
        const aVal = a.totalUtilidad ?? 0;
        const bVal = b.totalUtilidad ?? 0;
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      });
      break;

case "monto":
  sorted.sort((a, b) => {
    const aVal = Number(a.totalMonto ?? a.precio ?? 0);
    const bVal = Number(b.totalMonto ?? b.precio ?? 0);
    return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
  });
  break;


    case "unidades":
    default:
      sorted.sort((a, b) => {
        const aVal = a.vendidos ?? 0;
        const bVal = b.vendidos ?? 0;
        if (bVal !== aVal) {
          return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        }
        // Si las unidades son iguales, ordenar por itemId
        return String(a.itemId ?? "").localeCompare(String(b.itemId ?? ""));
      });
      break;
  }

  const start = page * pageSize;
  return sorted.slice(start, start + pageSize).map((item, idx) => ({
    ...item,
    registro: start + idx + 1,
    comision_unitaria: item.comision_unitaria ?? 0,
  }));
}, [items, sortBy, sortOrder, page, pageSize]);



  const exportItemsWithTotalsToExcel = async () => {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        alert("No hay registros para exportar.");
        return;
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Items_y_Totales");

      // Columnas
      ws.columns = [
        { header: "#", key: "registro", width: 6 },
        { header: "ID", key: "id", width: 18 },
        { header: "Título", key: "titulo", width: 50 },
        { header: "Vendidos", key: "vendidos", width: 10 },
        { header: "Precio Total", key: "precio", width: 15 },
        { header: "Costo Total", key: "costo", width: 15 },
        { header: "Comisión Total", key: "comision", width: 15 },
        { header: "Envío Total", key: "costo_envio", width: 15 },
        { header: "Publicidad Total", key: "costo_publicidad", width: 15 },
        { header: "Utilidad Total", key: "utilidad", width: 15 },
        { header: "Desv. Ventas", key: "desviacion_ventas", width: 15 },

      ];

      ws.getRow(1).font = { bold: true };

      // Insertar items
      let rowIndex = 2;
      for (let idx = 0; idx < items.length; idx++) {
        const i = items[idx];
        ws.addRow({
          registro: idx + 1,
          id: i.itemId ?? i.id ?? "",
          titulo: i.titulo,
          vendidos: Number(i.vendidos ?? 0),
          precio: Number(i.precio ?? 0),
          costo: Number(i.costo ?? 0),
          comision: Number(i.comision ?? 0),
          costo_envio: Number(i.costo_envio ?? 0),
          costo_publicidad: Number(i.costo_publicidad ?? 0),
          utilidad: Number(i.utilidad ?? 0),
            desviacion_ventas: Number(i.desviacion_ventas ?? 0).toFixed(3), // 👈 agregado

        });
        rowIndex++;
      }

      // Calcular totales
      const totals = items.reduce(
        (acc, i) => {
          acc.vendidos += Number(i.vendidos ?? 0);
          acc.precio += Number(i.precio ?? 0);
          acc.costo += Number(i.costo ?? 0);
          acc.comision += Number(i.comision ?? 0);
          acc.costo_envio += Number(i.costo_envio ?? 0);
          acc.costo_publicidad += Number(i.costo_publicidad ?? 0);
          acc.utilidad += Number(i.utilidad ?? 0);
          return acc;
        },
        {
          vendidos: 0,
          precio: 0,
          costo: 0,
          comision: 0,
          costo_envio: 0,
          costo_publicidad: 0,
          utilidad: 0,
        }
      );

      // Insertar fila de totales
      ws.addRow({
        registro: "TOTAL",
        id: "",
        titulo: "",
        vendidos: totals.vendidos,
        precio: totals.precio,
        costo: totals.costo,
        comision: totals.comision,
        costo_envio: totals.costo_envio,
        costo_publicidad: totals.costo_publicidad,
        utilidad: totals.utilidad,
          desviacion_ventas: Number(i.desviacion_ventas ?? 0).toFixed(3), // 👈 agregado

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
        { header: "Desv. Ventas", key: "desviacion_ventas", width: 15 },

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
        { header: "Desv. Ventas", key: "desviacion_ventas", width: 15 },

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
            desviacion_ventas: Number(i.desviacion_ventas ?? 0).toFixed(3), // 👈 agregado

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
    stores,
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
    // Agregar los nuevos estados para filtros
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
};

export default useOrdersData;