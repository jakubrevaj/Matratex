'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Collapse,
  Box,
  useTheme,
} from '@mui/material';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { alpha } from '@mui/material/styles';
import { OrderItem } from '@/types';
import { API_URL } from '@/services/api';
import { getOrderStatusColor, getOrderStatusText, ORDER_STATUSES } from '@/utils/statusHelpers';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const theme = useTheme();
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<{
    id: number;
    order_number: string;
    customer: { id: number; podnik: string };
    ico?: string;
    issue_date: string;
    notes: string;
    total_price: number;
    order_items: OrderItem[];
  } | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalIds, setOriginalIds] = useState<number[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [deleteItemDialog, setDeleteItemDialog] = useState<{
    open: boolean;
    itemId: number | null;
  }>({ open: false, itemId: null });
  const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);

  const refreshOrder = async () => {
    const res = await axios.get(`${API_URL}/orders/${id}`);
    setOrder(res.data);
    setItems((prevItems) => {
      const idMap = new Map(
        prevItems.map((item) => [item.id, item.splitValue])
      );
      return originalIds
        .map((oid) => res.data.order_items.find((i: OrderItem) => i.id === oid))
        .filter(Boolean)
        .concat(
          res.data.order_items.filter(
            (i: OrderItem) => !originalIds.includes(i.id)
          )
        )
        .map((item: OrderItem) => ({
          ...item,
          splitValue: idMap.get(item.id) ?? '',
        }));
    });
  };

  useEffect(() => {
    if (id) {
      axios.get(`${API_URL}/orders/${id}`).then((res) => {
        setOrder(res.data);
        setItems(res.data.order_items);
        setOriginalIds(res.data.order_items.map((item: OrderItem) => item.id));
      });
    }
  }, [id]);

  const updateOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${id}`);
      const orderData = res.data;
      const updatedOrder = {
        order_number: orderData.order_number,
        issue_date: orderData.issue_date,
        notes: orderData.notes,
        total_price: orderData.total_price,
        customer: { id: orderData.customer.id },
        order_items: orderData.order_items.map((item: OrderItem) => ({
          ...item,
          product_id: item.product_id,
          product_name: item.product_name,
        })),
      };
      await axios.put(`${API_URL}/orders/${id}`, updatedOrder);
    } catch (error) {
      console.error('Chyba pri aktualizácii objednávky:', error);
    }
  };

  const handleSplit = async (itemId: number, splitQuantity: number) => {
    try {
      if (!splitQuantity || splitQuantity <= 0) return;
      await axios.post(`${API_URL}/order-items/${itemId}/split`, {
        quantity: splitQuantity,
      });
      await updateOrder();
      await refreshOrder();
    } catch (error) {
      console.error('Chyba pri rozdelení položky:', error);
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/order-items/${itemId}/status`, {
        status: newStatus,
      });
      await updateOrder();
      await refreshOrder();
    } catch (error) {
      console.error('Chyba pri zmene statusu:', error);
    }
  };

  const handleDeleteItem = (itemId: number) => {
    setDeleteItemDialog({ open: true, itemId });
  };

  const confirmDeleteItem = async () => {
    if (!deleteItemDialog.itemId) return;
    try {
      await axios.delete(`${API_URL}/order-items/${deleteItemDialog.itemId}`);
      toast.success('Položka bola zmazaná');
      setDeleteItemDialog({ open: false, itemId: null });
      await refreshOrder();
    } catch (error) {
      console.error('Chyba pri mazaní položky:', error);
      toast.error('Nepodarilo sa zmazať položku');
    }
  };

  const handleDeleteOrder = () => {
    setDeleteOrderDialog(true);
  };

  const confirmDeleteOrder = async () => {
    try {
      await axios.delete(`${API_URL}/orders/${id}`);
      toast.success('Objednávka bola zmazaná');
      router.push('/orders');
    } catch (error) {
      console.error('Chyba pri mazaní objednávky:', error);
      toast.error('Nepodarilo sa zmazať objednávku');
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await axios.post(`${API_URL}/invoices/${id}/auto`);

      const invoiceId = response.data?.data?.id;

      if (!invoiceId) {
        toast.error('Faktúra bola vytvorená, ale chýba ID.');
        return;
      }

      toast.success('Faktúra bola vytvorená');
      // Presmeruj na detail faktúry
      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Chyba pri generovaní faktúry:', error);
      toast.error(
        'Nepodarilo sa vytvoriť faktúru. Skontroluj, či máš položky so stavom "completed".'
      );
    }
  };
  if (!order) return <Typography variant="h6">Načítavam...</Typography>;

  return (
    <Container maxWidth={false} sx={{ px: 4, py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ListAltIcon />
          Detail objednávky č. {order.order_number}
        </Typography>
      </Stack>

      {/* Order Info Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `2px solid ${theme.palette.primary.light}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PersonIcon />
                  Informácie o zákazníkovi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <strong>Zákazník:</strong>{' '}
                  {order.customer?.podnik || 'Neznámy'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <strong>IČO:</strong> {order.ico || '–'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <EventIcon />
                  Detaily objednávky
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <strong>Dátum vystavenia:</strong>{' '}
                  {new Date(order.issue_date).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <strong>Celková cena:</strong>{' '}
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {order.total_price}€
                  </Box>
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `2px solid ${theme.palette.primary.light}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ShoppingCartIcon />
            Položky objednávky
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Názov produktu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Material
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Množstvo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Rozmery (cm)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Cena (€)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Rozdelenie
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Akcie
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item: OrderItem) => (
                  <React.Fragment key={item.id}>
                    <TableRow
                      sx={{
                        backgroundColor: getOrderStatusColor(
                          item.status || 'pending'
                        ),
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() =>
                              setOpenRow(openRow === item.id ? null : item.id)
                            }
                            sx={{ minWidth: '30px', padding: 0 }}
                          >
                            {openRow === item.id ? (
                              <ExpandLessIcon fontSize="small" />
                            ) : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                          </Button>
                          <Typography>{item.product_name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{item.material_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.length}×{item.width}×{item.height}
                      </TableCell>
                      <TableCell>{item.total_price}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth variant="outlined">
                          <Select
                            value={item.status}
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value)
                            }
                          >
                            {ORDER_STATUSES.map((s) => (
                              <MenuItem key={s} value={s}>
                                {getOrderStatusText(s)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          sx={{ width: '100px', mr: 1 }}
                          value={item.splitValue || ''}
                          onChange={(e) => {
                            const newItems = [...items];
                            const index = newItems.findIndex(
                              (i) => i.id === item.id
                            );
                            newItems[index].splitValue = e.target.value;
                            setItems(newItems);
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleSplit(item.id, Number(item.splitValue) || 0)
                          }
                        >
                          Rozdeliť
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Zmazať
                        </Button>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={8}
                      >
                        <Collapse
                          in={openRow === item.id}
                          timeout="auto"
                          unmountOnExit
                        >
                        <CardContent sx={{ bgcolor: 'background.default' }}>
                            <Typography variant="body2">
                              <strong>Poznámka jadro:</strong>{' '}
                              {item.notes_core || '–'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Poznámka poťah:</strong>{' '}
                              {item.notes_cover || '–'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Štítky:</strong>{' '}
                              {[item.label_1, item.label_2, item.label_3]
                                .filter(Boolean)
                                .join(', ') || '–'}
                            </Typography>
                          </CardContent>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `2px solid ${theme.palette.primary.light}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: 'primary.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FlashOnIcon />
            Akcie
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push(`/orders/edit/${id}`)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.2s ease',
              }}
              startIcon={<EditIcon />}
            >
              Upraviť objednávku
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handlePrintInvoice}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                },
                transition: 'all 0.2s ease',
              }}
              startIcon={<ReceiptLongIcon />}
            >
              Vytvoriť faktúru
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteOrder}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                borderWidth: 2,
                ml: 'auto',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                },
                transition: 'all 0.2s ease',
              }}
              startIcon={<DeleteIcon />}
            >
              Zmazať objednávku
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteItemDialog.open}
        title="Zmazať položku?"
        message="Naozaj chcete zmazať túto položku? Táto akcia sa nedá vrátiť späť."
        confirmText="Zmazať"
        cancelText="Zrušiť"
        severity="error"
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteItemDialog({ open: false, itemId: null })}
      />

      <ConfirmationDialog
        open={deleteOrderDialog}
        title="Zmazať objednávku?"
        message="Naozaj chcete zmazať celú objednávku? Táto akcia sa nedá vrátiť späť a zmažú sa všetky položky."
        confirmText="Zmazať"
        cancelText="Zrušiť"
        severity="error"
        onConfirm={confirmDeleteOrder}
        onCancel={() => setDeleteOrderDialog(false)}
      />
    </Container>
  );
}
