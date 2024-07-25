'use client'; 
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

interface PartSearchProps {
  onSearch: (partNumber: string, volume: number) => void;
}

const PartSearch: React.FC<PartSearchProps> = ({ onSearch }) => {
  const [partNumber, setPartNumber] = useState('');
  const [volume, setVolume] = useState('');

  const handleSearch = () => {
    if (partNumber && volume) {
      onSearch(partNumber, parseInt(volume, 10));
    }
  };

  return (
    
    <div style={{marginTop: '40px'}}>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        label="Part Number"
        value={partNumber}
        onChange={(e) => setPartNumber(e.target.value)}
      />
      <TextField
        label="Volume"
        type="number"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />
      <Button variant="contained" onClick={handleSearch}>
        Enter
      </Button>
    </Box>
    </div>
  );
};

export default PartSearch;