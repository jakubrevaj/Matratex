'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Stack,
  TextField,
} from '@mui/material';
import axios from 'axios';

export default function HistoricalOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/historical`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Chyba pri načítaní archívu:', err));
  }, []);

  const filtered = orders.filter((order) => {
    const lower = search.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(lower) ||
      order.customer_name?.toLowerCase().includes(lower) ||
      order.ico?.toLowerCase().includes(lower) ||
      new Date(order.issue_date).toLocaleDateString('sk-SK').includes(lower)
    );
  });

  return (
    <TableContainer component={Paper} sx={{ mt: 4, p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Historické objednávky
      </Typography>

      <TextField
        fullWidth
        label="Hľadať podľa čísla, zákazníka, IČO alebo dátumu"
        variant="outlined"
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Table>
        <TableHead sx={{ bgcolor: '#e0e0e0' }}>
          <TableRow>
            <TableCell>Číslo objednávky</TableCell>
            <TableCell>Zákazník</TableCell>
            <TableCell>IČO</TableCell>
            <TableCell>Cena (€)</TableCell>
            <TableCell>Dátum</TableCell>
            <TableCell>Akcie</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>{order.order_number}</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.ico || '-'}</TableCell>
              <TableCell>{order.total_price}</TableCell>
              <TableCell>
                {new Date(order.issue_date).toLocaleDateString('sk-SK')}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      router.push(`/historical-orders/${order.id}`)
                    }
                  >
                    Detail
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
