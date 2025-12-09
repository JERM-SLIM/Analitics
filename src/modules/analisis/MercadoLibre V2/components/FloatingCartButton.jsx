import React from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";

const FloatingCartButton = ({ cart, onClick }) => {
  return (
    <Tooltip title="Ver carrito de selección">
      <IconButton
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: '#42a5f5',
          color: '#fff',
          width: 60,
          height: 60,
          '&:hover': {
            backgroundColor: '#2196f3'
          },
          boxShadow: '0 4px 20px rgba(66, 165, 245, 0.5)',
          zIndex: 1000
        }}
      >
        <Badge 
          badgeContent={cart.length} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 28 }} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default FloatingCartButton;