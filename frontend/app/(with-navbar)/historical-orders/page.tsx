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
  Container,
  Box,
  useTheme,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import { API_URL } from '@/services/api';

interface HistoricalOrder {
  id: number;
  order_number: string;
  customer_name: string;
  ico?: string;
  total_price: number;
  issue_date: string;
}

export default function HistoricalOrdersPage() {
  const theme = useTheme();
  const [orders, setOrders] = useState<HistoricalOrder[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${API_URL}/historical`)
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          borderLeft: `3px solid #ff9800`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: '#ff9800',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <HistoryIcon />
          Historické objednávky
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prehľad všetkých historických objednávok
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Hľadať podľa čísla, zákazníka, IČO alebo dátumu"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#ff9800',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Číslo objednávky
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#ff9800',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Zákazník
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#ff9800',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                IČO
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#ff9800',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Cena (€)
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#ff9800',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Dátum
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#ff9800',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Akcie
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((order) => (
              <TableRow
                key={order.id}
                sx={{
                  backgroundColor: 'background.paper',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: alpha('#ff9800', 0.05),
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
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
                      sx={{
                        border: '2px solid',
                        borderColor: '#ff9800',
                        color: '#ff9800',
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#ff9800',
                          color: 'common.white',
                          boxShadow: `0 2px 8px ${alpha('#ff9800', 0.3)}`,
                        },
                      }}
                      startIcon={<VisibilityIcon />}
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
    </Container>
  );
}
