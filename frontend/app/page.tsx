'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';

type OrderItem = {
  id: number;
  product_name: string;
  material_name: string;
  quantity: number;
  count: number;
  length: number;
  width: number;
  height: number;
  status?: string;
  order?: {
    id: number;
    order_number: string;
    customer?: { podnik: string };
  };
};

const statuses = [
  'pending',
  'to-production',
  'in-production',
  'completed',
  'invoiced',
  'archived', // ← nový stav
];
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#ffcccc'; // red
    case 'to-production':
      return '#ffffcc'; // yellow
    case 'in-production':
      return '#cce0ff'; // blue
    case 'completed':
      return '#ccffcc'; // green
    case 'invoiced':
      return '#ffffff'; // white
    case 'archived':
      return '#f0f0f0'; // grey or light neutral
    default:
      return 'inherit';
  }
};

export default function Home() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  const refreshItems = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/order-items`)
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Chyba pri načítaní položiek:', err));
  };

  useEffect(() => {
    refreshItems();

    const interval = setInterval(() => {
      refreshItems();
    }, 300000); // každých 5 minút = 300 000 ms

    return () => clearInterval(interval); // vyčistenie intervalu
  }, []);

  const filteredItems = items.filter((item) => {
    const lower = search.toLowerCase();
    return (
      (item.product_name?.toLowerCase().includes(lower) ||
        item.material_name?.toLowerCase().includes(lower) ||
        item.order?.order_number?.toLowerCase().includes(lower) ||
        item.order?.customer?.podnik?.toLowerCase().includes(lower)) &&
      (statusFilter === '' || item.status === statusFilter)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Položky objednávok
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Hľadať podľa produktu, materiálu, objednávky alebo zákazníka"
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
        <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="outlined" fullWidth onClick={refreshItems}>
            Obnoviť
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#e0e0e0' }}>
            <TableRow>
              <TableCell>Produkt</TableCell>
              <TableCell>Materiál</TableCell>
              <TableCell>Množstvo</TableCell>
              <TableCell>Rozmery (d × š × v)</TableCell>
              <TableCell>Objednávka</TableCell>
              <TableCell>Zákazník</TableCell>
              <TableCell>Stav</TableCell>
              <TableCell>Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  backgroundColor: getStatusColor(item.status || ''),
                }}
              >
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.material_name || '-'}</TableCell>
                <TableCell>
                  {item.status === 'in-production'
                    ? `${item.count ?? 0} / ${item.quantity}`
                    : item.quantity}
                </TableCell>
                <TableCell>{`${item.length} × ${item.width} × ${item.height}`}</TableCell>
                <TableCell>{item.order?.order_number || '-'}</TableCell>
                <TableCell>{item.order?.customer?.podnik || '-'}</TableCell>
                <TableCell>{item.status || '-'}</TableCell>
                <TableCell align="center">
                  {item.order?.id && (
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => router.push(`/orders/${item.order?.id}`)}
                      title="Zobraziť objednávku"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
