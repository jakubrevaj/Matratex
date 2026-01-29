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
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Stack,
  Grid,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CreateIcon from '@mui/icons-material/Create';
import { API_URL } from '@/services/api';

type InvoiceItem = {
  name: string;
  dimensions?: string;
  quantity?: number;
  total_price: number;
};
type InvoiceData = {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_address?: string;
  items: InvoiceItem[];
  notes?: string;
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState<number | ''>('');
  const [manualItemQuantity, setManualItemQuantity] = useState<number | ''>(1);
  const [withVat, setWithVat] = useState(true);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [localDiscount, setLocalDiscount] = useState<number | ''>('');
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>(
    'amount',
  );

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_URL}/invoices/${id}`)
        .then((res) => {
          setInvoice(res.data);
          setInvoiceNotes(res.data.notes || '');
          const isPercent = (res.data.discount_percent ?? 0) > 0;
          setDiscountType(isPercent ? 'percent' : 'amount');
          setLocalDiscount(
            isPercent
              ? (res.data.discount_percent ?? '')
              : (res.data.discount ?? ''),
          );
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
      // Optimisticky aktualizuj UI
      const prev = invoice!;
      const updatedItems = [...(prev.items || []), newItem];
      const optimistic = { ...prev, items: updatedItems };
      setInvoice(optimistic);

      setManualItemName('');
      setManualItemPrice('');
      setManualItemQuantity(1);

      // Ulož na pozadí, pri chybe revertuj
      try {
        const res = await axios.patch(`${API_URL}/invoices/${id}`, {
          items: updatedItems,
          notes: optimistic.notes,
          discount: optimistic.discount,
          discount_percent: optimistic.discount_percent,
        });
        setInvoice(res.data.data);
      } catch (saveErr) {
        setInvoice(prev);
        console.error('Chyba pri ukladaní položky:', saveErr);
      }
    } catch (err) {
      console.error('Chyba pri pridávaní položky:', err);
    }
  };

  // merged into single save button below

  if (!invoice) {
    return <Typography sx={{ m: 4 }}>Načítavam faktúru...</Typography>;
  }

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
          Faktúra č. {invoice.invoice_number}
        </Typography>
      </Stack>

      {/* Invoice Info Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e3f2fd',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{ color: '#1976d2', fontWeight: 'bold' }}
                >
                  👤 Informácie o zákazníkovi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  <strong>Zákazník:</strong> {invoice.customer_name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  <strong>Adresa:</strong> {invoice.customer_address || '–'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{ color: '#1976d2', fontWeight: 'bold' }}
                >
                  <AttachMoneyIcon sx={{ mr: 1 }} />
                  Finančné údaje
                </Typography>
                {invoice &&
                  (() => {
                    const net = (invoice.items || []).reduce(
                      (sum: number, it: InvoiceItem) =>
                        sum + (Number(it.total_price) || 0),
                      0,
                    );
                    const discAmount =
                      discountType === 'percent'
                        ? net * ((Number(localDiscount) || 0) / 100)
                        : Number(localDiscount) || 0;
                    const netAfter = Math.max(0, net - discAmount);
                    const gross = +(netAfter * 1.23).toFixed(2);
                    return (
                      <>
                        <Typography
                          variant="body1"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            borderLeft: '4px solid #1976d2',
                          }}
                        >
                          <strong>Cena bez DPH:</strong>{' '}
                          <span
                            style={{ color: '#1976d2', fontWeight: 'bold' }}
                          >
                            {net.toFixed(2)} €
                          </span>
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            borderLeft: '4px solid #1976d2',
                          }}
                        >
                          <strong>
                            Zľava ({discountType === 'percent' ? '%' : '€'}):
                          </strong>{' '}
                          <span
                            style={{ color: '#f57c00', fontWeight: 'bold' }}
                          >
                            {discountType === 'percent'
                              ? (Number(localDiscount) || 0).toFixed(2)
                              : discAmount.toFixed(2)}{' '}
                            {discountType === 'percent' ? '%' : '€'}
                          </span>
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            borderLeft: '4px solid #1976d2',
                          }}
                        >
                          <strong>Po zľave (bez DPH):</strong>{' '}
                          <span
                            style={{ color: '#1976d2', fontWeight: 'bold' }}
                          >
                            {netAfter.toFixed(2)} €
                          </span>
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            borderLeft: '4px solid #1976d2',
                          }}
                        >
                          <strong>Cena s DPH (23%):</strong>{' '}
                          <span
                            style={{ color: '#2e7d32', fontWeight: 'bold' }}
                          >
                            {gross.toFixed(2)} €
                          </span>
                        </Typography>
                      </>
                    );
                  })()}
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
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{
              p: 2,
              bgcolor: '#1976d2',
              color: 'white',
              fontWeight: 'bold',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <ShoppingCartIcon sx={{ mr: 1 }} />
            Položky faktúry
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Produkt
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Rozmer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Množstvo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Cena bez DPH (€)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    DPH 23% (€)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Cena s DPH (€)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(invoice.items || []).map(
                  (item: InvoiceItem, index: number) => {
                    const vat = item.total_price * 0.23;
                    const withVat = item.total_price + vat;
                    return (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.dimensions || '-'}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const qty = Number(e.target.value) || 1;
                              const newItems = [...(invoice.items || [])];
                              const unit =
                                (item.total_price || 0) / (item.quantity || 1);
                              newItems[index] = {
                                ...item,
                                quantity: qty,
                                total_price: +(unit * qty).toFixed(2),
                              };
                              setInvoice({ ...invoice, items: newItems });
                            }}
                            sx={{ width: 100 }}
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.total_price?.toFixed(2)}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const newItems = [...(invoice.items || [])];
                              newItems[index] = {
                                ...item,
                                total_price: +val.toFixed(2),
                              };
                              setInvoice({ ...invoice, items: newItems });
                            }}
                            sx={{ width: 140 }}
                          />
                        </TableCell>
                        <TableCell>{vat.toFixed(2)}</TableCell>
                        <TableCell>{withVat.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e3f2fd',
          mb: 3,
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
            <SaveIcon sx={{ mr: 1 }} />
            Uložiť zmeny
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                const updated = await axios.patch(`${API_URL}/invoices/${id}`, {
                  items: invoice.items || [],
                });
                setInvoice(updated.data.data);
              } catch (err) {
                console.error('Chyba pri ukladaní položiek:', err);
              }
            }}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <SaveIcon sx={{ mr: 1 }} />
            Uložiť položky
          </Button>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e3f2fd',
          mb: 3,
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
            <AddIcon sx={{ mr: 1 }} />
            Pridať manuálnu položku
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
          >
            <TextField
              label="Názov položky"
              value={manualItemName}
              onChange={(e) => setManualItemName(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Množstvo"
              type="number"
              value={manualItemQuantity}
              onChange={(e) =>
                setManualItemQuantity(
                  e.target.value === '' ? '' : parseInt(e.target.value),
                )
              }
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Cena (€)"
              type="number"
              value={manualItemPrice}
              onChange={(e) =>
                setManualItemPrice(
                  e.target.value === '' ? '' : parseFloat(e.target.value),
                )
              }
              sx={{ minWidth: 140 }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={handleAddManualItem}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
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
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e3f2fd',
          mb: 3,
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
            Poznámky a zľavy
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Poznámka k faktúre"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              multiline
              minRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                  },
                },
              }}
            />
            <Stack
              direction="row"
              spacing={2}
              sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
            >
              <ToggleButtonGroup
                value={discountType}
                exclusive
                onChange={(e, val) => val && setDiscountType(val)}
                aria-label="Typ zľavy"
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 2,
                    fontWeight: 'bold',
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2',
                      color: 'white',
                    },
                  },
                }}
              >
                <ToggleButton value="amount" aria-label="Euro">
                  €
                </ToggleButton>
                <ToggleButton value="percent" aria-label="Percent">
                  %
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                label={discountType === 'percent' ? 'Zľava (%)' : 'Zľava (€)'}
                type="number"
                value={localDiscount}
                onChange={(e) =>
                  setLocalDiscount(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                sx={{
                  minWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {discountType === 'percent' ? '%' : '€'}
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  // Optimistic update
                  const prev = invoice;
                  const optimistic = {
                    ...invoice!,
                    notes: invoiceNotes,
                    discount:
                      discountType === 'amount'
                        ? Number(localDiscount) || 0
                        : 0,
                    discount_percent:
                      discountType === 'percent'
                        ? Number(localDiscount) || 0
                        : 0,
                  };
                  setInvoice(optimistic);

                  try {
                    const res = await axios.patch(`${API_URL}/invoices/${id}`, {
                      notes: invoiceNotes,
                      discount:
                        discountType === 'amount'
                          ? Number(localDiscount) || 0
                          : 0,
                      discount_percent:
                        discountType === 'percent'
                          ? Number(localDiscount) || 0
                          : 0,
                    });
                    setInvoice(res.data.data);
                  } catch (err) {
                    // Revert on failure
                    setInvoice(prev!);
                    console.error('Chyba pri ukladaní poznámky/zľavy:', err);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <SaveIcon sx={{ mr: 1 }} />
                Uložiť poznámku a zľavu
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e3f2fd',
          mb: 3,
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
            📄 Export faktúry
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                window.open(
                  `${API_URL}/invoices/${id}/pdf?withVat=${withVat}`,
                  '_blank',
                );
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(156,39,176,0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              📄 Stiahnuť PDF
            </Button>

            <FormControlLabel
              control={
                <Checkbox
                  checked={withVat}
                  onChange={(e) => setWithVat(e.target.checked)}
                  sx={{
                    '&.Mui-checked': {
                      color: '#1976d2',
                    },
                  }}
                />
              }
              label="Zobraziť ceny s DPH"
            />
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
