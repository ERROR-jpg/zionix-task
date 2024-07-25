'use client'
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from '@mui/material';
import { PartResult } from '../types';
import { useCart } from '../contexts/CardContext';
import Cart from './Cart';

interface ResultsTableProps {
  results: PartResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item: PartResult) => {
    addToCart(item);
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  if (results.length === 0) {
    return <Typography>No results found.</Typography>;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Part Number</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Data Provider</TableCell>
              <TableCell>Volume</TableCell>
              <TableCell>Unit Price (INR)</TableCell>
              <TableCell>Total Price (INR)</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.partNumber}</TableCell>
                <TableCell>{result.manufacturer}</TableCell>
                <TableCell>{result.dataProvider}</TableCell>
                <TableCell>{result.volume}</TableCell>
                <TableCell>
                  {result.unitPrice ? `₹${result.unitPrice.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell>
                  {result.totalPrice ? `₹${result.totalPrice.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleAddToCart(result)}
                    disabled={index !== 0 || !result.unitPrice || !result.totalPrice}
                  >
                    Add to Cart
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Cart open={isCartOpen} onClose={handleCloseCart} />
    </>
  );
};

export default ResultsTable;