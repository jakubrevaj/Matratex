'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupIcon from '@mui/icons-material/Group';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ClearIcon from '@mui/icons-material/Clear';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import StraightenIcon from '@mui/icons-material/Straighten';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import { getOrderStatusText, getOrderStatusColor } from '@/utils/statusHelpers';

interface Customer {
  id: number;
  podnik: string | null;
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  status: string;
  price: string;
  material_name: string;
  order?: { id: number; order_number?: string };
}

export default function DeliveryPage() {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [itemStatusFilter, setItemStatusFilter] = useState('');

  // Custom items state
  const [customItems, setCustomItems] = useState<
    { name: string; quantity: number; dimensions?: string; info?: string }[]
  >([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState<number>(1);
  const [customItemDimensions, setCustomItemDimensions] = useState('');
  const [customItemInfo, setCustomItemInfo] = useState('');

  // Filtered data
  const filteredCustomers = customers.filter((customer) =>
    customer.podnik?.toLowerCase().includes(customerFilter.toLowerCase()),
  );

  const filteredOrderItems = orderItems
    .filter(
      (item) =>
        item.product_name.toLowerCase().includes(productFilter.toLowerCase()) ||
        item.material_name.toLowerCase().includes(productFilter.toLowerCase()),
    )
    .filter((item) =>
      itemStatusFilter ? item.status === itemStatusFilter : true,
    );

  // Load real data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        console.log('Fetching customers...');
        const response = await fetch('/api/delivery/customers-with-items', {
          cache: 'no-store',
        });
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Customers data:', data);
          console.log('Number of customers:', data.length);
          setCustomers(data);
        } else {
          console.error('Failed to fetch customers, status:', response.status);
          setError('Nepodarilo sa načítať zákazníkov');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Chyba pri načítavaní zákazníkov');
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedItems([]);

    try {
      const response = await fetch(
        `/api/delivery/customer/${customer.id}/items`,
      );
      if (response.ok) {
        const data = await response.json();
        setOrderItems(data);
      } else {
        console.error('Failed to fetch order items');
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const handleItemToggle = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredOrderItems.map((i) => i.id);
    setSelectedItems(ids);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      setError('Zadajte názov položky');
      return;
    }
    if (customItemQuantity <= 0) {
      setError('Počet musí byť väčší ako 0');
      return;
    }

    setCustomItems([
      ...customItems,
      {
        name: customItemName,
        quantity: customItemQuantity,
        dimensions: customItemDimensions || undefined,
        info: customItemInfo || undefined,
      },
    ]);
    setCustomItemName('');
    setCustomItemQuantity(1);
    setCustomItemDimensions('');
    setCustomItemInfo('');
    setError('');
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleCreateDelivery = async () => {
    if (
      !selectedCustomer ||
      (selectedItems.length === 0 && customItems.length === 0)
    ) {
      setError('Vyberte zákazníka a aspoň jednu položku');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create delivery
      const deliveryResponse = await fetch('/api/delivery/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          itemIds: selectedItems,
          notes: deliveryNotes,
          customItems: customItems,
        }),
      });

      if (deliveryResponse.ok) {
        const delivery = await deliveryResponse.json();

        // Generate PDF and open in browser
        const pdfResponse = await fetch(
          `/api/delivery/generate-pdf/${delivery.id}`,
        );
        if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(pdfBlob);

          // Open PDF in new tab instead of downloading
          window.open(url, '_blank');

          // Clean up
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        }

        setSelectedItems([]);
        setDeliveryNotes('');
        setSelectedCustomer(null);
        setOrderItems([]);
      } else {
        setError('Chyba pri vytváraní delivery');
      }
    } catch {
      setError('Chyba pri vytváraní delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          borderLeft: `3px solid ${theme.palette.warning.main}`,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: '#e65100',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            fontSize: '2rem',
          }}
        >
          <LocalShippingIcon sx={{ fontSize: '2.5rem' }} />
          Dodací list
        </Typography>
        <Typography variant="body1" sx={{ color: '#555', fontSize: '1.1rem' }}>
          Vytvorte dodávku pre vybraného zákazníka
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Customer Selection */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              boxShadow: `0 6px 20px ${alpha(
                theme.palette.common.black,
                0.12,
              )}`,
              borderRadius: 3,
              borderTop: `5px solid ${theme.palette.primary.main}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 8px 25px ${alpha(
                  theme.palette.common.black,
                  0.15,
                )}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#1565c0',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '1.5rem',
                  }}
                >
                  <GroupIcon sx={{ fontSize: '1.8rem' }} />
                  Výber zákazníka
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: '600',
                  }}
                >
                  ({filteredCustomers.length} z {customers.length})
                </Typography>
              </Box>

              {/* Customer Filter */}
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  backgroundColor: '#fafafa',
                  border: '1px solid #eee',
                  borderRadius: 2,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Hľadať zákazníka..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      padding: '14px 14px',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: '1.5rem', color: '#1565c0' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Loading state */}
              {loadingCustomers && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              )}

              {/* Empty state for customers */}
              {!loadingCustomers && filteredCustomers.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Nenašli sa žiadni zákazníci podľa filtra.
                </Alert>
              )}

              {!loadingCustomers && (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {filteredCustomers.map((customer) => (
                    <Button
                      key={customer.id}
                      variant={
                        selectedCustomer?.id === customer.id
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => handleCustomerSelect(customer)}
                      sx={{
                        justifyContent: 'flex-start',
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight:
                          selectedCustomer?.id === customer.id ? 'bold' : '600',
                        fontSize: '1.1rem',
                        py: 2,
                        px: 2.5,
                        transition: 'all 0.3s ease',
                        boxShadow:
                          selectedCustomer?.id === customer.id
                            ? '0 4px 12px rgba(25,118,210,0.4)'
                            : '0 2px 4px rgba(0,0,0,0.1)',
                        borderWidth:
                          selectedCustomer?.id === customer.id ? '0' : '2px',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow:
                            selectedCustomer?.id === customer.id
                              ? '0 6px 16px rgba(25,118,210,0.5)'
                              : '0 4px 8px rgba(0,0,0,0.15)',
                          backgroundColor:
                            selectedCustomer?.id === customer.id
                              ? '#1565c0'
                              : '#f5f5f5',
                        },
                      }}
                    >
                      {customer.podnik || 'Bez názvu'}
                    </Button>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        {selectedCustomer && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: `0 6px 20px ${alpha(
                  theme.palette.common.black,
                  0.12,
                )}`,
                borderRadius: 3,
                borderTop: `5px solid ${theme.palette.success.main}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 25px ${alpha(
                    theme.palette.common.black,
                    0.15,
                  )}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#2e7d32',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '1.5rem',
                    }}
                  >
                    <Inventory2Icon sx={{ fontSize: '1.8rem' }} />
                    Položky objednávky - {selectedCustomer.podnik}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: '1rem',
                      fontWeight: '600',
                    }}
                  >
                    ({filteredOrderItems.length} z {orderItems.length})
                  </Typography>
                </Box>

                {/* Product Filter */}
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    backgroundColor: 'background.default',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Hľadať produkt alebo materiál..."
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        padding: '14px 14px',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search
                            sx={{ fontSize: '1.5rem', color: '#2e7d32' }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Status Filter + Selection actions */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: 180,
                      '& .MuiInputLabel-root': {
                        fontSize: '0.9rem',
                        fontWeight: '600',
                      },
                      '& .MuiSelect-select': {
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        py: 1,
                      },
                    }}
                  >
                    <InputLabel>Stav položiek</InputLabel>
                    <Select
                      value={itemStatusFilter}
                      label="Stav položiek"
                      onChange={(e) => setItemStatusFilter(e.target.value)}
                    >
                      <MenuItem value="" sx={{ fontSize: '0.85rem' }}>
                        Všetky
                      </MenuItem>
                      <MenuItem value="pending" sx={{ fontSize: '0.85rem' }}>
                        Čakajúca
                      </MenuItem>
                      <MenuItem
                        value="in-production"
                        sx={{ fontSize: '0.85rem' }}
                      >
                        Vo výrobe
                      </MenuItem>
                      <MenuItem value="completed" sx={{ fontSize: '0.85rem' }}>
                        Hotová
                      </MenuItem>
                      <MenuItem value="invoiced" sx={{ fontSize: '0.85rem' }}>
                        Fakturovaná
                      </MenuItem>
                      <MenuItem value="archived" sx={{ fontSize: '0.85rem' }}>
                        Archivovaná
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={handleSelectAllFiltered}
                    disabled={filteredOrderItems.length === 0}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      px: 2,
                      py: 0.75,
                      backgroundColor: '#2e7d32',
                      color: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.25)',
                      '&:hover': {
                        backgroundColor: '#1b5e20',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(46, 125, 50, 0.35)',
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        backgroundColor: '#9e9e9e',
                      },
                    }}
                    startIcon={<DoneAllIcon sx={{ fontSize: '1rem' }} />}
                  >
                    Vybrať všetko
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearSelection}
                    disabled={selectedItems.length === 0}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      px: 2,
                      py: 0.75,
                      borderColor: '#d32f2f',
                      borderWidth: '2px',
                      color: '#d32f2f',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        borderColor: '#c62828',
                        borderWidth: '2px',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        borderWidth: '2px',
                      },
                    }}
                    startIcon={<ClearIcon sx={{ fontSize: '1rem' }} />}
                  >
                    Zrušiť výber
                  </Button>
                </Stack>

                {/* Status legend */}
                <Box
                  sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}
                >
                  {[
                    { status: 'pending', t: 'Čakajúca' },
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
                          width: 16,
                          height: 16,
                          borderRadius: '3px',
                          backgroundColor: getOrderStatusColor(s.status),
                          border: '1px solid rgba(0,0,0,0.15)',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                        }}
                      >
                        {s.t}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Summary bar */}
                {selectedItems.length > 0 && (
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      mb: 2,
                      p: 1.5,
                      backgroundColor: '#e3f2fd',
                      borderRadius: 2,
                      border: `2px solid #1565c0`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(21, 101, 192, 0.15)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlaylistAddCheckIcon
                        sx={{
                          color: '#1565c0',
                          fontSize: '1.2rem',
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: '600',
                          color: '#1565c0',
                          fontSize: '0.95rem',
                        }}
                      >
                        Vybrané položky: {selectedItems.length}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Empty state for items */}
                {filteredOrderItems.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Žiadne položky nevyhovujú filtru.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredOrderItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 3,
                        border: '2px solid',
                        borderColor: selectedItems.includes(item.id)
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        borderRadius: 3,
                        backgroundColor: selectedItems.includes(item.id)
                          ? alpha(theme.palette.primary.main, 0.08)
                          : theme.palette.background.paper,
                        transition: 'all 0.3s ease',
                        boxShadow: selectedItems.includes(item.id)
                          ? `0 4px 12px ${alpha(
                              theme.palette.primary.main,
                              0.2,
                            )}`
                          : `0 2px 4px ${alpha(
                              theme.palette.common.black,
                              0.05,
                            )}`,
                        '&:hover': {
                          backgroundColor: selectedItems.includes(item.id)
                            ? alpha(theme.palette.primary.main, 0.16)
                            : theme.palette.background.default,
                          boxShadow: selectedItems.includes(item.id)
                            ? `0 6px 16px ${alpha(
                                theme.palette.primary.main,
                                0.3,
                              )}`
                            : `0 4px 8px ${alpha(
                                theme.palette.common.black,
                                0.1,
                              )}`,
                          transform: 'translateY(-2px)',
                          borderColor: selectedItems.includes(item.id)
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                        },
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemToggle(item.id)}
                        style={{
                          marginTop: '6px',
                          transform: 'scale(1.4)',
                          accentColor: theme.palette.primary.main,
                          cursor: 'pointer',
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        {/* Hlavný názov produktu */}
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            color: '#1565c0',
                            mb: 1.5,
                            fontSize: '1.4rem',
                          }}
                        >
                          {item.product_name}
                        </Typography>

                        {/* Objednávka */}
                        {item.order?.id && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#555',
                                fontSize: '1rem',
                                fontWeight: '500',
                              }}
                            >
                              <CategoryIcon fontSize="medium" />
                              Objednávka:
                            </Box>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '1rem',
                                lineHeight: 1.4,
                                color: '#1565c0',
                                fontWeight: 'bold',
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.15,
                                ),
                                border: `2px solid ${alpha(
                                  theme.palette.primary.main,
                                  0.4,
                                )}`,
                              }}
                            >
                              {item.order?.order_number ?? 'bez čísla'}
                            </Box>
                            <Button
                              size="medium"
                              variant="outlined"
                              onClick={() => {
                                if (item.order?.id) {
                                  window.open(
                                    `/orders/${item.order.id}`,
                                    '_blank',
                                  );
                                }
                              }}
                              disabled={!item.order?.id}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2,
                                py: 0.75,
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: '#1565c0',
                                borderColor: '#1565c0',
                                borderWidth: '2px',
                                backgroundColor: 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 6px rgba(25,118,210,0.2)',
                                  borderWidth: '2px',
                                },
                                '&:disabled': {
                                  opacity: 0.5,
                                },
                              }}
                            >
                              Objednávka
                            </Button>
                          </Box>
                        )}

                        {/* Materiál */}
                        {item.material_name && (
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#555',
                              mb: 1.5,
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '1rem',
                              fontWeight: '500',
                            }}
                          >
                            <CategoryIcon fontSize="medium" />
                            Materiál: {item.material_name}
                          </Typography>
                        )}

                        {/* Rozmery a množstvo */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 3,
                            mb: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#2e7d32',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '1.1rem',
                              fontWeight: '600',
                            }}
                          >
                            <StraightenIcon fontSize="medium" />
                            Rozmery: {item.length} × {item.width} ×{' '}
                            {item.height} cm
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#1565c0',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '1.1rem',
                            }}
                          >
                            <Inventory2Icon fontSize="medium" />
                            Množstvo: {item.quantity} ks
                          </Typography>
                        </Box>

                        {/* Cena a stav */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 3,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#c62828',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                              padding: '6px 12px',
                              backgroundColor: alpha(
                                theme.palette.error.main,
                                0.15,
                              ),
                              borderRadius: '8px',
                              border: `2px solid ${alpha(
                                theme.palette.error.main,
                                0.4,
                              )}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <AttachMoneyIcon fontSize="medium" />
                            Cena: {item.price} €
                          </Typography>
                          <Box
                            sx={{
                              padding: '10px 20px',
                              borderRadius: '25px',
                              fontSize: '1rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              backgroundColor: getOrderStatusColor(item.status),
                              color: '#333',
                              border: '2px solid rgba(0,0,0,0.15)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              letterSpacing: '0.5px',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                              },
                            }}
                          >
                            {getOrderStatusText(item.status)}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Delivery Creation */}
        {selectedCustomer &&
          (selectedItems.length > 0 || customItems.length > 0) && (
            <Grid item xs={12}>
              <Card
                sx={{
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  borderRadius: 3,
                  borderTop: '5px solid #ff9800',
                  backgroundColor: '#fff8e1',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      color: '#f57c00',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '1.5rem',
                      mb: 3,
                    }}
                  >
                    <AddIcon sx={{ fontSize: '1.8rem' }} />
                    Vytvoriť dodávku
                  </Typography>

                  {/* Custom Items Section */}
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      backgroundColor: '#fff3e0',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: '#f57c00', fontWeight: 'bold' }}
                    >
                      Pridať vlastnú položku
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Názov položky"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCustomItem();
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Informácie"
                          value={customItemInfo}
                          onChange={(e) => setCustomItemInfo(e.target.value)}
                          placeholder="napr. materiál, farba..."
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Rozmery"
                          value={customItemDimensions}
                          onChange={(e) =>
                            setCustomItemDimensions(e.target.value)
                          }
                          placeholder="napr. 100x200x20 cm"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Počet"
                          type="number"
                          value={customItemQuantity}
                          onChange={(e) =>
                            setCustomItemQuantity(Number(e.target.value))
                          }
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleAddCustomItem}
                          sx={{
                            height: '48px',
                            backgroundColor: '#4caf50',
                            '&:hover': {
                              backgroundColor: '#388e3c',
                            },
                          }}
                        >
                          Pridať položku
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Display added custom items */}
                    {customItems.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: 'bold' }}
                        >
                          Pridané vlastné položky:
                        </Typography>
                        {customItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.5,
                              mb: 1,
                              backgroundColor: '#fff',
                              borderRadius: 1,
                              border: '1px solid #ddd',
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 'bold' }}
                              >
                                {item.name}
                              </Typography>
                              {item.info && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Info: {item.info}
                                </Typography>
                              )}
                              {item.dimensions && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Rozmery: {item.dimensions}
                                </Typography>
                              )}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Počet: {item.quantity} ks
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleRemoveCustomItem(index)}
                            >
                              Odstrániť
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Poznámky k dodávke"
                        multiline
                        rows={4}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                            fontWeight: '600',
                          },
                          '& .MuiInputBase-input': {
                            fontSize: '1rem',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleCreateDelivery}
                        disabled={loading}
                        sx={{
                          backgroundColor: '#f57c00',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#e65100',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 10px 24px rgba(245, 124, 0, 0.5)',
                          },
                          borderRadius: 3,
                          px: 6,
                          py: 2.5,
                          fontSize: '1.4rem',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          boxShadow: '0 6px 16px rgba(245, 124, 0, 0.4)',
                          transition: 'all 0.3s ease',
                          letterSpacing: '0.5px',
                          '&:disabled': {
                            opacity: 0.6,
                            transform: 'none',
                            backgroundColor: '#9e9e9e',
                          },
                        }}
                        startIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <LocalShippingIcon sx={{ fontSize: '1.8rem' }} />
                          )
                        }
                      >
                        {loading ? 'Vytváram...' : 'Vytvoriť dodávku'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
      </Grid>
    </Container>
  );
}
