'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Button,
  Box,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { alpha } from '@mui/material/styles';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import axios from 'axios';
import { API_URL } from '@/services/api';
import toast from 'react-hot-toast';
import { getOrderStatusText, getOrderStatusChipColor } from '@/utils/statusHelpers';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface DeletedOrder {
  id: number;
  order_number: string;
  customer_name: string;
  ico?: string;
  issue_date: string;
  total_price: number;
  notes?: string;
  production_status: string;
  deleted_at: string;
  deleted_by: string;
  order_items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    status: string;
  }>;
}

export default function DeletedOrdersPage() {
  const theme = useTheme();
  const [deletedOrders, setDeletedOrders] = useState<DeletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [restoreDialog, setRestoreDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({ open: false, orderId: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({ open: false, orderId: null });

  const loadDeletedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/deleted-orders`);
      setDeletedOrders(response.data);
    } catch (err) {
      console.error('Chyba pri načítavaní vymazaných objednávok:', err);
      setError('Nepodarilo sa načítať vymazané objednávky');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedOrders();
  }, []);

  const handleRestoreOrder = (orderId: number) => {
    setRestoreDialog({ open: true, orderId });
  };

  const confirmRestoreOrder = async () => {
    if (!restoreDialog.orderId) return;
    try {
      await axios.post(`${API_URL}/deleted-orders/${restoreDialog.orderId}/restore`);
      toast.success('Objednávka bola obnovená');
      setRestoreDialog({ open: false, orderId: null });
      loadDeletedOrders();
    } catch (err) {
      console.error('Chyba pri obnovovaní objednávky:', err);
      toast.error('Nepodarilo sa obnoviť objednávku');
    }
  };

  const handlePermanentDelete = (orderId: number) => {
    setDeleteDialog({ open: true, orderId });
  };

  const confirmPermanentDelete = async () => {
    if (!deleteDialog.orderId) return;
    try {
      await axios.delete(`${API_URL}/deleted-orders/${deleteDialog.orderId}/permanent`);
      toast.success('Objednávka bola trvalo vymazaná');
      setDeleteDialog({ open: false, orderId: null });
      loadDeletedOrders();
    } catch (err) {
      console.error('Chyba pri trvalom mazaní objednávky:', err);
      toast.error('Nepodarilo sa trvalo vymazať objednávku');
    }
  };


  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          borderLeft: `3px solid ${theme.palette.error.main}`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: 'error.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <DeleteIcon />
          Vymazané objednávky
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prehľad všetkých vymazaných objednávok
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
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
                  color: 'error.main',
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
                  color: 'error.main',
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
                  color: 'error.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Dátum vydania
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'error.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Celková cena
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'error.main',
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
                  color: 'error.main',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Vymazané
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: 'error.main',
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
            {deletedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <EmptyState
                    icon={<DeleteIcon fontSize="large" />}
                    title="Žiadne vymazané objednávky"
                    message="Zatiaľ neboli vymazané žiadne objednávky."
                  />
                </TableCell>
              </TableRow>
            ) : (
              deletedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.order_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customer_name}
                    </Typography>
                    {order.ico && (
                      <Typography variant="caption" color="text.secondary">
                        IČO: {order.ico}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.issue_date), 'dd.MM.yyyy', {
                      locale: sk,
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.total_price.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getOrderStatusText(order.production_status)}
                      color={getOrderStatusChipColor(order.production_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(order.deleted_at), 'dd.MM.yyyy HH:mm', {
                        locale: sk,
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.deleted_by}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleRestoreOrder(order.id)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                        startIcon={<RestoreFromTrashIcon fontSize="small" />}
                      >
                        Obnoviť
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handlePermanentDelete(order.id)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                        startIcon={<DeleteForeverIcon fontSize="small" />}
                      >
                        Trvalo vymazať
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          open={restoreDialog.open}
          title="Obnoviť objednávku?"
          message="Naozaj chcete obnoviť túto objednávku? Objednávka sa vráti do normálneho stavu."
          confirmText="Obnoviť"
          cancelText="Zrušiť"
          severity="info"
          onConfirm={confirmRestoreOrder}
          onCancel={() => setRestoreDialog({ open: false, orderId: null })}
        />

        <ConfirmationDialog
          open={deleteDialog.open}
          title="Trvalo zmazať objednávku?"
          message="Naozaj chcete trvalo vymazať túto objednávku? Táto akcia sa nedá vrátiť späť a objednávka bude natrvalo odstránená z databázy!"
          confirmText="Trvalo zmazať"
          cancelText="Zrušiť"
          severity="error"
          onConfirm={confirmPermanentDelete}
          onCancel={() => setDeleteDialog({ open: false, orderId: null })}
        />
      </Container>
    );
  }








