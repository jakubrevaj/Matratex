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
  TableHead,
  Chip,
} from '@mui/material';
import { API_URL } from '@/services/api';
import { getOrderStatusText, getOrderStatusChipColor, getOrderStatusColor } from '@/utils/statusHelpers';
import FactoryIcon from '@mui/icons-material/Factory';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import BuildIcon from '@mui/icons-material/Build';
import RefreshIcon from '@mui/icons-material/Refresh';

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  count: number;
  status: string;
  material_name?: string;
  length?: number;
  width?: number;
  height?: number;
  order?: {
    order_number: string;
    customer?: {
      podnik: string;
    };
  };
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
      const res = await axios.get(`${API_URL}/order-items`);
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
      setMessage('Zadaj čiarový kód.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/production/scan`, { barcode });
      setItemInfo(res.data);
      setMessage(res.data.message);
      setBarcode('');
      fetchItems(); // refresh po skene
    } catch (err) {
      const message =
        (err as unknown as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Nastala chyba pri skenovaní.';
      setMessage(message);
      setItemInfo(null);
      setBarcode('');
    }
  };



  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <FactoryIcon fontSize="large" />
            VÝROBNÁ STANICA
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Skenuj čiarový kód pre označenie výroby
          </Typography>
        </Paper>

        {/* Scanner */}
        <Paper elevation={6} sx={{ p: 4, mb: 4 }}>
          <Box component="form" onSubmit={handleScan}>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              label="Naskenuj čiarový kód"
              value={barcode}
              InputProps={{
                startAdornment: <QrCodeScannerIcon sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              onChange={(e) => setBarcode(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  padding: '10px',
                },
              }}
            />
          </Box>

          {message && (
            <Paper
              sx={{
                p: 3,
                mt: 2,
                backgroundColor: message.includes('Úspešne') || message.includes('dokončen') ? 'success.light' : 'warning.light',
                border: message.includes('Úspešne') || message.includes('dokončen')
                  ? '2px solid'
                  : '2px solid',
                borderColor: message.includes('Úspešne') || message.includes('dokončen') ? 'success.main' : 'warning.main',
              }}
            >
              <Typography variant="h6" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {message.includes('Úspešne') || message.includes('dokončen') ? (
                  <CheckCircleIcon color="success" />
                ) : message.toLowerCase().includes('chyba') ? (
                  <ErrorIcon color="error" />
                ) : (
                  <WarningIcon color="warning" />
                )}
                {message}
              </Typography>
            </Paper>
          )}

          {itemInfo && (
            <Paper
              elevation={3}
              sx={{
                mt: 3,
                p: 3,
                background: '#e8f5e8',
                border: '3px solid #4caf50',
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Informácie o položke
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                <strong>Objednávka:</strong> {itemInfo.order_number}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon color="primary" />
                <strong>Produkt:</strong> {itemInfo.product_name}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" />
                <strong>Vyrobené:</strong> {itemInfo.produced_count}/
                {itemInfo.quantity}
              </Typography>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon color="primary" />
                <strong>Stav:</strong> {getOrderStatusText(itemInfo.status)}
              </Typography>
            </Paper>
          )}
        </Paper>

        {/* Aktívne objednávky */}
        <Paper elevation={6} sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <AssignmentIcon />
              Aktívne objednávky vo výrobe
            </Typography>
            <Button
              variant="contained"
              onClick={fetchItems}
              startIcon={<RefreshIcon />}
              sx={{
                background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                fontWeight: 'bold',
              }}
            >
              Obnoviť
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Celkový počet položiek: <strong>{items.length}</strong>
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Objednávka</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Zákazník</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Produkt</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Materiál</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rozmery</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Progres</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stav</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        🎉 Žiadne aktívne položky vo výrobe
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow
                      key={item.id}
                      sx={{
                        backgroundColor: getOrderStatusColor(item.status),
                        '&:hover': {
                          backgroundColor:
                            item.status === 'in-production'
                              ? '#bbdefb'
                              : '#c8e6c9',
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {item.order?.order_number || '-'}
                      </TableCell>
                      <TableCell>
                        {item.order?.customer?.podnik || '-'}
                      </TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.material_name || '-'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {item.length && item.width && item.height
                          ? `${item.length}×${item.width}×${item.height} cm`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            color:
                              item.count === item.quantity
                                ? '#4caf50'
                                : '#1976d2',
                          }}
                        >
                          {item.count ?? 0} / {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getOrderStatusText(item.status)}
                          color={getOrderStatusChipColor(item.status)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Footer s info */}
        <Paper
          sx={{
            mt: 3,
            p: 2,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            🔒 Výrobná stanica - Žiadny prístup k ostatným častiam systému
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
