'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState<number | ''>('');
  const [manualItemQuantity, setManualItemQuantity] = useState<number | ''>(1);
  const [withVat, setWithVat] = useState(true);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  useEffect(() => {
    if (id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`)
        .then((res) => {
          setInvoice(res.data);
          setInvoiceNotes(res.data.notes || '');
        })
        .catch((err) => console.error('Chyba pri načítaní faktúry:', err));
    }
  }, [id]);

  const handleAddManualItem = async () => {
    if (
      !manualItemName ||
      manualItemPrice === '' ||
      isNaN(Number(manualItemPrice)) ||
      manualItemQuantity === '' ||
      isNaN(Number(manualItemQuantity))
    )
      return;

    const newItem = {
      name: manualItemName,
      dimensions: '',
      quantity: Number(manualItemQuantity),
      total_price: Number(manualItemPrice) * Number(manualItemQuantity),
    };

    try {
      const updated = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`,
        {
          items: [...invoice.items, newItem],
        }
      );

      setInvoice(updated.data);
      setManualItemName('');
      setManualItemPrice('');
      setManualItemQuantity(1);
    } catch (err) {
      console.error('Chyba pri ukladaní položky:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const updated = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}`,
        { notes: invoiceNotes }
      );
      setInvoice(updated.data);
    } catch (err) {
      console.error('Chyba pri ukladaní poznámky:', err);
    }
  };

  if (!invoice) {
    return <Typography sx={{ m: 4 }}>Načítavam faktúru...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Faktúra č. {invoice.invoice_number}
      </Typography>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography>
            <strong>Zákazník:</strong> {invoice.customer_name}
          </Typography>
          <Typography>
            <strong>Adresa:</strong> {invoice.customer_address}
          </Typography>
          <Typography>
            <strong>Celková cena:</strong> {invoice.total_price} €
          </Typography>
        </CardContent>
      </Card>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Produkt</TableCell>
              <TableCell>Rozmer</TableCell>
              <TableCell>Množstvo</TableCell>
              <TableCell>Cena bez DPH (€)</TableCell>
              <TableCell>DPH 23% (€)</TableCell>
              <TableCell>Cena s DPH (€)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.items.map((item: any, index: number) => {
              const vat = item.total_price * 0.23;
              const withVat = item.total_price + vat;
              return (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.dimensions || '-'}</TableCell>
                  <TableCell>{item.quantity || 1}</TableCell>
                  <TableCell>{item.total_price?.toFixed(2)}</TableCell>
                  <TableCell>{vat.toFixed(2)}</TableCell>
                  <TableCell>{withVat.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" gap={2} mt={3} alignItems="center">
        <TextField
          label="Názov položky"
          value={manualItemName}
          onChange={(e) => setManualItemName(e.target.value)}
        />
        <TextField
          label="Množstvo"
          type="number"
          value={manualItemQuantity}
          onChange={(e) =>
            setManualItemQuantity(
              e.target.value === '' ? '' : parseInt(e.target.value)
            )
          }
        />
        <TextField
          label="Cena (€)"
          type="number"
          value={manualItemPrice}
          onChange={(e) =>
            setManualItemPrice(
              e.target.value === '' ? '' : parseFloat(e.target.value)
            )
          }
        />
        <Button variant="contained" onClick={handleAddManualItem}>
          Pridať manuálnu položku
        </Button>
      </Box>

      <Box mt={3}>
        <TextField
          fullWidth
          label="Poznámka k faktúre"
          value={invoiceNotes}
          onChange={(e) => setInvoiceNotes(e.target.value)}
          multiline
          minRows={3}
        />
        <Button variant="contained" onClick={handleSaveNotes} sx={{ mt: 1 }}>
          Uložiť poznámku
        </Button>
      </Box>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => {
          window.open(
            `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/pdf?withVat=${withVat}`,
            '_blank'
          );
        }}
      >
        Stiahnuť PDF
      </Button>

      <FormControlLabel
        control={
          <Checkbox
            checked={withVat}
            onChange={(e) => setWithVat(e.target.checked)}
          />
        }
        label="Zobraziť ceny s DPH"
      />
    </Container>
  );
}
