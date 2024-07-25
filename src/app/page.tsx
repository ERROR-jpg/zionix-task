'use client';

import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import PartSearch from '../components/PartSearch';
import ResultsTable from '../components/ResultsTable';
import { PartResult } from '../types';

export default function Home() {
  const [results, setResults] = useState<PartResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (partNumber: string, volume: number) => {
    try {
      setError(null);
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partNumber, volume }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unexpected error occurred');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setResults([]);
    }
  };

  return (
    <Container maxWidth="lg">
      <PartSearch onSearch={handleSearch} />
      {error && <Typography color="error">{error}</Typography>}
      <ResultsTable results={results} />
    </Container>
  );
}