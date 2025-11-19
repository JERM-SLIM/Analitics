// Filters.jsx - diseño mejorado
import React from "react";
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
  Chip
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from "@mui/icons-material";

const Filters = ({
  loading,
  stores,
  selectedStore,
  setSelectedStore,
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
  setTitleFilter
}) => {
  
  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedStore("all");
    setFromDate("");
    setToDate("");
    setStatusFilter("all");
    setTitleFilter("");
    setSortBy("unidades");
    setSortOrder("desc");
    setPage(0);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = 
    selectedStore !== "all" || 
    fromDate !== "" || 
    toDate !== "" || 
    statusFilter !== "all" || 
    titleFilter !== "" ||
    sortBy !== "unidades" ||
    sortOrder !== "desc";

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

  // Obtener etiqueta del ordenamiento
  const getSortLabel = (sort) => {
    const sortLabels = {
      "monto": "Monto Total",
      "utilidad": "Utilidad",
      "unidades": "Unidades"
    };
    return sortLabels[sort] || sort;
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
                {selectedStore !== "all" && (
                  <Chip
                    label={`Tienda: ${stores.find(s => s.seller_id?.toString() === selectedStore)?.nickname || selectedStore}`}
                    size="small"
                    sx={{ backgroundColor: "#42a5f5", color: "#fff", fontWeight: 500 }}
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
              </Box>
            )}
          </Box>

          <Grid container spacing={2} alignItems="center">
            {/* Selección de tienda */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: "#cfd8dc",
                    "&.Mui-focused": { color: "#42a5f5" }
                  }}
                >
                  Tienda
                </InputLabel>
                <Select
                  value={selectedStore || "all"}
                  onChange={(e) => {
                    setSelectedStore(e.target.value);
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
                  label="Tienda"
                >
                  <MenuItem value="all">
                    <Typography sx={{ color: "#cfd8dc" }}>
                      🏪 Todas las tiendas
                    </Typography>
                  </MenuItem>
                  {stores.map((s) => (
                    <MenuItem key={s.seller_id} value={s.seller_id?.toString() || ""}>
                      <Typography sx={{ color: "#fff" }}>
                        {s.nickname}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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

            {/* Filtro de ordenamiento */}
            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: "#cfd8dc",
                    "&.Mui-focused": { color: "#42a5f5" }
                  }}
                >
                  Ordenar por
                </InputLabel>
                <Select
                  value={sortBy || "unidades"}
                  onChange={(e) => {
                    setSortBy(e.target.value);
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
                  label="Ordenar por"
                >
                  <MenuItem value="unidades">📦 Unidades</MenuItem>
                  <MenuItem value="utilidad">💰 Utilidad</MenuItem>
                  <MenuItem value="monto">💵 Monto Total</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dirección de orden */}
            <Grid item xs={12} sm={6} md={1.2}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: "#cfd8dc",
                    "&.Mui-focused": { color: "#42a5f5" }
                  }}
                >
                  Orden
                </InputLabel>
                <Select
                  value={sortOrder || "desc"}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
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
                  label="Orden"
                >
                  <MenuItem value="desc">⬇️ Descendente</MenuItem>
                  <MenuItem value="asc">⬆️ Ascendente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12} sm={6} md={1.5}>
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
        </CardContent>
      </Card>
    </>
  );
};

export default Filters;