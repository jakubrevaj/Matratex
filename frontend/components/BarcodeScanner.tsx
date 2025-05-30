'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
} from '@mui/material';

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  count: number;
  status: string;
};

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState('');
  const [message, setMessage] = useState('');
  const [itemInfo, setItemInfo] = useState<{
    order_number: string;
    product_name: string;
    produced_count: number;
    quantity: number;
    status: string;
  } | null>(null);

  const [items, setItems] = useState<OrderItem[]>([]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/order-items`
      );
      const filtered = res.data.filter(
        (item: OrderItem) =>
          item.status === 'in-production' || item.status === 'completed'
      );
      setItems(filtered);
    } catch (err) {
      console.error('Chyba pri načítaní položiek:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 5 * 60 * 1000); // každých 5 minút
    return () => clearInterval(interval);
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setMessage('⚠️ Zadaj čiarový kód.');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/production/scan`,
        { barcode }
      );
      setItemInfo(res.data);
      setMessage(res.data.message);
      setBarcode('');
      fetchItems(); // refresh po skene
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || '❌ Nastala chyba pri skenovaní.'
      );
      setItemInfo(null);
      setBarcode('');
    }
  };

  const getRowColor = (status: string) => {
    if (status === 'in-production') return '#cce0ff'; // svetlomodrá
    if (status === 'completed') return '#ccffcc'; // svetlozelená
    return 'inherit';
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleScan}>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            label="Naskenuj čiarový kód"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        {message && (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        {itemInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography>
              <strong>Objednávka:</strong> {itemInfo.order_number}
            </Typography>
            <Typography>
              <strong>Produkt:</strong> {itemInfo.product_name}
            </Typography>
            <Typography>
              <strong>Vyrobené:</strong> {itemInfo.produced_count}/
              {itemInfo.quantity}
            </Typography>
            <Typography>
              <strong>Aktuálny stav:</strong> {itemInfo.status}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={fetchItems} sx={{ mb: 1 }}>
          Obnoviť zoznam
        </Button>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{ backgroundColor: getRowColor(item.status) }}
                >
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>
                    {item.count ?? 0} / {item.quantity}
                  </TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
