'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  Stack,
  Grid,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateIcon from '@mui/icons-material/Create';
import AddIcon from '@mui/icons-material/Add';
import { API_URL } from '@/services/api';

type ManualItem = { name: string; quantity: number; price: number };
type Customer = { id: number; podnik?: string; adresa?: string };

export default function NewManualInvoicePage() {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<ManualItem[]>([
    { name: '', quantity: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState<number | ''>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>(
    'amount'
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerSearchInput, setCustomerSearchInput] = useState<string>('');
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);

  // Search customers with debouncing
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearchInput.length < 2) {
        setCustomers([]);
        return;
      }

      setLoadingCustomers(true);
      try {
        const response = await axios.get(
          `${API_URL}/customers?limit=100&search=${encodeURIComponent(customerSearchInput)}`
        );
        setCustomers(response.data);
      } catch (error) {
        console.error('[InvoiceForm] Error searching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    const timeoutId = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearchInput]);

  const total = (arr: ManualItem[]) =>
    arr.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'name' | 'quantity' | 'price',
    value: string | number
  ) => {
    const updatedItems: ManualItem[] = [...items];
    if (field === 'name') {
      updatedItems[index].name = String(value);
    } else if (field === 'quantity') {
      updatedItems[index].quantity = Number(value);
    } else {
      updatedItems[index].price = Number(value);
    }
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

    // Výpočet zľavy
    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (total_price * (Number(discount) || 0)) / 100;
    } else {
      discountAmount = Number(discount) || 0;
    }
    const finalPrice = Math.max(0, total_price - discountAmount);

    try {
      const res = await axios.post(`${API_URL}/invoices`, {
        customer_name: customerName,
        customer_address: customerAddress,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          total_price: item.quantity * item.price,
          dimensions: '',
        })),
        total_price: finalPrice,
        discount: discountType === 'amount' ? Number(discount) || 0 : 0,
        discount_percent:
          discountType === 'percent' ? Number(discount) || 0 : 0,
        notes,
      });

      alert('Faktúra bola vytvorená.');
      window.location.href = `/invoices/${res.data.data.id}`;
    } catch (err) {
      console.error('Chyba pri vytváraní faktúry:', err);
      alert('Nepodarilo sa vytvoriť faktúru.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ px: 4, py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ReceiptIcon sx={{ mr: 1 }} />
          Nová faktúra (manuálna)
        </Typography>
      </Stack>

      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              👤 Informácie o zákazníkovi
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(o) => `${o.podnik || ''} (ID: ${o.id})`}
                  getOptionKey={(option) => option.id}
                  isOptionEqualToValue={(a, b) => a?.id === b?.id}
                  value={selectedCustomer}
                  onChange={(e, val) => {
                    setSelectedCustomer(val);
                    setCustomerName(val?.podnik || '');
                    setCustomerAddress(val?.adresa || '');
                  }}
                  inputValue={customerSearchInput}
                  onInputChange={(e, val) => setCustomerSearchInput(val)}
                  loading={loadingCustomers}
                  noOptionsText={
                    customerSearchInput.length < 2
                      ? 'Začnite písať pre vyhľadávanie zákazníka (min. 2 znaky)'
                      : 'Žiadni zákazníci nenájdení'
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Zákazník"
                      placeholder="Začnite písať názov zákazníka..."
                      margin="dense"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meno zákazníka"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  margin="dense"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adresa zákazníka"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  margin="dense"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CreateIcon sx={{ mr: 1 }} />
              Poznámky
            </Typography>
            <TextField
              fullWidth
              label="Poznámka k faktúre"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              margin="dense"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Položky faktúry
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleAddItem}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                Pridať položku
              </Button>
            </Stack>

            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Názov
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Množstvo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Cena (€)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Akcia
                  </TableCell>
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                          },
                        }}
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                          },
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleRemoveItem(index)}
                        sx={{
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AttachMoneyIcon sx={{ mr: 1 }} />
              Finančné údaje
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label={
                      discountType === 'percent' ? 'Zľava (%)' : 'Zľava (€)'
                    }
                    type="number"
                    value={discount === '' ? '' : String(discount)}
                    onChange={(e) =>
                      setDiscount(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant={
                      discountType === 'amount' ? 'contained' : 'outlined'
                    }
                    size="small"
                    onClick={() =>
                      setDiscountType(
                        discountType === 'amount' ? 'percent' : 'amount'
                      )
                    }
                    sx={{
                      minWidth: '40px',
                      height: '40px',
                      borderRadius: 1,
                      fontWeight: 'bold',
                    }}
                  >
                    {discountType === 'amount' ? '€' : '%'}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={9}>
                <Stack spacing={1} sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', color: '#1976d2' }}
                  >
                    Súčet položiek: {total(items).toFixed(2)} €
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', color: '#f57c00' }}
                  >
                    Zľava:{' '}
                    {(() => {
                      if (discountType === 'percent') {
                        return `${Number(discount) || 0}% (${(
                          (total(items) * (Number(discount) || 0)) /
                          100
                        ).toFixed(2)} €)`;
                      } else {
                        return `${Number(discount) || 0} €`;
                      }
                    })()}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', color: '#2e7d32' }}
                  >
                    Po zľave:{' '}
                    {(() => {
                      const totalAmount = total(items);
                      let discountAmount = 0;
                      if (discountType === 'percent') {
                        discountAmount =
                          (totalAmount * (Number(discount) || 0)) / 100;
                      } else {
                        discountAmount = Number(discount) || 0;
                      }
                      return Math.max(0, totalAmount - discountAmount).toFixed(
                        2
                      );
                    })()}{' '}
                    €
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid #e3f2fd',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              ⚡ Akcie
            </Typography>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <CheckCircleIcon sx={{ mr: 1 }} />
              Vytvoriť faktúru
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
