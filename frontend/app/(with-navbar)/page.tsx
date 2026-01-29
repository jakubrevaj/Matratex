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
  Box,
  Chip,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/OpenInNew';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { API_URL } from '@/services/api';
import { getOrderStatusText, getOrderStatusColor, ORDER_STATUSES } from '@/utils/statusHelpers';
import EmptyState from '@/components/EmptyState';

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

export default function Home() {
  const theme = useTheme();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  const refreshItems = () => {
    axios
      .get(`${API_URL}/order-items`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      .then((res) => setItems(res.data))
      .catch((err) => {
        console.error('Chyba pri načítaní položiek:', err);
        toast.error('Nepodarilo sa načítať položky objednávok');
      });
  };

  useEffect(() => {
    refreshItems();

    // Polling každých 30 sekúnd miesto 5 minút pre lepší UX
    // ale len ak je stránka aktívna (viditeľná)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshItems();
      }
    }, 30000); // každých 30 sekúnd = 30 000 ms

    return () => clearInterval(interval); // vyčistenie intervalu
  }, []);

  // Bulk operations functions
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(filteredItems.map((item) => item.id));
      setSelectAll(true);
    } else {
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedItems.length === 0) return;

    try {
      // Change status for all selected items
      await Promise.all(
        selectedItems.map((id) =>
          axios.put(`${API_URL}/order-items/${id}/status`, {
            status: newStatus,
          })
        )
      );

      toast.success(
        `Úspešne zmenený stav ${
          selectedItems.length
        } položiek na "${getOrderStatusText(newStatus)}"`
      );

      // Aktualizuj len vybrané položky v state bez reorganizácie tabuľky
      setItems(prevItems =>
        prevItems.map(item =>
          selectedItems.includes(item.id) ? { ...item, status: newStatus } : item
        )
      );

      // Clear selection
      setSelectedItems([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Chyba pri hromadnej zmene statusu:', error);
      toast.error('Nepodarilo sa zmeniť stav všetkých položiek');
    }
  };

  const getFilteredItems = () => {
    let filtered = items;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.product_name.toLowerCase().includes(lowerSearch) ||
          item.material_name?.toLowerCase().includes(lowerSearch) ||
          item.order?.order_number?.toLowerCase().includes(lowerSearch) ||
          item.order?.customer?.podnik?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

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
          <AssessmentIcon />
          Prehľad objednávok
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sledujte stav všetkých objednávok a položiek
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Hľadať podľa produktu, materiálu, objednávky alebo zákazníka"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={refreshItems}
              sx={{
                height: '56px',
                borderRadius: 2,
              }}
              startIcon={<RefreshIcon />}
            >
              Obnoviť
            </Button>
          </Grid>
      </Grid>

      {/* Status legend */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
          justifyContent: 'center',
        }}
      >
        {[
          { status: 'pending', t: 'Čakajúca' },
          { status: 'to-production', t: 'Do výroby' },
          { status: 'in-production', t: 'Vo výrobe' },
          { status: 'completed', t: 'Hotová' },
          { status: 'invoiced', t: 'Fakturovaná' },
          { status: 'archived', t: 'Archivovaná' },
        ].map((s) => (
          <Box
            key={s.t}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Box
              sx={{
                width: 20,
                height: 10,
                borderRadius: '50px',
                backgroundColor: getOrderStatusColor(s.status),
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.2)}`,
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: '500' }}
            >
              {s.t}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: 'primary.light',
            borderRadius: 2,
            border: `1px solid ${theme.palette.primary.main}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaylistAddCheckIcon color="primary" />
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Vybraté položky: {selectedItems.length}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => handleBulkStatusChange('completed')}
              sx={{
                border: '2px solid',
                borderColor: 'success.main',
                color: 'success.main',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'success.main',
                  color: 'common.white',
                  borderColor: 'success.main',
                },
              }}
              startIcon={<CheckCircleIcon />}
            >
              Označiť ako Hotové ({selectedItems.length})
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleBulkStatusChange('to-production')}
              sx={{
                border: '2px solid',
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white',
                  borderColor: 'primary.main',
                },
              }}
              startIcon={<BuildIcon />}
            >
              Presunúť do výroby ({selectedItems.length})
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setSelectedItems([])}
              sx={{
                border: '2px solid',
                borderColor: 'warning.main',
                color: 'warning.main',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'warning.main',
                  color: 'common.white',
                  borderColor: 'warning.main',
                },
              }}
              startIcon={<ClearIcon />}
            >
              Zrušiť výber
            </Button>
          </Stack>
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
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
                  width: '50px',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label=""
                />
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
                Produkt
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
                Materiál
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
                Množstvo
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
                Objednávka
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
                Stav
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
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    icon={<AssessmentIcon fontSize="large" />}
                    title={
                      search || statusFilter
                        ? 'Nenašli sa žiadne položky'
                        : 'Zatiaľ žiadne položky objednávok'
                    }
                    message={
                      search || statusFilter
                        ? 'Skúste zmeniť filtre alebo vyhľadávanie'
                        : 'Položky objednávok sa zobrazia po vytvorení objednávok'
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  backgroundColor: getOrderStatusColor(item.status || ''),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.6),
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              >
                <TableCell sx={{ width: '50px' }}>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.material_name || '-'}</TableCell>
                <TableCell>
                  {item.status === 'in-production'
                    ? `${item.count ?? 0} / ${item.quantity}`
                    : item.quantity}
                </TableCell>
                <TableCell
                  sx={{ whiteSpace: 'nowrap' }}
                >{`${item.length} × ${item.width} × ${item.height}`}</TableCell>
                <TableCell>{item.order?.order_number || '-'}</TableCell>
                <TableCell>{item.order?.customer?.podnik || '-'}</TableCell>
                <TableCell>
                  {item.status ? (
                    <Chip
                      label={getOrderStatusText(item.status)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.common.white, 0.8),
                        color: 'text.primary',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                        '& .MuiChip-label': {
                          color: 'text.primary',
                        },
                      }}
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="left">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-start"
                    alignItems="center"
                  >
                    {item.order?.id && (
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => router.push(`/orders/${item.order?.id}`)}
                        title="Zobraziť objednávku"
                        sx={{
                          border: '1px solid',
                          borderColor: 'primary.main',
                          '&:hover': { backgroundColor: 'primary.light' },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    {item.order?.id && item.status !== 'completed' && item.status !== 'invoiced' && item.status !== 'archived' && (
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={async () => {
                          try {
                            await axios.put(
                              `${API_URL}/order-items/${item.id}/status`,
                              { status: 'completed' }
                            );
                            // Aktualizuj len konkrétnu položku v state bez reorganizácie tabuľky
                            setItems(prevItems =>
                              prevItems.map(i =>
                                i.id === item.id ? { ...i, status: 'completed' } : i
                              )
                            );
                            toast.success('Položka označená ako hotová');
                          } catch (error) {
                            console.error('Chyba pri zmene statusu:', error);
                            toast.error(
                              'Nepodarilo sa zmeniť status na hotová.'
                            );
                          }
                        }}
                        sx={{
                          width: '80px',
                          height: '32px',
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: 'success.main',
                          color: 'success.main',
                          borderRadius: 1.5,
                          fontWeight: '600',
                          textTransform: 'none',
                          backgroundColor: alpha(theme.palette.success.main, 0.08),
                          '&:hover': {
                            backgroundColor: 'success.main',
                            color: 'common.white',
                            borderColor: 'success.main',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`,
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Hotová
                      </Button>
                    )}
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
