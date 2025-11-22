// components/PurchaseOrdersList.jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from "@mui/material";

const PurchaseOrdersList = ({ purchaseOrders }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'ordered': return 'primary';
      case 'received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ backgroundColor: "#1e2a38", color: "white", mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📋 Historial de Órdenes de Compra
        </Typography>

        {purchaseOrders.length === 0 ? (
          <Typography variant="body2" color="gray" sx={{ textAlign: "center", py: 4 }}>
            No hay órdenes de compra generadas
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: "#263238" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Productos</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Prioridad</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell sx={{ color: "white" }}>#{order.id.slice(-6)}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {order.products.length} productos
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.priority} 
                        color={getPriorityColor(order.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="info">
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseOrdersList;