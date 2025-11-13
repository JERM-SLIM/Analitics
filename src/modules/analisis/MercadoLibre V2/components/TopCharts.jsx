import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";

const TopCharts = ({ topVentas, topUtilidad }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: "#1e2a38", borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
              Top 10 por Ventas
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topVentas} margin={{ top: 20, right: 20, left: -12, bottom: 0 }}>
                <XAxis dataKey="titulo" tick={{ fontSize: 12, fill: "#cfd8dc" }} />
                <YAxis tick={{ fill: "#cfd8dc" }} />
                <RechartsTooltip
                  formatter={(value, name, props) => [value, name]}
                  labelFormatter={(label, payload) => `Producto: ${label}`}
                />
                <Legend wrapperStyle={{ color: "#fff" }} />
                <Bar dataKey="vendidos" fill="#42a5f5" radius={[6, 6, 0, 0]} barSize={18} name="Vendidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ backgroundColor: "#1e2a38", borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
              Top 10 por Utilidad
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topUtilidad} margin={{ top: 20, right: 20, left: -12, bottom: 0 }}>
                <XAxis dataKey="titulo" tick={{ fontSize: 12, fill: "#cfd8dc" }} />
                <YAxis tick={{ fill: "#cfd8dc" }} />
                <RechartsTooltip
                  formatter={(value, name, props) => [value, name]}
                  labelFormatter={(label, payload) => `Producto: ${label}`}
                />
                <Legend wrapperStyle={{ color: "#fff" }} />
                <Bar dataKey="utilidad" fill="#66bb6a" radius={[6, 6, 0, 0]} barSize={18} name="Utilidad" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TopCharts;