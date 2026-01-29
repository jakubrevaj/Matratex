'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReplayIcon from '@mui/icons-material/Replay';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import NotesIcon from '@mui/icons-material/Notes';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { alpha } from '@mui/material/styles';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

interface Delivery {
  id: number;
  delivery_number: string;
  delivery_date: string;
  customer: {
    id: number;
    podnik: string;
  };
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    order: {
      id: number;
      order_number: string;
    };
  }>;
  notes?: string;
  is_printed: boolean;
}

export default function DeliveryListPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delivery/list');
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data);
      } else {
        setError('Chyba pri načítaní dodávok');
      }
    } catch (err) {
      setError('Chyba pri načítaní dodávok');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleViewOrder = (orderId: number) => {
    window.open(`/orders/${orderId}`, '_blank');
  };

  // split funkcionalita odstránená – používajte existujúci endpoint v /order-items

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon color="warning" />
            Zoznam dodávok
          </Box>
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <HourglassEmptyIcon fontSize="small" />
            Načítavam dodávky...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon color="warning" />
            Zoznam dodávok
          </Box>
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchDeliveries} variant="contained" startIcon={<ReplayIcon />}>
          Skúsiť znovu
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          gutterBottom
          sx={{ color: 'warning.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LocalShippingIcon />
          Zoznam dodávok
        </Typography>
        <Button
          onClick={fetchDeliveries}
          variant="outlined"
          startIcon={<Refresh />}
        >
          Obnoviť
        </Button>
      </Box>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <EmptyState
              icon={<LocalShippingIcon fontSize="large" />}
              title="Žiadne dodávky"
              message="Zatiaľ neboli vytvorené žiadne dodávky."
            />
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {deliveries.map((delivery) => (
            <Grid item xs={12} md={6} lg={4} key={delivery.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        #{delivery.delivery_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(
                          new Date(delivery.delivery_date),
                          'dd.MM.yyyy HH:mm',
                          { locale: sk }
                        )}
                      </Typography>
                    </Box>
                    <Chip
                      label={delivery.is_printed ? 'Vytlačené' : 'Nové'}
                      color={delivery.is_printed ? 'success' : 'primary'}
                      size="small"
                    />
                  </Box>

                  {/* Customer */}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <PersonIcon fontSize="small" />
                    {delivery.customer.podnik}
                  </Typography>

                  {/* Items */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Inventory2Icon fontSize="small" />
                      Položky ({delivery.items.length}):
                    </Typography>
                    {delivery.items.slice(0, 3).map((item, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{ ml: 2, mb: 0.5 }}
                      >
                        • {item.product_name} ({item.quantity} ks)
                      </Typography>
                    ))}
                    {delivery.items.length > 3 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 2 }}
                      >
                        ... a {delivery.items.length - 3} ďalších
                      </Typography>
                    )}
                  </Box>

                  {/* Notes */}
                  {delivery.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotesIcon fontSize="small" />
                        {delivery.notes}
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      mt: 'auto',
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        const orderId = delivery.items[0]?.order.id;
                        if (orderId) handleViewOrder(orderId);
                      }}
                      disabled={!delivery.items[0]?.order.id}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                      startIcon={<OpenInNewIcon />}
                    >
                      Ísť na objednávku
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
