/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Container,
  Card,
  CardContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Grid,
  Paper,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InputLabel,
  Stack,
  Collapse,
} from '@mui/material';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const statuses = [
  'pending',
  'to-production',
  'in-production',
  'completed',
  'invoiced',
  'archived', // nový stav
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#ffe5e5'; // svetlo červená
    case 'to-production':
      return '#ffffd1'; // svetlo žltá
    case 'in-production':
      return '#e5f0ff'; // svetlo modrá
    case 'completed':
      return '#e5ffe5'; // svetlo zelená
    case 'archived':
      return '#f2f2f2'; // svetlo šedá (neaktívna)
    case 'invoiced':
    default:
      return '#ffffff'; // biela
  }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [originalIds, setOriginalIds] = useState<number[]>([]);
  const [openRow, setOpenRow] = useState<number | null>(null);

  const refreshOrder = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`
    );
    setOrder(res.data);
    setItems((prevItems) => {
      const idMap = new Map(
        prevItems.map((item) => [item.id, item.splitValue])
      );
      return originalIds
        .map((oid) => res.data.order_items.find((i: any) => i.id === oid))
        .filter(Boolean)
        .concat(
          res.data.order_items.filter((i: any) => !originalIds.includes(i.id))
        )
        .map((item: any) => ({
          ...item,
          splitValue: idMap.get(item.id) ?? '',
        }));
    });
  };

  useEffect(() => {
    if (id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`)
        .then((res) => {
          setOrder(res.data);
          setItems(res.data.order_items);
          setOriginalIds(res.data.order_items.map((item: any) => item.id));
        });
    }
  }, [id]);

  const updateOrder = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`
      );
      const orderData = res.data;
      const updatedOrder = {
        order_number: orderData.order_number,
        issue_date: orderData.issue_date,
        notes: orderData.notes,
        total_price: orderData.total_price,
        customer: { id: orderData.customer.id },
        order_items: orderData.order_items.map((item: any) => ({
          ...item,
          product_id: item.product_id,
          product_name: item.product_name,
        })),
      };
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
        updatedOrder
      );
    } catch (error) {
      console.error('Chyba pri aktualizácii objednávky:', error);
    }
  };

  const handleSplit = async (itemId: number, splitQuantity: number) => {
    try {
      if (!splitQuantity || splitQuantity <= 0) return;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/order-items/${itemId}/split`,
        {
          quantity: splitQuantity,
        }
      );
      await updateOrder();
      await refreshOrder();
    } catch (error) {
      console.error('Chyba pri rozdelení položky:', error);
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/order-items/${itemId}/status`,
        {
          status: newStatus,
        }
      );
      await updateOrder();
      await refreshOrder();
    } catch (error) {
      console.error('Chyba pri zmene statusu:', error);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/auto`
      );

      const invoiceId = response.data?.id;

      if (!invoiceId) {
        alert('Faktúra bola vytvorená, ale chýba ID.');
        return;
      }

      // Presmeruj na detail faktúry
      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Chyba pri generovaní faktúry:', error);
      alert(
        'Nepodarilo sa vytvoriť faktúru. Skontroluj, či máš položky so stavom "completed".'
      );
    }
  };
  if (!order) return <Typography variant="h6">Načítavam...</Typography>;

  return (
    <Container maxWidth={false} sx={{ px: 8 }}>
      <Typography variant="h4" gutterBottom>
        Detail objednávky č. {order.order_number}
      </Typography>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1">
            <strong>Zákazník:</strong> {order.customer?.podnik || 'Neznámy'}
          </Typography>
          <Typography variant="subtitle1">
            <strong>ICO:</strong> {order.ico}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Dátum vystavenia:</strong>{' '}
            {new Date(order.issue_date).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Celková cena:</strong> {order.total_price}€
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Názov produktu</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Množstvo</TableCell>
              <TableCell>Rozmery (cm)</TableCell>

              <TableCell>Cena (€)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rozdelenie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item: any) => (
              <React.Fragment key={item.id}>
                <TableRow sx={{ backgroundColor: getStatusColor(item.status) }}>
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
                  <TableCell>{item.price}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth variant="outlined">
                      <Select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value)
                        }
                      >
                        {statuses.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
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
                        newItems[index].splitValue = Number(e.target.value);
                        setItems(newItems);
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSplit(item.id, item.splitValue || 0)}
                    >
                      Rozdeliť
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={7}
                  >
                    <Collapse
                      in={openRow === item.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <CardContent sx={{ bgcolor: '#fafafa' }}>
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

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push(`/orders/edit/${id}`)}
        >
          Upraviť objednávku
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handlePrintInvoice}
        >
          Vytvoriť faktúru
        </Button>
      </Stack>
    </Container>
  );
}
