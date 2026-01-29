'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrderItem } from '@/types';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Collapse,
  IconButton,
  Stack,
  Grid,
  Box,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import { API_URL } from '@/services/api';
import { getOrderStatusColor } from '@/utils/statusHelpers';

export default function HistoricalOrderDetailPage() {
  const theme = useTheme();
  const { id } = useParams();
  const [order, setOrder] = useState<{
    id: number;
    order_number: string;
    customer: { podnik: string; ico?: string } | null;
    customer_name?: string;
    ico?: string;
    issue_date: string;
    total_price: number;
    order_items: OrderItem[];
  } | null>(null);
  const [openRow, setOpenRow] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_URL}/historical/${id}`)
        .then((res) => setOrder(res.data))
        .catch((err) => {
          // Error handling - v produkcii by sa malo logovať do error service
          if (process.env.NODE_ENV === 'development') {
            console.error('Chyba pri načítaní detailu:', err);
          }
        });
    }
  }, [id]);

  if (!order) return <Typography sx={{ m: 4 }}>Načítavam...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ px: 4, py: 3 }}>
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
          Detail starej objednávky č. {order.order_number}
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
                  <strong>Zákazník:</strong> {order.customer_name || order.customer?.podnik || 'Neznámy'}
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
                  {new Date(order.issue_date).toLocaleDateString('sk-SK')}
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
                    {Number(order.total_price).toFixed(2)} €
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
                  <TableCell
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                  ></TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Názov
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Množstvo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Rozmery
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Cena/ks
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Spolu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Stav
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.order_items.map((item: OrderItem) => (
                  <React.Fragment key={item.id}>
                    <TableRow
                      sx={{
                        backgroundColor: getOrderStatusColor(
                          item.status || 'pending'
                        ),
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenRow(openRow === item.id ? null : item.id)
                          }
                        >
                          {openRow === item.id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity} ks</TableCell>
                      <TableCell>
                        {item.length}×{item.width}×{item.height} cm
                      </TableCell>
                      <TableCell>
                        {Number(item.price || item.total_price || 0).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        {(Number(item.price || item.total_price || 0) * item.quantity).toFixed(2)}{' '}
                        €
                      </TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor:
                              item.status === 'archived' ? 'grey.300' : 'success.light',
                            color:
                              item.status === 'archived' ? 'text.secondary' : 'success.main',
                          }}
                        >
                          {item.status === 'archived'
                            ? 'Archivovaná'
                            : 'Fakturovaná'}
                        </Box>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0 }}>
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
          mb: 3,
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
            <ArrowBackIcon />
            Navigácia
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/historical-orders"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              transition: 'all 0.2s ease',
            }}
            startIcon={<ArrowBackIcon />}
          >
            Späť na archív
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
