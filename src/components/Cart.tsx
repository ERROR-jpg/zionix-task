'use client'; 
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../contexts/CardContext';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ open, onClose }) => {
  const { items, updateVolume, removeFromCart } = useCart();
    
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          My Cart
        </Typography>
        <List>
          {items.map((item: any) => (
            <ListItem key={item.id} alignItems="flex-start">
              <ListItemText
                primary={item.partNumber}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {item.manufacturer} - {item.dataProvider}
                    </Typography>
                    <br />
                    Unit Price: ₹{item.unitPrice?.toFixed(2) ?? 'N/A'}
                    <br />
                    Total: ₹{item.totalPrice?.toFixed(2) ?? 'N/A'}
                  </>
                }
              />
              
              <TextField
                type="number"
                value={item.volume}
                onChange={(e) => updateVolume(item.id, parseInt(e.target.value, 10))}
                size="small"
                sx={{ width: 100, mr: 1 }}
              />
              <IconButton onClick={() => removeFromCart(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Cart;