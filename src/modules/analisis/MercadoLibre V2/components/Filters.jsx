// Filters.jsx - CORREGIDO
import React, { useState } from "react";
import {
  Grid,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Slider,
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const Filters = ({
  loading,
  //stores,
  //selectedStore,
  //setSelectedStore,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  fetchData,
  setPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  titleFilter,
  setTitleFilter,
  // 🆕 RECIBIR LOS FILTROS DEL HOOK
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
  setOnlyVariablePrice
}) => {

  // Estado local solo para UI (mostrar/ocultar filtros avanzados)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    //setSelectedStore("all");
    setFromDate("");
    setToDate("");
    setStatusFilter("all");
    setTitleFilter("");
    setSortBy("unidades");
    setSortOrder("desc");

    // 🆕 LIMPIAR LOS NUEVOS FILTROS
    setMargenMin("");
    setMargenMax("");
    setRoiMin("");
    setRoiMax("");
    setStockRiskFilter("all");
    setAbcFilter("all");
    setOnlyWithStockRisk(false);
    setOnlyVariablePrice(false);

    setPage(0);
  };

  // Verificar si hay filtros activos (actualizado)
  const hasActiveFilters =
 //   selectedStore !== "all" ||
    fromDate !== "" ||
    toDate !== "" ||
    statusFilter !== "all" ||
    titleFilter !== "" ||
    sortBy !== "unidades" ||
    sortOrder !== "desc" ||
    // 🆕 INCLUIR NUEVOS FILTROS
    margenMin !== "" ||
    margenMax !== "" ||
    roiMin !== "" ||
    roiMax !== "" ||
    stockRiskFilter !== "all" ||
    abcFilter !== "all" ||
    onlyWithStockRisk ||
    onlyVariablePrice;

  // Obtener etiqueta del status para mostrar
  const getStatusLabel = (status) => {
    const statusLabels = {
      "all": "Todos",
      "active": "Activo",
      "paused": "Pausado",
      "closed": "Finalizado"
    };
    return statusLabels[status] || status;
  };

  // Obtener etiqueta del riesgo de stock
  const getStockRiskLabel = (risk) => {
    const riskLabels = {
      "all": "Todos",
      "SIN_STOCK": "Sin Stock",
      "ALTO_RIESGO": "Alto Riesgo",
      "MEDIO_RIESGO": "Medio Riesgo",
      "BAJO_RIESGO": "Bajo Riesgo"
    };
    return riskLabels[risk] || risk;
  };

  // Obtener etiqueta de clasificación ABC
  const getAbcLabel = (abc) => {
    const abcLabels = {
      "all": "Todas",
      "A": "Clase A (Alto impacto)",
      "B": "Clase B (Medio impacto)",
      "C": "Clase C (Bajo impacto)"
    };
    return abcLabels[abc] || abc;
  };

  // Función para aplicar filtros y buscar
  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  // 🆕 FUNCIÓN PARA MANEJAR SLIDERS (convertir de número a string)
  const handleMargenChange = (e, newValue) => {
    setMargenMin(newValue[0].toString());
    setMargenMax(newValue[1].toString());
    setPage(0);
  };

  const handleRoiChange = (e, newValue) => {
    setRoiMin(newValue[0].toString());
    setRoiMax(newValue[1].toString());
    setPage(0);
  };

const getSelectedDaysAndHours = () => {
  if (!fromDate || !toDate) return null;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  const diffMs = to - from;
  if (diffMs <= 0) return null;

  const totalHours = diffMs / (1000 * 60 * 60);

  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);

  if (days === 0 && hours === 0) return null;

  // Formato bonito: "2 días 5 horas" o "0 días 12 horas"
  return `${days} día${days !== 1 ? "s" : ""} ${hours} hora${hours !== 1 ? "s" : ""}`;
};


  return (
    <>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={32} sx={{ color: "#42a5f5" }} />
          <Typography sx={{ ml: 1, color: "#fff", fontWeight: 500 }}>
            Buscando datos...
          </Typography>
        </Box>
      )}

      <Card
        sx={{
          backgroundColor: "rgba(30, 42, 56, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          mb: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header del filtro */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <FilterIcon sx={{ color: "#42a5f5", mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
                background: "linear-gradient(45deg, #42a5f5, #66bb6a)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Filtros y Ordenamiento
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            

            {/* Chips de filtros activos */}
            {hasActiveFilters && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: "#cfd8dc", mr: 1 }}>
                  Filtros activos:
                </Typography>
                  {/*dias y horas seleccionados */}
                {getSelectedDaysAndHours() && (
                  <Chip
                    label={`Rango: ${getSelectedDaysAndHours()}`}
                    size="small"
                    sx={{ backgroundColor: "#29b6f6", color: "#fff", fontWeight: 500 }}
                  />
                )}

                {statusFilter !== "all" && (
                  <Chip
                    label={`Status: ${getStatusLabel(statusFilter)}`}
                    size="small"
                    sx={{
                      backgroundColor:
                        statusFilter === "active" ? "#66bb6a" :
                        statusFilter === "paused" ? "#ffa726" : "#ef5350",
                      color: "#fff",
                      fontWeight: 500
                    }}
                  />
                )}
                {titleFilter && (
                  <Chip
                    label={`Búsqueda: ${titleFilter}`}
                    size="small"
                    sx={{ backgroundColor: "#9575cd", color: "#fff", fontWeight: 500 }}
                  />
                )}
                {/* 🆕 CHIPS PARA NUEVOS FILTROS */}
                {stockRiskFilter !== "all" && (
                  <Chip
                    label={`Riesgo: ${getStockRiskLabel(stockRiskFilter)}`}
                    size="small"
                    sx={{ backgroundColor: "#ffa726", color: "#fff", fontWeight: 500 }}
                  />
                )}
                {abcFilter !== "all" && (
  <Chip
    label={`ABC: ${getAbcLabel(abcFilter)}`}
    size="small"
    sx={{ backgroundColor: "#9575cd", color: "#fff", fontWeight: 500 }}
  />
)}
                {onlyWithStockRisk && (
                  <Chip
                    label="Con Riesgo Stock"
                    size="small"
                    sx={{ backgroundColor: "#ffa726", color: "#fff", fontWeight: 500 }}
                  />
                )}
                {onlyVariablePrice && (
                  <Chip
                    label="Precio Variable"
                    size="small"
                    sx={{ backgroundColor: "#9575cd", color: "#fff", fontWeight: 500 }}
                  />
                )}
              </Box>
            )}
          </Box>
          {/* Filtros básicos */}
          <Grid container spacing={2} alignItems="center">
            {/* Fechas */}
            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                type="date"
                label="Desde"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  style: { color: "#cfd8dc" },
                  shrink: true
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#fff",
                    py: 1.5
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(38, 50, 56, 0.8)",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(66, 165, 245, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42a5f5",
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                type="date"
                label="Hasta"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  style: { color: "#cfd8dc" },
                  shrink: true
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#fff",
                    py: 1.5
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(38, 50, 56, 0.8)",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(66, 165, 245, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42a5f5",
                    }
                  }
                }}
              />
            </Grid>

            {/* Filtro por Status */}
            <Grid item xs={12} sm={6} md={1.8}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: "#cfd8dc",
                    "&.Mui-focused": { color: "#42a5f5" }
                  }}
                >
                  Status
                </InputLabel>
                <Select
                  value={statusFilter || "all"}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    backgroundColor: "rgba(38, 50, 56, 0.8)",
                    color: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(66, 165, 245, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#42a5f5",
                    }
                  }}
                  label="Status"
                >
                  <MenuItem value="all">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#cfd8dc', mr: 1 }} />
                      <Typography sx={{ color: "#000000ff" }}>Todos</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="active">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a', mr: 1 }} />
                      <Typography sx={{ color: "#000000ff" }}>Activo</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="paused">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffa726', mr: 1 }} />
                      <Typography sx={{ color: "#000000ff" }}>Pausado</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="closed">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef5350', mr: 1 }} />
                      <Typography sx={{ color: "#000000ff" }}>Finalizado</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Título */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Buscar por título"
                value={titleFilter}
                onChange={(e) => {
                  setTitleFilter(e.target.value);
                  setPage(0);
                }}
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: "#cfd8dc", mr: 1 }} />
                }}
                InputLabelProps={{
                  style: { color: "#cfd8dc" }
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(38, 50, 56, 0.8)",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(66, 165, 245, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42a5f5",
                    }
                  }
                }}
              />
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12} sm={6} md={1.2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Aplicar filtros">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchData}
                    startIcon={<RefreshIcon />}
                    sx={{
                      height: "56px",
                      flex: 1,
                      borderRadius: 2,
                      background: "linear-gradient(45deg, #42a5f5, #478ed1)",
                      boxShadow: "0 4px 15px rgba(66, 165, 245, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #478ed1, #42a5f5)",
                        boxShadow: "0 6px 20px rgba(66, 165, 245, 0.4)",
                      }
                    }}
                  >
                    Buscar
                  </Button>
                </Tooltip>

                {hasActiveFilters && (
                  <Tooltip title="Limpiar todos los filtros">
                    <IconButton
                      onClick={clearAllFilters}
                      sx={{
                        height: "56px",
                        width: "56px",
                        backgroundColor: "rgba(239, 83, 80, 0.1)",
                        border: "1px solid rgba(239, 83, 80, 0.3)",
                        color: "#ef5350",
                        "&:hover": {
                          backgroundColor: "rgba(239, 83, 80, 0.2)",
                        }
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Grid>

           {/* Filtros avanzados - CORREGIDO */}
          <Collapse in={showAdvancedFilters}>
            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: "#66bb6a" }} />
                Filtros Avanzados de Performance
              </Typography>

              <Grid container spacing={3}>
                {/* Filtros de Stock e Inventario - CORREGIDO */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "#cfd8dc" }}>Riesgo Stock</InputLabel>
                    <Select
                      value={stockRiskFilter}
                      onChange={(e) => {
                        setStockRiskFilter(e.target.value);
                        setPage(0);
                      }}
                      sx={{
                        backgroundColor: "rgba(38, 50, 56, 0.8)",
                        color: "#fff",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        }
                      }}
                      label="Riesgo Stock"
                    >
                      <MenuItem value="all">Todos los niveles</MenuItem>
                      <MenuItem value="SIN_STOCK">❌ Sin Stock</MenuItem>
                      <MenuItem value="ALTO_RIESGO">⚠️ Alto Riesgo</MenuItem>
                      <MenuItem value="MEDIO_RIESGO">📉 Medio Riesgo</MenuItem>
                      <MenuItem value="BAJO_RIESGO">✅ Bajo Riesgo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

               {/* Filtro Clasificación ABC - DESCOMENTADO */}
