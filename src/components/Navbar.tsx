'use client'; 
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Cart from './Cart';

const Navbar: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Zionix Assignment
          </Typography>
          <Button color="inherit" onClick={() => setIsCartOpen(true)}>
            <ShoppingCartIcon />
          </Button>
        </Toolbar>
      </AppBar>
      <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;