'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha } from '@mui/material/styles';
import { fetchInvoices, fetchInvoiceStats, API_URL } from '@/services/api';
import { getInvoiceStatusText, getInvoiceStatusColor } from '@/utils/statusHelpers';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_price: number;
  created_at: string;
  order_number: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'partially_paid';
}

interface InvoiceStats {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
}

type SortField = 'invoice_number' | 'customer_name' | 'total_price' | 'created_at' | 'status';
type SortOrder = 'asc' | 'desc';

export default function InvoicesPage() {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const router = useRouter();

  const loadInvoices = async (page = 1, searchTerm = '', status = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchInvoices({
        page,
        limit: 10,
        search: searchTerm,
        status: status || undefined,
      });

      if (response.success) {
        setInvoices(response.data);
        setTotalPages(response.totalPages);
        setTotalInvoices(response.total);
      } else {
        setError('Nepodarilo sa načítať faktúry');
      }
    } catch (err) {
      console.error('Chyba pri načítavaní faktúr:', err);
      setError('Chyba pri načítavaní faktúr');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchInvoiceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Chyba pri načítavaní štatistík:', err);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadInvoices(1, search, statusFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, statusFilter]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    loadInvoices(page, search, statusFilter);
  };

  const handleExportToExcel = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(
        `${API_URL}/invoices/export/excel?${queryParams.toString()}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faktury_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Faktúry boli úspešne exportované');
    } catch (error) {
      console.error('Chyba pri exporte:', error);
      toast.error('Nepodarilo sa exportovať faktúry');
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'invoice_number':
        aValue = a.invoice_number;
        bValue = b.invoice_number;
        break;
      case 'customer_name':
        aValue = a.customer_name;
        bValue = b.customer_name;
        break;
      case 'total_price':
        aValue = Number(a.total_price);
        bValue = Number(b.total_price);
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
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
          borderLeft: `3px solid ${theme.palette.secondary.main}`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: 'secondary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <ReceiptLongIcon />
          Faktúry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prehľad všetkých faktúr a ich stavov
        </Typography>
      </Box>

      {/* Štatistiky */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'primary.light' }}>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{ color: '#ffffff', fontWeight: 'bold' }}
                >
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Celkom faktúr
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{ color: '#ffffff', fontWeight: 'bold' }}
                >
                  {stats.paid}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zaplatené
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{ color: '#ffffff', fontWeight: 'bold' }}
                >
                  {stats.unpaid}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nezaplatené
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'error.light' }}>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{ color: '#ffffff', fontWeight: 'bold' }}
                >
                  {stats.overdue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Po splatnosti
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
          Zoznam faktúr ({totalInvoices})
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/invoices/new')}
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
          startIcon={<AddIcon />}
        >
          Vytvoriť novú faktúru
        </Button>
      </Box>

      {/* Filtre */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Hľadať podľa faktúry, zákazníka alebo objednávky"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Stav</InputLabel>
          <Select
            value={statusFilter}
            label="Stav"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Všetky</MenuItem>
            <MenuItem value="paid">Zaplatené</MenuItem>
            <MenuItem value="unpaid">Nezaplatené</MenuItem>
            <MenuItem value="overdue">Po splatnosti</MenuItem>
            <MenuItem value="partially_paid">Čiastočne zaplatené</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="success"
          onClick={handleExportToExcel}
          sx={{
            borderRadius: 2,
            fontWeight: 'bold',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            whiteSpace: 'nowrap',
          }}
          startIcon={<FileDownloadIcon />}
        >
          Exportovať do Excelu
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: 'hidden',
          backgroundColor: '#faf5fc',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0e8f5' }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <TableSortLabel
                  active={sortField === 'invoice_number'}
                  direction={sortField === 'invoice_number' ? sortOrder : 'asc'}
                  onClick={() => handleSort('invoice_number')}
                >
                  Faktúra
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <TableSortLabel
                  active={sortField === 'customer_name'}
                  direction={sortField === 'customer_name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customer_name')}
                >
                  Zákazník
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Objednávka
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <TableSortLabel
                  active={sortField === 'total_price'}
                  direction={sortField === 'total_price' ? sortOrder : 'asc'}
                  onClick={() => handleSort('total_price')}
                >
                  Cena bez DPH
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Cena s DPH (23%)
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Stav
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <TableSortLabel
                  active={sortField === 'created_at'}
                  direction={sortField === 'created_at' ? sortOrder : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Dátum
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'secondary.main',
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
            {!loading && invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    icon={<ReceiptLongIcon fontSize="large" />}
                    title={
                      search || statusFilter
                        ? 'Nenašli sa žiadne faktúry'
                        : 'Zatiaľ žiadne faktúry'
                    }
                    message={
                      search || statusFilter
                        ? 'Skúste zmeniť filtre alebo vyhľadávanie'
                        : 'Faktúry sa zobrazia po ich vytvorení'
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              !loading &&
              sortedInvoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  sx={{
                    backgroundColor: '#f8f4fb',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.8),
                      transform: 'scale(1.01)',
                      transition: 'all 0.2s ease',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                    },
                  }}
                >
                  <TableCell>{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customer_name}</TableCell>
                  <TableCell>{inv.order_number}</TableCell>
                  {(() => {
                    const net = inv.total_price ? Number(inv.total_price) : 0;
                    const gross = +(net * 1.23).toFixed(2);
                    return (
                      <>
                        <TableCell>
                          {net ? net.toFixed(2) + ' €' : '–'}
                        </TableCell>
                        <TableCell>
                          {net ? gross.toFixed(2) + ' €' : '–'}
                        </TableCell>
                      </>
                    );
                  })()}
                  <TableCell>
                    <Chip
                      label={getInvoiceStatusText(inv.status)}
                      color={getInvoiceStatusColor(inv.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      sx={{
                        backgroundColor: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.dark' },
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                      startIcon={<VisibilityIcon />}
                    >
                      Zobraziť
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginácia */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 'bold',
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
}
