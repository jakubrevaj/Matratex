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
  Container,
  Box,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { alpha } from '@mui/material/styles';
import { useDebounce } from 'use-debounce';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '@/services/api';
import { getOrderStatusColor, getOrderStatusText, ORDER_STATUSES } from '@/utils/statusHelpers';
import EmptyState from '@/components/EmptyState';

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
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${API_URL}/orders`)
      .then((res) => {
        setOrders(res.data);
        setFilteredOrders(res.data);
      })
      .catch((err) => console.error('Chyba pri načítavaní objednávok:', err));
  }, []);

  useEffect(() => {
    const lower = debouncedSearch.toLowerCase();
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
  }, [debouncedSearch, orders, statusFilter, sortByDateAsc]);

  const handleExportToExcel = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/export/excel`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `objednavky_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Objednávky boli úspešne exportované');
    } catch (error) {
      console.error('Chyba pri exporte:', error);
      toast.error('Nepodarilo sa exportovať objednávky');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          borderLeft: `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <ListAltIcon />
          Zoznam objednávok
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prehľad všetkých objednávok a ich stavov
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'secondary.main',
            '&:hover': { backgroundColor: 'secondary.dark' },
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
            boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
          }}
          onClick={() => router.push('/invoices/new')}
          startIcon={<ReceiptLongIcon />}
        >
          Vytvoriť faktúru
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: 'warning.main',
            '&:hover': { backgroundColor: 'warning.dark' },
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
            boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
          onClick={async () => {
            try {
              await axios.post(`${API_URL}/orders/archive-invoiced`);
              toast.success(
                'Archivované všetky objednávky so stavom "invoiced".'
              );
              location.reload(); // reload na obnovenie zoznamu
            } catch (err) {
              console.error('Archivácia zlyhala:', err);
              toast.error('Chyba pri archivácii objednávok.');
            }
          }}
          startIcon={<ArchiveIcon />}
        >
          Archivovať fakturované objednávky
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Hľadať podľa čísla, zákazníka alebo IČO"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setSearch('')}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
              {ORDER_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {getOrderStatusText(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="success"
            onClick={handleExportToExcel}
            fullWidth
            sx={{
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              py: 1.5,
            }}
            startIcon={<FileDownloadIcon />}
          >
            Export
          </Button>
        </Grid>
      </Grid>

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
                  color: 'primary.main',
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
                  color: 'primary.main',
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
                  color: 'primary.main',
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
                  color: 'primary.main',
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
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Stav výroby
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <TableSortLabel
                  active
                  direction={sortByDateAsc ? 'asc' : 'desc'}
                  onClick={() => setSortByDateAsc((prev) => !prev)}
                  sx={{ color: 'primary.main' }}
                >
                  Dátum vystavenia
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={<ListAltIcon fontSize="large" />}
                    title={
                      search || statusFilter
                        ? 'Nenašli sa žiadne objednávky'
                        : 'Zatiaľ žiadne objednávky'
                    }
                    message={
                      search || statusFilter
                        ? 'Skúste zmeniť filtre alebo vyhľadávanie'
                        : 'Začnite vytvorením novej objednávky'
                    }
                    action={
                      !search && !statusFilter
                        ? {
                            label: 'Vytvoriť novú objednávku',
                            icon: <AddCircleIcon />,
                            onClick: () => router.push('/orders/new'),
                          }
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                hover
                sx={{
                  backgroundColor: getOrderStatusColor(
                    order.production_status || ''
                  ),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.6),
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <TableCell>{order.order_number}</TableCell>
                <TableCell>{order.customer?.podnik || 'Neznámy'}</TableCell>
                <TableCell>{order.customer?.ico || '-'}</TableCell>
                <TableCell>{order.total_price}</TableCell>
                <TableCell>
                  {order.production_status
                    ? getOrderStatusText(order.production_status)
                    : '-'}
                </TableCell>
                <TableCell>
                  {new Date(order.issue_date).toLocaleDateString('sk-SK')}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/orders/${order.id}`)}
                      sx={{
                        border: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                        },
                      }}
                      startIcon={<VisibilityIcon />}
                    >
                      Detail
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => router.push(`/orders/edit/${order.id}`)}
                      sx={{
                        backgroundColor: 'success.main',
                        '&:hover': { backgroundColor: 'success.dark' },
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                      }}
                      startIcon={<EditIcon />}
                    >
                      Upraviť
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
