'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function NewManualInvoicePage() {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === 'name' ? value : Number(value);
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    if (!customerName || !customerAddress) {
      return alert('Zadajte meno a adresu zákazníka.');
    }

    const total_price = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices`,
        {
          customer_name: customerName,
          customer_address: customerAddress,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            total_price: item.quantity * item.price,
            dimensions: '',
          })),
          total_price,
          notes,
        }
      );

      alert('Faktúra bola vytvorená.');
      window.location.href = `/invoices/${res.data.id}`;
    } catch (err) {
      console.error('Chyba pri vytváraní faktúry:', err);
      alert('Nepodarilo sa vytvoriť faktúru.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Nová faktúra (manuálna)
      </Typography>

      <TextField
        fullWidth
        label="Meno zákazníka"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        margin="dense"
      />
      <TextField
        fullWidth
        label="Adresa zákazníka"
        value={customerAddress}
        onChange={(e) => setCustomerAddress(e.target.value)}
        margin="dense"
      />

      <TextField
        fullWidth
        label="Poznámka"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        margin="dense"
        multiline
        rows={2}
      />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Položky
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Názov</TableCell>
            <TableCell>Množstvo</TableCell>
            <TableCell>Cena (€)</TableCell>
            <TableCell>Akcia</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  fullWidth
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, 'name', e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={String(item.quantity)}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleItemChange(
                      index,
                      'quantity',
                      val === '' ? 0 : parseInt(val, 10)
                    );
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={String(item.price)}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleItemChange(
                      index,
                      'price',
                      val === '' ? 0 : parseFloat(val)
                    );
                  }}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleRemoveItem(index)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box mt={2}>
        <Button variant="outlined" onClick={handleAddItem}>
          Pridať položku
        </Button>
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
      >
        Vytvoriť faktúru
      </Button>
    </Container>
  );
}
