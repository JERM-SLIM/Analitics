import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Check as CheckIcon,
  LocalShipping as LocalShippingIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import api from "../../../../services/api.js";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
};

// Función para calcular días entre fechas
const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  // Diferencia en milisegundos
  const diferenciaMs = Math.abs(fin - inicio);
  
  // Convertir a días
  const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
  
  return dias;
};

const CheckoutPage = ({ 
  cart, 
  cartTotals, 
  onBack,
  selectedProveedores = {},
  proveedoresPorCodigo = {},
  // 🆕 NUEVAS PROPS PARA LAS FECHAS DEL FILTRO
  fromDate = null,
  toDate = null
}) => {
  const [processingPedido, setProcessingPedido] = useState(false);
  const [errorPedido, setErrorPedido] = useState(null);
  const [folioGenerado, setFolioGenerado] = useState(null);
  
  // 🆕 ESTADOS PARA CONFIGURACIÓN DE DIAS Y LEADTIME
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [diasRango, setDiasRango] = useState(30);
  const [leadTimes, setLeadTimes] = useState({});
  const [configStep, setConfigStep] = useState(0); // 0: días, 1: leadtimes

  // Función para calcular días automáticamente si hay fechas
  const calcularDiasRangoAutomatico = () => {
    if (fromDate && toDate) {
      const diasCalculados = calcularDiasEntreFechas(fromDate, toDate);
      setDiasRango(diasCalculados);
      return diasCalculados;
    }
    return 30; // Valor por defecto
  };

  // Función para calcular totales con proveedores seleccionados
  const calcularTotalesConProveedores = () => {
    if (!cart || cart.length === 0) {
      return cartTotals;
    }

    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalItems = 0;
    let totalAhorro = 0;

    cart.forEach(item => {
      const cantidad = item.cartQuantity || 1;
      const precioOriginal = item.precio_promedio_efectivo || 0;
      const costoOriginal = item.costo_unitario || item.costo_total_unitario || 0;
      
      // Verificar si hay un proveedor seleccionado para este producto
      const proveedorSeleccionado = selectedProveedores[item.codigo];
      
      // Usar costo del proveedor si está seleccionado, si no usar costo original
      const costoUnitario = proveedorSeleccionado 
        ? proveedorSeleccionado.COST
        : costoOriginal;
      
      const costoTotal = costoUnitario * cantidad;
      const valorTotal = precioOriginal * cantidad;
      const utilidadTotal = valorTotal - costoTotal;
      
      // Calcular ahorro si hay proveedor seleccionado
      if (proveedorSeleccionado && proveedorSeleccionado.COST < costoOriginal) {
        totalAhorro += (costoOriginal - proveedorSeleccionado.COST) * cantidad;
      }
      
      totalValue += valorTotal;
      totalCost += costoTotal;
      totalProfit += utilidadTotal;
      totalItems += cantidad;
    });

    const margin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;

    return {
      totalProducts: cart.length,
      totalItems,
      totalValue,
      totalCost,
      totalProfit,
      margin,
      totalAhorro,
      tieneProveedoresSeleccionados: Object.keys(selectedProveedores).length > 0
    };
  };

  const totalsConProveedores = calcularTotalesConProveedores();

  const handlePrint = () => {
    window.print();
  };

  // Función para confirmar pedido NORMAL (sin proveedores)
  const handleConfirmarNormal = () => {
    alert('Pedido normal confirmado. Para pedidos con proveedores, selecciona proveedores en el carrito.');
  };

  // 🆕 FUNCIÓN PARA INICIAR CONFIGURACIÓN DE DIAS Y LEADTIME
  const iniciarConfiguracionPedido = () => {
    // Calcular días automáticamente si hay fechas
    const diasAutomaticos = calcularDiasRangoAutomatico();
    setDiasRango(diasAutomaticos);
    
    // Inicializar leadtimes para cada proveedor
    const initialLeadTimes = {};
    Object.keys(selectedProveedores).forEach(codigo => {
      const proveedor = selectedProveedores[codigo];
      if (proveedor && proveedor.PROVEEDOR_ID) {
        initialLeadTimes[proveedor.PROVEEDOR_ID] = {
          proveedorId: proveedor.PROVEEDOR_ID,
          proveedorNombre: proveedor.NOMBRE,
          leadTime: 7, // Valor por defecto
          diasRango: diasAutomaticos
        };
      }
    });
    
    setLeadTimes(initialLeadTimes);
    setConfigStep(0);
    setShowConfigDialog(true);
  };

  // 🆕 FUNCIÓN PARA MANEJAR CONFIRMACIÓN CON PROVEEDORES
  const handleConfirmarConProveedores = async (diasRangoConfig, leadTimesConfig) => {
    try {
      setProcessingPedido(true);
      setErrorPedido(null);
      
      // 1. Agrupar items por proveedor
      const itemsPorProveedor = {};
      
      cart.forEach(item => {
        const proveedor = selectedProveedores[item.codigo];
        if (proveedor) {
          const proveedorId = proveedor.PROVEEDOR_ID;
          if (!itemsPorProveedor[proveedorId]) {
            itemsPorProveedor[proveedorId] = {
              proveedorId: proveedorId,
              proveedorNombre: proveedor.NOMBRE,
              items: [],
              total: 0
            };
          }
          
          const cantidad = item.cartQuantity || 1;
          const costoUnitario = proveedor.COST || 0;
          const totalItem = cantidad * costoUnitario;
          
          itemsPorProveedor[proveedorId].items.push({
            CODIGO: item.codigo,
            DESCRIPCION: item.titulo,
            CANTIDAD_COTIZADA: cantidad,
            COSTO: costoUnitario,
            COSTO_NUEVO: costoUnitario,
            PRECIO_UNITARIO: item.precio_promedio_efectivo || 0,
            MODELO: proveedor.MODELO || 'N/A',
            CANTIDAD_POR_CAJA: proveedor.UNITS_PER_BOX || 1,
            STATUS: 0
          });
          
          itemsPorProveedor[proveedorId].total += totalItem;
        }
      });

      if (Object.keys(itemsPorProveedor).length === 0) {
        alert('⚠️ No hay proveedores seleccionados para generar cotizaciones.');
        setProcessingPedido(false);
        return;
      }

      // 2. Mostrar confirmación al usuario con la nueva información
      const confirmMessage = 
        `📋 RESÚMEN DE COTIZACIONES A GENERAR\n\n` +
        `📅 Días del rango seleccionado: ${diasRangoConfig} días\n\n` +
        `Cantidad de cotizaciones: ${Object.keys(itemsPorProveedor).length}\n\n` +
        Object.values(itemsPorProveedor).map(p => 
          `• Proveedor: ${p.proveedorNombre}\n` +
          `  Productos: ${p.items.length}\n` +
          `  Total: ${formatCurrency(p.total)}\n` +
          `  Lead Time: ${leadTimesConfig[p.proveedorId]?.leadTime || 7} días\n`
        ).join('\n') +
        `\n¿Deseas continuar con la generación de cotizaciones?`;
      
      const confirmar = window.confirm(confirmMessage);
      
      if (!confirmar) {
        setProcessingPedido(false);
        return;
      }

      // 3. Procesar cada proveedor
      const resultados = [];
      let cotizacionesExitosas = 0;
      let cotizacionesFallidas = 0;
      
      for (const [proveedorId, datos] of Object.entries(itemsPorProveedor)) {
        try {
          console.log(`Procesando proveedor ${proveedorId} (${datos.proveedorNombre})...`);
          
          // 3.1. Generar folio
          const folioResponse = await axios.get(
            `https://diler.com.mx:9092/generar/folio/cotizacion?proveedor=${proveedorId}`,
            {
              headers: {
                'Token': 'GHnKExSdCWsOFwuB7w7BCQ==',
                'Accept': 'application/json'
              }
            }
          );
          
          const folio = folioResponse.data?.result;
          
          if (!folio) {
            throw new Error(`No se pudo generar folio para el proveedor`);
          }
          
          setFolioGenerado(folio);
          console.log(`Folio generado: ${folio}`);
          
          // 🆕 OBTENER LEAD TIME PARA ESTE PROVEEDOR
          const LEADTIME_PROVEEDOR = leadTimesConfig[proveedorId]?.leadTime || 7;
          
          // 3.2. Preparar datos de la cotización CON DIAS Y LEADTIME
          const cotizacionData = {
            FOLIO: folio,
            FECHA_CREACION: new Date().toISOString(),
            FACTOR_IVA: 1.16,
            TOTAL: datos.total,
            PROVEEDOR_ID: parseInt(proveedorId),
            STATUS: "PENDIENTE",
            OBSERVACIONES: `Pedido generado desde Dashboard MercadoLibre - Rango: ${diasRangoConfig} días - Lead Time: ${LEADTIME_PROVEEDOR} días - ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`,
            DIAS: diasRangoConfig, // 🆕 Días del rango seleccionado
            LEADTIME: LEADTIME_PROVEEDOR, // 🆕 Lead Time manual por proveedor
            ITEMS: datos.items.map((item, index) => ({
              ITEM: index + 1,
              CODIGO: item.CODIGO,
              DESCRIPCION: item.DESCRIPCION,
              CANTIDAD_COTIZADA: item.CANTIDAD_COTIZADA,
              COSTO: item.COSTO_NUEVO,
              COSTO_NUEVO: item.COSTO_NUEVO,
              FOLIO_COMPRA: "",
              PRECIO_UNITARIO: item.PRECIO_UNITARIO,
              CANTIDAD_POR_CAJA: item.CANTIDAD_POR_CAJA,
              CANTIDAD_CANCELADA: 0,
              REEMPLAZO_PROVEEDOR: "",
              STATUS: 0,
              MODELO: item.MODELO
            }))
          };
          
          console.log(`Enviando cotización para ${datos.proveedorNombre}...`);
          console.log('Datos enviados:', {
            DIAS_RANGO: diasRangoConfig,
            LEADTIME_PROVEEDOR,
            totalItems: datos.items.length
          });

          const saveResponse = await api.post("/web/cotizaciones/save", cotizacionData);
          
          console.log(`Respuesta del servidor para ${datos.proveedorNombre}:`, saveResponse.data);
          
          const esExitoso = saveResponse.data?.success;
          
          if (esExitoso) {
            cotizacionesExitosas++;
          } else {
            cotizacionesFallidas++;
          }
          
          resultados.push({
            folio: folio,
            success: esExitoso,
            mensaje: saveResponse.data?.message || 'Sin respuesta del servidor',
            cotizacion_id: saveResponse.data?.cotizacion_id,
            proveedor: datos.proveedorNombre,
            items: datos.items.length,
            total: datos.total,
            diasRango: diasRangoConfig,
            leadTime: LEADTIME_PROVEEDOR
          });
          
          if (esExitoso) {
            console.log(`✅ Cotización guardada exitosamente para ${datos.proveedorNombre}`);
          } else {
            console.warn(`⚠️ Respuesta inesperada para ${datos.proveedorNombre}:`, saveResponse.data);
          }
          
          // Pequeña pausa entre solicitudes
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Error con proveedor ${proveedorId} (${datos.proveedorNombre}):`, error);
          cotizacionesFallidas++;
          
          let errorMessage = 'Error desconocido';
          let errorCode = 'UNKNOWN';
          
          if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
            errorCode = `HTTP_${error.response.status}`;
          } else if (error.request) {
            errorMessage = 'No se recibió respuesta del servidor. Verifica tu conexión.';
            errorCode = 'NO_RESPONSE';
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Timeout: La solicitud tardó demasiado en responder.';
            errorCode = 'TIMEOUT';
          } else {
            errorMessage = error.message;
            errorCode = error.code || 'UNKNOWN';
          }
          
          resultados.push({
            proveedor: datos.proveedorNombre,
            success: false,
            error: errorMessage,
            items: datos.items.length,
            tipoError: errorCode
          });
        }
      }
      
      // 4. Mostrar resultados detallados INCLUYENDO DIAS Y LEADTIME
      const exitosos = resultados.filter(r => r.success);
      const fallidos = resultados.filter(r => !r.success);
      
      let mensajeFinal = 
        `📊 RESULTADO FINAL DE COTIZACIONES\n\n` +
        `📅 Días del rango seleccionado: ${diasRangoConfig} días\n\n` +
        `✅ EXITOSAS: ${exitosos.length} de ${resultados.length}\n` +
        `❌ FALLIDAS: ${fallidos.length} de ${resultados.length}\n\n`;
      
      if (exitosos.length > 0) {
        mensajeFinal += '📋 COTIZACIONES GENERADAS EXITOSAMENTE:\n\n';
        exitosos.forEach((result, index) => {
          mensajeFinal += 
            `${index + 1}. ${result.proveedor}\n` +
            `   Folio: ${result.folio}\n` +
            `   Productos: ${result.items}\n` +
            `   Total: ${formatCurrency(result.total)}\n` +
            `   Días Rango: ${result.diasRango} días\n` +
            `   Lead Time: ${result.leadTime} días\n` +
            `   Estado: ✅ Guardada\n\n`;
        });
      }
      
      if (fallidos.length > 0) {
        mensajeFinal += '⚠️ COTIZACIONES CON ERRORES:\n\n';
        fallidos.forEach((result, index) => {
          mensajeFinal += 
            `${index + 1}. ${result.proveedor}\n` +
            `   Productos: ${result.items}\n` +
            `   Error: ${result.error || 'Error desconocido'}\n\n`;
        });
      }
      
      mensajeFinal += 
        `📌 NOTA: Las cotizaciones exitosas han sido registradas en el sistema\n` +
        `con sus respectivos folios. Puedes consultarlas en el módulo de compras.`;
      
      // Crear un alert más legible
      const resultDiv = document.createElement('div');
      resultDiv.style.cssText = `
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        max-height: 70vh;
        overflow-y: auto;
        white-space: pre-wrap;
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
      `;
      resultDiv.textContent = mensajeFinal;
      
      // Crear ventana modal personalizada
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;
      
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      `;
      
      const title = document.createElement('h3');
      title.textContent = 'Resultado de Cotizaciones';
      title.style.cssText = `
        margin: 0 0 20px 0;
        color: #1976d2;
        font-size: 18px;
        border-bottom: 2px solid #1976d2;
        padding-bottom: 10px;
      `;
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Cerrar';
      closeButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        float: right;
      `;
      closeButton.onclick = () => {
        document.body.removeChild(modal);
      };
      
      const exportButton = document.createElement('button');
      exportButton.textContent = '📥 Exportar Resumen';
      exportButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-right: 10px;
      `;
      exportButton.onclick = () => {
        exportarResumenCotizacionesPDF(exitosos, diasRangoConfig, leadTimesConfig);

        document.body.removeChild(modal);
      };
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'margin-top: 20px; clear: both;';
      
      if (exitosos.length > 0) {
        buttonContainer.appendChild(exportButton);
      }
      buttonContainer.appendChild(closeButton);
      
      modalContent.appendChild(title);
      modalContent.appendChild(resultDiv);
      modalContent.appendChild(buttonContainer);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // 5. Opcional: Ofrecer descargar resumen
      if (exitosos.length > 0) {
        // Auto-descargar después de 3 segundos (opcional)
        setTimeout(() => {
          const autoDownload = confirm(
            `✅ Se generaron ${exitosos.length} cotización(es) exitosamente.\n\n` +
            `¿Deseas descargar un resumen en Excel?`
          );
          if (autoDownload) {
            exportarResumenCotizacionesPDF(exitosos, diasRangoConfig, leadTimesConfig);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Error general en confirmación de pedido:', error);
      setErrorPedido(`Error al procesar pedido: ${error.message}`);
      
      alert(
        `❌ ERROR AL PROCESAR PEDIDO\n\n` +
        `Detalles: ${error.message}\n\n` +
        `Por favor, verifica:\n` +
        `1. Tu conexión a internet\n` +
        `2. Que el token de autenticación sea válido\n` +
        `3. Contacta al administrador si el problema persiste`
      );
    } finally {
      setProcessingPedido(false);
    }
  };

 const exportarResumenCotizacionesPDF = async (
  cotizacionesExitosas,
  diasRangoConfig,
  leadTimesConfig
) => {
  try {
    for (const cot of cotizacionesExitosas) {
      const doc = new jsPDF("p", "mm", "a4");

      const proveedor = Object.values(selectedProveedores)
        .find(p => p.NOMBRE === cot.proveedor);

      if (!proveedor) continue;

      const itemsProveedor = cart.filter(
        item => selectedProveedores[item.codigo]?.NOMBRE === cot.proveedor
      );

      /* =========================
         ENCABEZADO
      ==========================*/
      doc.setFontSize(16);
      doc.text(`Cotización – ${cot.proveedor}`, 14, 15);

      doc.setFontSize(10);
      doc.text(`Folio: ${cot.folio}`, 14, 22);
      doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, 14, 27);
      doc.text(`Días analizados: ${diasRangoConfig}`, 14, 32);
      doc.text(`Lead Time: ${cot.leadTime} días`, 14, 37);

      let startY = 45;

      /* =========================
         PREPARAR FILAS
      ==========================*/
      const rows = [];

      let subtotal = 0;

      for (const item of itemsProveedor) {
        const cantidad = item.cartQuantity || 1;
        const costo = selectedProveedores[item.codigo]?.COST || 0;
        subtotal += cantidad * costo;

        let imgBase64 = null;

        try {
          const res = await fetch(item.picture_url);
          const blob = await res.blob();
          imgBase64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch {
          imgBase64 = null;
        }

        rows.push({
          cantidad,
          titulo: item.titulo,
          modelo: selectedProveedores[item.codigo]?.MODELO || "N/A",
          imagen: imgBase64
        });
      }

      /* =========================
         TABLA
      ==========================*/
      autoTable(doc, {
        startY,
        head: [["Cantidad", "Título", "Modelo", "Imagen"]],
        body: rows.map(r => [
          r.cantidad,
          r.titulo,
          r.modelo,
          ""
        ]),
        didDrawCell: (data) => {
          if (data.column.index === 3 && data.row.section === "body") {
            const img = rows[data.row.index].imagen;
            if (img) {
              doc.addImage(
                img,
                "JPEG",
                data.cell.x + 2,
                data.cell.y + 2,
                16,
                16
              );
            }
          }
        },
        styles: {
          minCellHeight: 20,
          valign: "middle",
          fontSize: 9
        },
        headStyles: {
          fillColor: [25, 118, 210]
        }
      });

      /* =========================
         TOTALES
      ==========================*/
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      let y = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, y);
      doc.text(`IVA (16%): $${iva.toFixed(2)}`, 140, y + 6);
      doc.text(`Total: $${total.toFixed(2)}`, 140, y + 12);

      /* =========================
         GUARDAR PDF
      ==========================*/
      const fecha = new Date().toISOString().slice(0, 10);
      doc.save(`Cotizacion_${cot.proveedor}_${cot.folio}_${fecha}.pdf`);
    }

    alert("✅ PDFs de cotización generados correctamente.");

  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("❌ Error al generar los PDFs de cotización.");
  }
};

  const handleExportPDF = async () => {
  const doc = new jsPDF("p", "mm", "a4");

  // Título
  doc.setFontSize(16);
  doc.text("Resumen de Productos", 14, 15);

  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, 14, 22);

  let startY = 30;

  // Construimos filas
  const rows = [];

  for (const item of cart) {
    const proveedor = selectedProveedores[item.codigo];
    const cantidad = item.cartQuantity || 1;
    const modelo = proveedor?.MODELO || "N/A";

    let imgBase64 = null;

    try {
      // Convertir imagen a base64 (CORS-friendly)
      const response = await fetch(item.picture_url);
      const blob = await response.blob();

      imgBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("No se pudo cargar imagen:", item.picture_url);
    }

    rows.push({
      cantidad,
      titulo: item.titulo,
      modelo,
      imagen: imgBase64
    });
  }

  // Tabla con imágenes
  autoTable(doc, {
    startY,
    head: [["Cantidad", "Título", "Modelo", "Imagen"]],
    body: rows.map(r => [
      r.cantidad,
      r.titulo,
      r.modelo,
      "" // imagen se pinta después
    ]),
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.row.section === "body") {
        const img = rows[data.row.index].imagen;
        if (img) {
          doc.addImage(
            img,
            "JPEG",
            data.cell.x + 2,
            data.cell.y + 2,
            16,
            16
          );
        }
      }
    },
    styles: {
      minCellHeight: 20,
      valign: "middle"
    },
    headStyles: {
      fillColor: [25, 118, 210]
    }
  });

  // Guardar PDF
  const fecha = new Date().toISOString().slice(0, 10);
  doc.save(`Resumen_Productos_${fecha}.pdf`);
};


  // 🆕 FUNCIÓN PARA MANEJAR EL PASO SIGUIENTE EN LA CONFIGURACIÓN
  const handleNextConfigStep = () => {
    if (configStep === 0) {
      setConfigStep(1);
    } else {
      // Finalizar configuración y procesar
      setShowConfigDialog(false);
      handleConfirmarConProveedores(diasRango, leadTimes);
    }
  };

  // 🆕 FUNCIÓN PARA ACTUALIZAR LEAD TIME DE UN PROVEEDOR
  const handleUpdateLeadTime = (proveedorId, leadTime) => {
    setLeadTimes(prev => ({
      ...prev,
      [proveedorId]: {
        ...prev[proveedorId],
        leadTime: parseInt(leadTime) || 7
      }
    }));
  };

  return (
    <>
      {/* 🆕 DIALOGO DE CONFIGURACIÓN DE DIAS Y LEADTIME */}
      <Dialog 
        open={showConfigDialog} 
        onClose={() => setShowConfigDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ScheduleIcon />
          {configStep === 0 ? 'Configurar Días del Rango' : 'Configurar Lead Time por Proveedor'}
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {configStep === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📅 Configurar Días del Rango Analizado
              </Typography>
              
              {fromDate && toDate ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Fechas detectadas automáticamente:</strong><br />
                    Desde: {new Date(fromDate).toLocaleDateString('es-MX')}<br />
                    Hasta: {new Date(toDate).toLocaleDateString('es-MX')}<br />
                    <strong>Días calculados: {diasRango} días</strong>
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No se detectaron fechas automáticamente. Por favor, ingresa manualmente los días del rango.
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Días del rango analizado"
                type="number"
                value={diasRango}
                onChange={(e) => setDiasRango(parseInt(e.target.value) || 1)}
                InputProps={{ inputProps: { min: 1, max: 365 } }}
                helperText="Ingresa el número de días que abarca el rango seleccionado en los filtros"
                sx={{ mt: 2 }}
              />
              
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>💡 Ejemplos:</strong><br />
                  • Últimos 30 días: 30 días<br />
                  • Última semana: 7 días<br />
                  • Mes anterior: 30 días<br />
                  • Rango personalizado: Calcula la diferencia entre las fechas seleccionadas
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                ⏱️ Configurar Lead Time por Proveedor
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  El <strong>Lead Time</strong> es el tiempo estimado de entrega que requiere cada proveedor.<br />
                  Este valor se incluirá en cada cotización generada.
                </Typography>
              </Alert>
              
              {Object.values(leadTimes).map((proveedorInfo, index) => (
                <Box 
                  key={proveedorInfo.proveedorId} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    bgcolor: '#f9f9f9'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {index + 1}. {proveedorInfo.proveedorNombre}
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Lead Time (días)"
                    type="number"
                    value={proveedorInfo.leadTime || 7}
                    onChange={(e) => handleUpdateLeadTime(proveedorInfo.proveedorId, e.target.value)}
                    InputProps={{ inputProps: { min: 1, max: 90 } }}
                    helperText="Tiempo estimado de entrega en días laborables"
                  />
                  
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="3 días" 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleUpdateLeadTime(proveedorInfo.proveedorId, 3)}
                    />
                    <Chip 
                      label="5 días" 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleUpdateLeadTime(proveedorInfo.proveedorId, 5)}
                    />
                    <Chip 
                      label="7 días" 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleUpdateLeadTime(proveedorInfo.proveedorId, 7)}
                    />
                    <Chip 
                      label="15 días" 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleUpdateLeadTime(proveedorInfo.proveedorId, 15)}
                    />
                  </Box>
                </Box>
              ))}
              
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Días del rango configurados: {diasRango} días</strong><br />
                  Este valor se aplicará a todas las cotizaciones generadas.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          {configStep === 1 && (
            <Button 
              onClick={() => setConfigStep(0)}
              sx={{ mr: 1 }}
            >
              ← Volver
            </Button>
          )}
          
          <Button 
            onClick={() => setShowConfigDialog(false)}
            color="inherit"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleNextConfigStep}
            variant="contained"
            color="primary"
            autoFocus
          >
            {configStep === 0 ? 'Continuar →' : 'Generar Cotizaciones'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONTENIDO PRINCIPAL */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header con indicador de proveedores */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mb: 2 }}
          >
            Volver al Dashboard
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Resumen de Selección Final
            </Typography>
            
            {totalsConProveedores.tieneProveedoresSeleccionados && (
              <Chip
                icon={<CheckIcon />}
                label="Con Proveedores Seleccionados"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          
          <Typography variant="body1" color="white">
            {cart.length} productos seleccionados - {totalsConProveedores.totalItems} unidades
            {totalsConProveedores.tieneProveedoresSeleccionados && 
              ` (${Object.keys(selectedProveedores).length} con proveedores)`}
          </Typography>
        </Box>

        {/* Alertas de error y folio */}
        {errorPedido && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setErrorPedido(null)}
          >
            {errorPedido}
          </Alert>
        )}

        {folioGenerado && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setFolioGenerado(null)}
          >
            Último folio generado: <strong>{folioGenerado}</strong>
          </Alert>
        )}

        {/* Banner de ahorro si hay proveedores seleccionados */}
        {totalsConProveedores.totalAhorro > 0 && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              💰 Ahorro total con proveedores seleccionados: {formatCurrency(totalsConProveedores.totalAhorro)}
            </Typography>
          </Alert>
        )}

        {/* Información de rango si hay fechas */}
        {(fromDate && toDate) && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 1)' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Rango seleccionado: {new Date(fromDate).toLocaleDateString('es-MX')} - {new Date(toDate).toLocaleDateString('es-MX')} 
              ({calcularDiasEntreFechas(fromDate, toDate)} días)
            </Typography>
          </Alert>
        )}

        {/* Acciones */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 , color: 'white'}}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ color: 'white' }}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
                    sx={{ color: 'white' }}
          >
            Exportar PDF
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Tabla de productos */}
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="right">Costo Unit.</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Proveedor</TableCell>
                    <TableCell align="center">Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => {
                    const proveedor = selectedProveedores[item.codigo];
                    const costoActual = proveedor ? proveedor.COST : 0;
                    const cantidad = item.cartQuantity || 1;
                    
                    return (
                      <TableRow key={item.codigo}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={item.picture_url}
                              alt={item.titulo}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                objectFit: 'cover',
                                mr: 2
                              }}
                            />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {item.titulo}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Código: {item.codigo}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Chip 
                            label={cantidad} 
                            size="small"
                            sx={{ minWidth: 50 }}
                          />
                        </TableCell>
                        
                        <TableCell align="right">
                          {formatCurrency(costoActual)}
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(costoActual * cantidad)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          {proveedor ? (
                            <Chip
                              icon={<LocalShippingIcon />}
                              label={proveedor.NOMBRE}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ maxWidth: 120 }}
                            />
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              Original
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell align="center">
                          <Chip
                            label={item.stock_disponible || 0}
                            size="small"
                            color={item.stock_disponible > 0 ? "success" : "error"}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Resumen */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                {totalsConProveedores.tieneProveedoresSeleccionados 
                  ? 'Resumen con Proveedores' 
                  : 'Resumen Financiero'}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Productos:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">{cart.length}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Unidades:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">{totalsConProveedores.totalItems}</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Costo Total:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 'bold', 
                      color: totalsConProveedores.tieneProveedoresSeleccionados ? '#4caf50' : '#ff9800' 
                    }}>
                      {formatCurrency(totalsConProveedores.totalCost)}
                    </Typography>
                  </Grid>
                  
                  {totalsConProveedores.totalAhorro > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Ahorro Total:</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {formatCurrency(totalsConProveedores.totalAhorro)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={async () => {
                  if (totalsConProveedores.tieneProveedoresSeleccionados) {
                    // 🆕 LLAMAR A LA CONFIGURACIÓN EN LUGAR DE DIRECTO
                    iniciarConfiguracionPedido();
                  } else {
                    handleConfirmarNormal();
                  }
                }}
                disabled={processingPedido}
                sx={{
                  mt: 2,
                  background: totalsConProveedores.tieneProveedoresSeleccionados
                    ? 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)'
                    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: totalsConProveedores.tieneProveedoresSeleccionados
                      ? 'linear-gradient(45deg, #43a047 30%, #5cb860 90%)'
                      : 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)'
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                  }
                }}
              >
                {processingPedido ? (
                  <>⏳ Procesando...</>
                ) : totalsConProveedores.tieneProveedoresSeleccionados ? (
                  <>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    Configurar y Generar Cotizaciones
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
              
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                Generado el {new Date().toLocaleDateString('es-MX')}
                {totalsConProveedores.tieneProveedoresSeleccionados && ' • Con costos actualizados'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Notas adicionales
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notas y Observaciones
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Este es un resumen de la selección realizada desde el dashboard
          </Typography>
          {totalsConProveedores.tieneProveedoresSeleccionados && (
            <Typography variant="body2" color="textSecondary">
              • Los costos reflejan los proveedores seleccionados en el carrito
            </Typography>
          )}
          {(fromDate && toDate) && (
            <Typography variant="body2" color="textSecondary">
              • Análisis basado en el rango: {new Date(fromDate).toLocaleDateString('es-MX')} - {new Date(toDate).toLocaleDateString('es-MX')} ({calcularDiasEntreFechas(fromDate, toDate)} días)
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary">
            • Los precios son promedios basados en datos históricos
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Los stocks pueden variar en tiempo real
          </Typography>
          
          {Object.keys(selectedProveedores).length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Proveedores Seleccionados:
              </Typography>
              {Object.values(selectedProveedores).map((proveedor, idx) => (
                <Typography key={idx} variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                  • {proveedor.productoNombre}: {proveedor.NOMBRE} - {formatCurrency(proveedor.COST)} c/u
                </Typography>
              ))}
            </Box>
          )}
        </Paper>*/}
      </Container> 
    </>
  );
};

export default CheckoutPage;