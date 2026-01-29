'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  // Checkbox,
  TableContainer,
  Paper,
  TextField,
  IconButton,
  Box,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import axios from 'axios';

import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha } from '@mui/material/styles';

import { useRouter } from 'next/navigation';
import { API_URL } from '@/services/api';
import { getOrderStatusColor } from '@/utils/statusHelpers';
import EmptyState from '@/components/EmptyState';

type ProductionItem = {
  id: number;
  product_name: string;
  status: string;
  order?: {
    id: number;
    order_number?: string;
    customer?: { podnik?: string };
    issue_date?: string;
  };
  length: number;
  width: number;
  height: number;
  quantity: number;
};

type SortField = 'product_name' | 'status' | 'order_number' | 'customer' | 'issue_date' | 'quantity';
type SortOrder = 'asc' | 'desc';

export default function ProductionPage() {
  const theme = useTheme();
  const [items, setItems] = useState<ProductionItem[]>([]);
  // const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('product_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get(`${API_URL}/production/items`);
    setItems(res.data);
  };
  const router = useRouter();

  // const handleSelect = (id: number) => {
  //   if (selected.includes(id)) {
  //     setSelected(selected.filter((sid) => sid !== id));
  //   } else {
  //     setSelected([...selected, id]);
  //   }
  // };

  const handleMoveToProduction = async () => {
    if (
      !confirm(
        'Naozaj chcete všetky položky v stave "to-production" dať do výroby?'
      )
    ) {
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/production/move-all-to-in-production`
      );

      // 👉 otvorenie PDF v novej karte, ak je dostupná cesta
      if (response.data.pdfPath) {
        const relativePath = response.data.pdfPath.replace(/\\/g, '/');
        const url = `${API_URL}${relativePath.replace(/^.*\/pdfs/, '/pdfs')}`;
        window.open(url, '_blank');
      }
      if (response.data.summaryPath) {
        const relativePath = response.data.summaryPath.replace(/\\/g, '/');
        const url = `${API_URL}${relativePath.replace(/^.*\/pdfs/, '/pdfs')}`;
        window.open(url, '_blank');
      }
      await fetchItems();
      alert('Všetky položky boli zaradené do výroby.');
    } catch (err) {
      console.error(err);
      alert('Chyba pri presune položiek.');
    }
  };

  const handleMarkToProduction = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/order-items/${id}/status`, {
        status: 'to-production',
      });
      // Aktualizuj len konkrétnu položku v state bez reorganizácie tabuľky
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, status: 'to-production' } : item
        )
      );
    } catch (err) {
      console.error('Chyba pri zmene statusu', err);
      alert('Nepodarilo sa označiť položku.');
    }
  };

  const handleMarkBackToPending = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/order-items/${id}/status`, {
        status: 'pending',
      });
      // Aktualizuj len konkrétnu položku v state bez reorganizácie tabuľky
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, status: 'pending' } : item
        )
      );
    } catch (err) {
      console.error('Chyba pri zmene statusu', err);
      alert('Nepodarilo sa zrušiť označenie položky.');
    }
  };

  const filtered = items.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.order?.customer?.podnik?.toLowerCase().includes(query) ||
      item.order?.order_number?.toLowerCase().includes(query)
    );
  });

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedItems = [...filtered].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'product_name':
        aValue = a.product_name;
        bValue = b.product_name;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'order_number':
        aValue = a.order?.order_number || '';
        bValue = b.order?.order_number || '';
        break;
      case 'customer':
        aValue = a.order?.customer?.podnik || '';
        bValue = b.order?.customer?.podnik || '';
        break;
      case 'issue_date':
        aValue = a.order?.issue_date ? new Date(a.order.issue_date).getTime() : 0;
        bValue = b.order?.issue_date ? new Date(b.order.issue_date).getTime() : 0;
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
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
          <BuildIcon />
          Produkcia
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sledujte a riadite výrobu matracov
        </Typography>
      </Box>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}
      >
        Položky pripravené na výrobu
      </Typography>

      <TextField
        label="Hľadať matrac, zákazníka alebo číslo objednávky"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button
        variant="contained"
        sx={{
          mb: 2,
          backgroundColor: 'primary.main',
          '&:hover': { backgroundColor: 'primary.dark' },
          borderRadius: 2,
          px: 3,
          py: 1.5,
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
        onClick={handleMoveToProduction}
        startIcon={<BuildIcon />}
      >
        Dať vybrané do výroby
      </Button>

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
                Akcia
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
                  active={sortField === 'product_name'}
                  direction={sortField === 'product_name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('product_name')}
                >
                  Matrac
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
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
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
                <TableSortLabel
                  active={sortField === 'order_number'}
                  direction={sortField === 'order_number' ? sortOrder : 'asc'}
                  onClick={() => handleSort('order_number')}
                >
                  Objednávka
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
                <TableSortLabel
                  active={sortField === 'customer'}
                  direction={sortField === 'customer' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customer')}
                >
                  Zákazník
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
                <TableSortLabel
                  active={sortField === 'issue_date'}
                  direction={sortField === 'issue_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('issue_date')}
                >
                  Dátum objednávky
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
                Rozmery
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
                  active={sortField === 'quantity'}
                  direction={sortField === 'quantity' ? sortOrder : 'asc'}
                  onClick={() => handleSort('quantity')}
                >
                  Kusov
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
                Detail
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    icon={<BuildIcon fontSize="large" />}
                    title={search ? 'Nenašli sa žiadne položky' : 'Zatiaľ žiadne položky na výrobu'}
                    message={
                      search
                        ? 'Skúste zmeniť vyhľadávanie'
                        : 'Položky pripravené na výrobu sa zobrazia po vytvorení objednávok'
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  backgroundColor: item.status === 'to-production' 
                    ? alpha(theme.palette.secondary.main, 0.2)
                    : getOrderStatusColor(item.status || ''),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  borderLeft: item.status === 'to-production' 
                    ? `4px solid ${theme.palette.secondary.main}`
                    : 'none',
                  '&:hover': {
                    backgroundColor: item.status === 'to-production'
                      ? alpha(theme.palette.secondary.main, 0.3)
                      : alpha(theme.palette.common.white, 0.6),
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <TableCell>
                  {item.status === 'pending' ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleMarkToProduction(item.id)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      Vyrobiť
                    </Button>
                  ) : item.status === 'to-production' ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleMarkBackToPending(item.id)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      Zrušiť
                    </Button>
                  ) : (
                    <CheckCircleIcon color="success" fontSize="small" />
                  )}
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>
                  {item.status === 'pending' && 'Čakajúca'}
                  {item.status === 'to-production' && 'Do výroby'}
                </TableCell>
                <TableCell>{item.order?.order_number || '-'}</TableCell>
                <TableCell>{item.order?.customer?.podnik || '-'}</TableCell>
                <TableCell>
                  {item.order?.issue_date
                    ? new Date(item.order.issue_date).toLocaleDateString(
                        'sk-SK'
                      )
                    : '-'}
                </TableCell>
                <TableCell>
                  {item.length} x {item.width} x {item.height} cm
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => router.push(`/orders/${item.order?.id}`)}
                    sx={{ ml: 1 }}
                  >
                    <DescriptionIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Celkový počet kusov:{' '}
        {sortedItems.reduce((sum, item) => sum + item.quantity, 0)}
      </Typography>
    </Container>
  );
}
