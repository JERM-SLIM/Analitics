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
  Alert
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Check as CheckIcon,
  LocalShipping as LocalShippingIcon
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import axios from "axios";
import api from "../../../../services/api.js";
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
};

const CheckoutPage = ({ 
  cart, 
  cartTotals, 
  onBack,
  selectedProveedores = {},
  proveedoresPorCodigo = {} 
}) => {
  const [processingPedido, setProcessingPedido] = useState(false);
  const [errorPedido, setErrorPedido] = useState(null);
  const [folioGenerado, setFolioGenerado] = useState(null);

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


// Función para confirmar pedido CON PROVEEDORES
const handleConfirmarConProveedores = async () => {
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
          COSTO: item.costo_unitario || item.costo_total_unitario || 0,
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

    // 2. Mostrar confirmación al usuario
    const confirmMessage = 
      `📋 RESÚMEN DE COTIZACIONES A GENERAR\n\n` +
      `Cantidad de cotizaciones: ${Object.keys(itemsPorProveedor).length}\n\n` +
      Object.values(itemsPorProveedor).map(p => 
        `• Proveedor: ${p.proveedorNombre}\n` +
        `  Productos: ${p.items.length}\n` +
        `  Total: ${formatCurrency(p.total)}\n`
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
        
        // 3.2. Preparar datos de la cotización
        const cotizacionData = {
          FOLIO: folio,
          FECHA_CREACION: new Date().toISOString(),
          FACTOR_IVA: 1.16,
          TOTAL: datos.total,
          PROVEEDOR_ID: parseInt(proveedorId),
          STATUS: "PENDIENTE",
          OBSERVACIONES: `Pedido generado desde Dashboard MercadoLibre - ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`,
          ITEMS: datos.items.map((item, index) => ({
            ITEM: index + 1,
            CODIGO: item.CODIGO,
            DESCRIPCION: item.DESCRIPCION,
            CANTIDAD_COTIZADA: item.CANTIDAD_COTIZADA,
            COSTO: item.COSTO,
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
        
        // 3.3. Guardar cotización
        // const saveResponse = await axios.post(
        //   'https://diler.com.mx:9092/cotizacion/save',
        //   cotizacionData,
        //   {
        //     headers: {
        //       'Token': 'GHnKExSdCWsOFwuB7w7BCQ==',
        //       'Content-Type': 'application/json'
        //     },
        //     timeout: 10000 // 10 segundos timeout
        //   }
        // );
        const saveResponse = await api.post("/web/cotizaciones/save", cotizacionData);
        
       console.log(`Respuesta del servidor para ${datos.proveedorNombre}:`, saveResponse.data);
        
        // ✅ CORRECCIÓN: Verificar respuesta según el formato corregido del backend
        const esExitoso = saveResponse.data?.status === 200;
        
        resultados.push({
          folio: folio,
          success: esExitoso,
          mensaje: saveResponse.data?.message || 'Sin respuesta del servidor',
          cotizacion_id: saveResponse.data?.cotizacion_id
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
        
        let errorMessage = 'Error desconocido';
        let errorCode = 'UNKNOWN';
        
        if (error.response) {
          // El servidor respondió con un código de error
          errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
          errorCode = `HTTP_${error.response.status}`;
        } else if (error.request) {
          // La solicitud fue hecha pero no hubo respuesta
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
    
    // 4. Mostrar resultados detallados
    const exitosos = resultados.filter(r => r.success);
    const fallidos = resultados.filter(r => !r.success);
    
    let mensajeFinal = 
      `📊 RESULTADO FINAL DE COTIZACIONES\n\n` +
      `✅ EXITOSAS: ${cotizacionesExitosas} de ${resultados.length}\n` +
      `❌ FALLIDAS: ${cotizacionesFallidas} de ${resultados.length}\n\n`;
    
    if (exitosos.length > 0) {
      mensajeFinal += '📋 COTIZACIONES GENERADAS EXITOSAMENTE:\n\n';
      exitosos.forEach((result, index) => {
        mensajeFinal += 
          `${index + 1}. ${result.proveedor}\n` +
          `   Folio: ${result.folio}\n` +
          `   Productos: ${result.items}\n` +
          `   Total: ${formatCurrency(result.total)}\n` +
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
      exportarResumenCotizaciones(exitosos);
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
          exportarResumenCotizaciones(exitosos);
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

// Función mejorada para exportar resumen de cotizaciones
const exportarResumenCotizaciones = (cotizacionesExitosas) => {
  try {
    const wb = XLSX.utils.book_new();
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Hoja 1: Resumen ejecutivo
    const resumenData = [
      ['📊 RESUMEN EJECUTIVO DE COTIZACIONES'],
      [`Fecha de generación: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`],
      [''],
      ['ESTADÍSTICAS:'],
      ['Total de cotizaciones generadas:', cotizacionesExitosas.length],
      ['Total de productos:', cotizacionesExitosas.reduce((sum, cot) => sum + cot.items, 0)],
      ['Monto total:', cotizacionesExitosas.reduce((sum, cot) => sum + cot.total, 0)],
      [''],
      ['DETALLE POR PROVEEDOR:'],
      ['Proveedor', 'Folio', 'Productos', 'Total', 'Estado']
    ];
    
    cotizacionesExitosas.forEach(cot => {
      resumenData.push([
        cot.proveedor,
        cot.folio,
        cot.items,
        cot.total,
        '✅ EXITOSO'
      ]);
    });
    
    // Agregar totales
    const totalItems = cotizacionesExitosas.reduce((sum, cot) => sum + cot.items, 0);
    const totalMonto = cotizacionesExitosas.reduce((sum, cot) => sum + cot.total, 0);
    
    resumenData.push(['']);
    resumenData.push(['TOTALES', '', totalItems, totalMonto, '']);
    
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');
    
    // Hoja 2: Detalle por proveedor
    cotizacionesExitosas.forEach((cot, index) => {
      const proveedor = Object.values(selectedProveedores).find(p => p.NOMBRE === cot.proveedor);
      
      if (proveedor) {
        const itemsProveedor = cart.filter(item => 
          selectedProveedores[item.codigo]?.NOMBRE === cot.proveedor
        );
        
        const detalleData = [
          [`PROVEEDOR: ${cot.proveedor}`],
          [`FOLIO COTIZACIÓN: ${cot.folio}`],
          [`FECHA: ${new Date().toLocaleDateString('es-MX')}`],
          [''],
          ['LISTA DE PRODUCTOS:'],
          ['Código', 'Descripción', 'Cantidad', 'Costo Unitario', 'Total']
        ];
        
        let subtotal = 0;
        itemsProveedor.forEach(item => {
          const cantidad = item.cartQuantity || 1;
          const costoProveedor = selectedProveedores[item.codigo]?.COST || 0;
          const totalItem = cantidad * costoProveedor;
          subtotal += totalItem;
          
          detalleData.push([
            item.codigo,
            item.titulo.substring(0, 50) + (item.titulo.length > 50 ? '...' : ''),
            cantidad,
            costoProveedor,
            totalItem
          ]);
        });
        
        // Agregar subtotal
        detalleData.push(['']);
        detalleData.push(['', '', '', 'SUBTOTAL:', subtotal]);
        
        // Agregar IVA (16%)
        const iva = subtotal * 0.16;
        detalleData.push(['', '', '', 'IVA (16%):', iva]);
        
        // Agregar total
        const total = subtotal + iva;
        detalleData.push(['', '', '', 'TOTAL:', total]);
        
        const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
        XLSX.utils.book_append_sheet(wb, wsDetalle, `Proveedor ${index + 1}`);
      }
    });
    
    // Descargar archivo
    const fileName = `Resumen_Cotizaciones_${fecha}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`✅ Archivo "${fileName}" descargado exitosamente.`);
    
  } catch (error) {
    console.error('Error exportando resumen:', error);
    alert('⚠️ No se pudo exportar el resumen, pero las cotizaciones fueron creadas exitosamente.');
  }
};

  const handleExport = () => {
    try {
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Crear hoja de datos principales
      const mainData = cart.map((item) => {
        const proveedor = selectedProveedores[item.codigo];
        const costoActual = proveedor ? proveedor.COST : 0;
        const cantidad = item.cartQuantity || 1;
        const total = costoActual * cantidad;
        
        return {
          'Código': item.codigo,
          'Producto': item.titulo,
          'Cantidad': cantidad,
          'Costo Unitario': costoActual,
          'Proveedor': proveedor ? proveedor.NOMBRE : 'Original',
          'Modelo Proveedor': proveedor ? proveedor.MODELO || 'N/A' : 'N/A',
          'Total': total,
          'Stock Disponible': item.stock_disponible || 0,
          'Riesgo Stock': item.riesgo_stock_out || 'BAJO_RIESGO',
          'Estado': item.STATUS_PUBLICACION || 'active'
        };
      });

      // Convertir datos a hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(mainData);
      
      // Crear hoja de proveedores
      if (Object.keys(selectedProveedores).length > 0) {
        const providersData = Object.entries(selectedProveedores).map(([codigoProducto, proveedor]) => {
          const itemEnCarrito = cart.find(item => item.codigo === codigoProducto);
          const cantidad = itemEnCarrito ? (itemEnCarrito.cartQuantity || 1) : 1;
          
          return {
            'Producto': proveedor.productoNombre || codigoProducto,
            'Código Producto': codigoProducto,
            'Proveedor': proveedor.NOMBRE,
            'Cantidad': cantidad,
            'Costo Unitario': proveedor.COST,
            'Total': proveedor.COST * cantidad,
            'Modelo': proveedor.MODELO || 'N/A',
            'SKU': proveedor.SKU || 'N/A',
            'Unidades Disponibles': proveedor.UNITS || 0,
            'Contacto': proveedor.CONTACTO || 'N/A',
            'Notas': proveedor.NOTAS || ''
          };
        });

        const wsProviders = XLSX.utils.json_to_sheet(providersData);
        XLSX.utils.book_append_sheet(wb, wsProviders, 'Proveedores');
      }
      
      // Agregar hoja principal al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');

      // Generar nombre de archivo
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `Resumen_Seleccion_${dateStr}.xlsx`;

      // Generar y descargar archivo
      XLSX.writeFile(wb, fileName);

      // Mostrar alerta de éxito
      alert(`✅ Archivo "${fileName}" generado exitosamente.\n\n📊 Resumen:\n• Productos: ${cart.length}\n• Unidades: ${totalsConProveedores.totalItems}\n• Proveedores seleccionados: ${Object.keys(selectedProveedores).length}\n• Ahorro total: ${formatCurrency(totalsConProveedores.totalAhorro)}`);

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('❌ Error al generar el archivo Excel. Por favor, intente nuevamente.');
    }
  };

  return (
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
        
        <Typography variant="body1" color="textSecondary">
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

      {/* Acciones */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Imprimir
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Exportar Excel
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
                  await handleConfirmarConProveedores();
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
                'Confirmar Pedido con Proveedores'
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

      {/* Notas adicionales */}
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
      </Paper>
    </Container>
  );
};

export default CheckoutPage;