<Grid item xs={12} sm={6} md={3}>
  <FormControl fullWidth>
    <InputLabel sx={{ color: "#cfd8dc" }}>Clasificación ABC</InputLabel>
    <Select
      value={abcFilter}
      onChange={(e) => {
        setAbcFilter(e.target.value);
        setPage(0);
      }}
      sx={{
        backgroundColor: "rgba(38, 50, 56, 0.8)",
        color: "#fff",
        borderRadius: 2,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255, 255, 255, 0.2)",
        }
      }}
      label="Clasificación ABC"
    >
      <MenuItem value="all">📊 Todas las clases</MenuItem>
      <MenuItem value="A">🅰️ Clase A (Alto impacto)</MenuItem>
      <MenuItem value="B">🅱️ Clase B (Medio impacto)</MenuItem>
      <MenuItem value="C">🅲️ Clase C (Bajo impacto)</MenuItem>
    </Select>
  </FormControl>
</Grid>
                {/* Switches para filtros especiales - CORREGIDOS */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={onlyWithStockRisk}
                        onChange={(e) => {
                          setOnlyWithStockRisk(e.target.checked);
                          setPage(0);
                        }}
                        sx={{
                          color: "#ffa726",
                          "&.Mui-checked": {
                            color: "#ffa726",
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: "#cfd8dc", fontSize: '0.9rem' }}>
                        Solo con riesgo de stock
                      </Typography>
                    }
                  />
                </Grid>



                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={onlyVariablePrice}
                        onChange={(e) => {
                          setOnlyVariablePrice(e.target.checked);
                          setPage(0);
                        }}
                        sx={{
                          color: "#9575cd",
                          "&.Mui-checked": {
                            color: "#9575cd",
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: "#cfd8dc", fontSize: '0.9rem' }}>
                        Solo precios variables
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* Ordenamiento (ahora en sección separada) */}
          <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
              🔄 Ordenamiento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#cfd8dc" }}>Ordenar por</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(0);
                    }}
                    sx={{
                      backgroundColor: "rgba(38, 50, 56, 0.8)",
                      color: "#fff",
                      borderRadius: 2,
                    }}
                    label="Ordenar por"
                  >
                    <MenuItem value="unidades">📦 Unidades Vendidas</MenuItem>
                    <MenuItem value="utilidad">💰 Utilidad Total</MenuItem>
                    <MenuItem value="monto">💵 Monto Total</MenuItem>
                    <MenuItem value="margen_neto">📈 Margen Neto %</MenuItem>
                    <MenuItem value="roi_publicidad">🎯 ROI Publicidad</MenuItem>
                    <MenuItem value="ticket_promedio">🎫 Ticket Promedio</MenuItem>
                    <MenuItem value="stock_disponible">📦 Stock Disponible</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#cfd8dc" }}>Orden</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      setPage(0);
                    }}
                    sx={{
                      backgroundColor: "rgba(38, 50, 56, 0.8)",
                      color: "#fff",
                      borderRadius: 2,
                    }}
                    label="Orden"
                  >
                    <MenuItem value="desc">⬇️ Descendente</MenuItem>
                    <MenuItem value="asc">⬆️ Ascendente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default Filters;