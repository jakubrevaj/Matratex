'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Chip,
  Button,
  Stack,
  Box,
  Grid,
  useTheme,
} from '@mui/material';
import { Refresh, Email, Payment, WarningAmber, MoneyOff, Assessment, ListAlt } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { API_URL } from '@/services/api';
import { getInvoiceStatusText, getInvoiceStatusColor } from '@/utils/statusHelpers';

type InvoicePaymentStatus = {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_price: number;
  issue_date: string;
  due_date: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'partially_paid';
  daysOverdue?: number;
  lastPaymentCheck?: string;
  lastReminderSent?: string;
};

export default function PaymentStatusPage() {
  const theme = useTheme();
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoicePaymentStatus[]>([]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/invoices/status`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Nepodarilo sa načítať faktúry');
    }
  };

  const sendReminder = async (invoiceId: number) => {
    try {
      const response = await axios.post(
        `${API_URL}/invoices/${invoiceId}/send-reminder`
      );

      if (response.data.sent) {
        toast.success('Upomienka odoslaná');
      } else {
        toast.error(
          `Upomienka sa nepodarila odoslať: ${response.data.message}`
        );
      }

      fetchInvoices(); // Refresh data
    } catch {
      toast.error('Nepodarilo sa odoslať upomienku');
    }
  };


  useEffect(() => {
    fetchInvoices();
  }, []);

  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const unpaidInvoices = invoices.filter((inv) => inv.status === 'unpaid');
  const totalOverdue = overdueInvoices.reduce(
    (sum, inv) => sum + inv.total_price,
    0
  );

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
          borderLeft: `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
        >
          <Payment />
          Sledovanie platieb faktúr
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Prehľad stavu platieb a automatické upomienky
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}` }}
          >
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmber />
                Po splatnosti
              </Typography>
              <Typography variant="h4" color="error">
                {overdueInvoices.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Celková suma: {totalOverdue.toFixed(2)} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}` }}
          >
            <CardContent>
              <Typography variant="h6" color="warning" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyOff />
                Nezaplatené
              </Typography>
              <Typography variant="h4" color="warning">
                {unpaidInvoices.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Čakajú na zaplatenie
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}` }}
          >
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                Celkovo
              </Typography>
              <Typography variant="h4" color="primary">
                {invoices.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Všetky faktúry
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchInvoices}
          sx={{ borderRadius: 2 }}
        >
          Obnoviť dáta
        </Button>
        <Button
          variant="outlined"
          startIcon={<Email />}
          onClick={async () => {
            try {
              const response = await axios.get(
                `${API_URL}/invoices/test-email`
              );
              if (response.data) {
                toast.success('Email pripojenie funguje');
              } else {
                toast.error('Email pripojenie nefunguje');
              }
            } catch {
              toast.error('Chyba pri testovaní email pripojenia');
            }
          }}
          sx={{ borderRadius: 2 }}
        >
          Test Email
        </Button>
      </Box>

      {/* Invoices Table */}
      <Card sx={{ borderRadius: 2, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}` }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ListAlt />
            Prehľad faktúr
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Číslo faktúry
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Zákazník</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Suma</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Dátum vystavenia
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Splatnosť</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stav</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Dni po splatnosti
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Akcie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>
                      {Number(invoice.total_price).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.issue_date).toLocaleDateString('sk-SK')}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.due_date).toLocaleDateString('sk-SK')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getInvoiceStatusText(invoice.status)}
                        color={getInvoiceStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.daysOverdue && invoice.daysOverdue > 0 ? (
                        <Typography color="error" variant="body2">
                          {invoice.daysOverdue} dní
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {invoice.status === 'overdue' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Email />}
                            onClick={() => sendReminder(invoice.id)}
                            sx={{ borderRadius: 1 }}
                          >
                            Upomienka
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Payment />}
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                          sx={{ borderRadius: 1 }}
                        >
                          Detail
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}
