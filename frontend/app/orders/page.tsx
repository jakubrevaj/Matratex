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
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TableSortLabel,
} from '@mui/material';
import axios from 'axios';

const statuses = ['pending', 'in-production', 'completed', 'invoiced'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#ffcccc'; // light red
    case 'in-production':
      return '#cce0ff'; // light blue
    case 'completed':
      return '#ccffcc'; // light green
    default:
      return 'inherit'; // normal
  }
};

type Order = {
  id: number;
  order_number: string;
  issue_date: string;
  customer: {
    podnik: string;
    ico?: string;
  };
  total_price: number;
  production_status?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
      .then((res) => {
        setOrders(res.data);
        setFilteredOrders(res.data);
      })
      .catch((err) => console.error('Chyba pri načítavaní objednávok:', err));
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        (order.order_number.toLowerCase().includes(lower) ||
          order.customer?.podnik.toLowerCase().includes(lower) ||
          order.customer?.ico?.includes(lower)) &&
        (statusFilter === '' || order.production_status === statusFilter)
    );

    if (sortByDateAsc) {
      filtered.sort((a, b) => a.issue_date.localeCompare(b.issue_date));
    } else {
      filtered.sort((a, b) => b.issue_date.localeCompare(a.issue_date));
    }

    setFilteredOrders(filtered);
  }, [search, orders, statusFilter, sortByDateAsc]);

  return (
    <TableContainer component={Paper} sx={{ mt: 4, p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Zoznam objednávok
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mb: 2 }}
        onClick={async () => {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/orders/archive-invoiced`
            );
            alert('Archivované všetky objednávky so stavom "invoiced".');
            location.reload(); // reload na obnovenie zoznamu
          } catch (err) {
            console.error('Archivácia zlyhala:', err);
            alert('Chyba pri archivácii objednávok.');
          }
        }}
      >
        Archivovať fakturované objednávky
      </Button>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Hľadať podľa čísla, zákazníka alebo IČO"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Stav výroby</InputLabel>
            <Select
              value={statusFilter}
              label="Stav výroby"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Všetky</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Table>
        <TableHead sx={{ bgcolor: '#e0e0e0' }}>
          <TableRow>
            <TableCell>Číslo objednávky</TableCell>
            <TableCell>Zákazník</TableCell>
            <TableCell>IČO</TableCell>
            <TableCell>Cena (€)</TableCell>
            <TableCell>Stav výroby</TableCell>
            <TableCell>
              <TableSortLabel
                active
                direction={sortByDateAsc ? 'asc' : 'desc'}
                onClick={() => setSortByDateAsc((prev) => !prev)}
              >
                Dátum vystavenia
              </TableSortLabel>
            </TableCell>
            <TableCell>Akcie</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow
              key={order.id}
              hover
              sx={{
                backgroundColor: getStatusColor(order.production_status || ''),
              }}
            >
              <TableCell>{order.order_number}</TableCell>
              <TableCell>{order.customer?.podnik || 'Neznámy'}</TableCell>
              <TableCell>{order.customer?.ico || '-'}</TableCell>
              <TableCell>{order.total_price}</TableCell>
              <TableCell>{order.production_status ?? '-'}</TableCell>
              <TableCell>
                {new Date(order.issue_date).toLocaleDateString('sk-SK')}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    Detail
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => router.push(`/orders/edit/${order.id}`)}
                  >
                    Upraviť
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
