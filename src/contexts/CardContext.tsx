import React, { createContext, useState, useContext } from 'react';
import { PartResult, CartItem, PriceBreak } from '../types';  // Adjust the import path as necessary
import { convertToINR } from '@/app/api/search/route';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: PartResult) => void;
  removeFromCart: (id: string) => void;
  updateVolume: (id: string, newVolume: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: PartResult) => {
    const cartItem: CartItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      priceBreaks: item.priceBreaks
    };
    setItems((prevItems) => [...prevItems, cartItem]);
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateVolume = (id: string, newVolume: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          let newPriceBreak;
          let newUnitPrice;
  
          if (item.dataProvider === 'Rutronik') {
            const sortedPriceBreaks = item.priceBreaks.sort((a, b) => {
              if (a.quantity && b.quantity) {
                return a.quantity - b.quantity;
              }
              return 0;
            });
            
            newPriceBreak = sortedPriceBreaks[0]; 
            for (const pb of sortedPriceBreaks) {
              if (pb.quantity !== undefined && newVolume >= pb.quantity) {
                newPriceBreak = pb;
              } else {
                break;
              }
            }
            
            newUnitPrice = parseFloat(newPriceBreak.price || '0');
            newUnitPrice = convertToINR(newUnitPrice, 'EUR');
          } else if (item.dataProvider === 'Mouser') {
            newPriceBreak = item.priceBreaks.reduce((prev, current) => {
              return (current.Quantity !== undefined && current.Quantity <= newVolume && current.Quantity > (prev.Quantity ?? 0)) ? current : prev;
            }, { Quantity: 0, Price: '0' });
            newUnitPrice = parseFloat(newPriceBreak.Price || '0');
          } else if (item.dataProvider === 'Element14') {
            newPriceBreak = item.priceBreaks.reduce((prev, current) => {
              return (current.from ?? 0) <= newVolume && (current.from ?? 0) > (prev.from ?? 0) ? current : prev;
            }, { from: 0, to: 0, cost: 0 });
            newUnitPrice = newPriceBreak.cost || 0;
          } else {
            newPriceBreak = item.priceBreaks[0];
            newUnitPrice = item.unitPrice;
          }
  
          const newTotalPrice = newUnitPrice * newVolume;
  
          return {
            ...item,
            volume: newVolume,
            unitPrice: newUnitPrice,
            totalPrice: newTotalPrice,
          };
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateVolume }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};