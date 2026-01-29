'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Assignment,
  Receipt,
  Build,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
  Dashboard as DashboardIcon,
  TrendingUp,
  BarChart as BarChartIcon,
  Assessment,
  ListAlt,
  History,
} from '@mui/icons-material';
// Import Recharts dynamically to avoid SSR issues
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
import {
  fetchDashboardMetrics,
  fetchSalesChart,
  fetchRecentActivity,
} from '@/services/api';
import { getStatusColorChip, getStatusLabelUniversal } from '@/utils/statusHelpers';

interface DashboardMetrics {
  overview: {
    totalOrders: number;
    totalInvoices: number;
    totalOrderItems: number;
    ordersThisMonth: number;
    invoicesThisMonth: number;
    revenueThisMonth: number;
  };
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
  };
  orderStatus: {
    pending: number;
    inProduction: number;
    completed: number;
  };
  invoiceStatus: {
    paid: number;
    unpaid: number;
    overdue: number;
  };
}

interface SalesChartData {
  month: string;
  revenue: number;
  orders: number;
}

interface RecentActivity {
  recentOrders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    created_at: string;
    status: string;
    total_price: number;
  }>;
  recentInvoices: Array<{
    id: number;
    invoice_number: string;
    customer_name: string;
    created_at: string;
    status: string;
    total_price: number;
  }>;
  recentCompletedItems: Array<{
    id: number;
    product_name: string;
    order_number: string;
    completed_at: string;
    quantity: number;
  }>;
}

export default function DashboardPage() {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<SalesChartData[]>([]);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, chartRes, activityRes] = await Promise.all([
        fetchDashboardMetrics(),
        fetchSalesChart(),
        fetchRecentActivity(),
      ]);

      if (metricsRes.success) {
        const raw = metricsRes.data;
        const mapped: DashboardMetrics = {
          overview: {
            totalOrders: raw.overview?.totalOrders ?? 0,
            totalInvoices: raw.overview?.totalInvoices ?? 0,
            totalOrderItems: raw.overview?.totalOrderItems ?? 0,
            ordersThisMonth: raw.overview?.ordersThisMonth ?? 0,
            invoicesThisMonth: raw.overview?.invoicesThisMonth ?? 0,
            revenueThisMonth: raw.financial?.monthlyRevenue ?? 0,
          },
          financial: {
            totalRevenue: raw.financial?.totalRevenue ?? 0,
            monthlyRevenue: raw.financial?.monthlyRevenue ?? 0,
          },
          orderStatus: {
            pending: raw.orderStatus?.pending ?? raw.orders?.pending ?? 0,
            inProduction:
              raw.orderStatus?.inProduction ?? raw.orders?.inProduction ?? 0,
            completed: raw.orderStatus?.completed ?? raw.orders?.completed ?? 0,
          },
          invoiceStatus: {
            paid: raw.invoiceStatus?.paid ?? raw.invoices?.paid ?? 0,
            unpaid: raw.invoiceStatus?.unpaid ?? raw.invoices?.unpaid ?? 0,
            overdue: raw.invoiceStatus?.overdue ?? raw.invoices?.overdue ?? 0,
          },
        };
        setMetrics(mapped);
      }
      if (chartRes.success) setChartData(chartRes.data);
      if (activityRes.success) setActivity(activityRes.data);
    } catch (err) {
      console.error('Chyba pri načítavaní dashboard dát:', err);
      setError('Nepodarilo sa načítať dashboard');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={loadDashboardData} variant="contained">
          Skúsiť znovu
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          borderLeft: `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <DashboardIcon />
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Prehľad kľúčových metrík a aktivít
        </Typography>
      </Box>

      {/* Hlavné metriky */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Celkové objednávky */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ 
                textAlign: 'center', 
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Assignment sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  {metrics.overview.totalOrders}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Celkom objednávok
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, color: '#a8ffa8', fontWeight: 600 }}
                >
                  +{metrics.overview.ordersThisMonth} tento mesiac
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Celkové faktúry */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ 
                textAlign: 'center', 
                height: '100%',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Receipt sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  {metrics.overview.totalInvoices}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Celkom faktúr
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, color: '#a8ffa8', fontWeight: 600 }}
                >
                  +{metrics.overview.invoicesThisMonth} tento mesiac
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Celkový príjem */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ 
                textAlign: 'center', 
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <AttachMoney sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  {metrics.financial.totalRevenue.toFixed(0)} €
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Celkový príjem
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, color: '#ffe6a8', fontWeight: 600 }}
                >
                  {metrics.overview.revenueThisMonth.toFixed(0)} € tento mesiac
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Dokončené položky */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ 
                textAlign: 'center', 
                height: '100%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <CheckCircle sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                <Typography
                  variant="h4"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  {metrics.overview.totalOrderItems}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Celkom položiek
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, color: '#a8e6ff', fontWeight: 600 }}
                >
                  {metrics.orderStatus.completed} dokončených
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Stav objednávok a faktúr */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Stav objednávok */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ListAlt />
                  Stav objednávok
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule color="warning" />
                      <Typography>Čakajúce</Typography>
                    </Box>
                    <Chip label={metrics.orderStatus.pending} color="warning" />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Build color="info" />
                      <Typography>Vo výrobe</Typography>
                    </Box>
                    <Chip
                      label={metrics.orderStatus.inProduction}
                      color="info"
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" />
                      <Typography>Dokončené</Typography>
                    </Box>
                    <Chip
                      label={metrics.orderStatus.completed}
                      color="success"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Stav faktúr */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Receipt />
                  Stav faktúr
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" />
                      <Typography>Zaplatené</Typography>
                    </Box>
                    <Chip label={metrics.invoiceStatus.paid} color="success" />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule color="warning" />
                      <Typography>Nezaplatené</Typography>
                    </Box>
                    <Chip
                      label={metrics.invoiceStatus.unpaid}
                      color="warning"
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning color="error" />
                      <Typography>Po splatnosti</Typography>
                    </Box>
                    <Chip label={metrics.invoiceStatus.overdue} color="error" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Grafy */}
      {chartData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Graf tržieb */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <TrendingUp />
                  Tržby po mesiacoch (€)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)} €`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      name="Tržby (€)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Graf počtu objednávok */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <BarChartIcon />
                  Počet objednávok
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill={theme.palette.success.main} name="Objednávky" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pie chart stavov */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Assessment />
                  Stav objednávok
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Čakajúce',
                          value: metrics.orderStatus.pending,
                          fill: '#ff9800',
                        },
                        {
                          name: 'Vo výrobe',
                          value: metrics.orderStatus.inProduction,
                          fill: '#2196f3',
                        },
                        {
                          name: 'Hotové',
                          value: metrics.orderStatus.completed,
                          fill: '#4caf50',
                        },
                      ]}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="value"
                    />
                    <Tooltip />
                    <Legend 
                      verticalAlign="bottom" 
                      height={50}
                      formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Receipt />
                  Stav faktúr
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Zaplatené', 
                          value: metrics.invoiceStatus.paid,
                          fill: '#4caf50',
                        },
                        {
                          name: 'Nezaplatené',
                          value: metrics.invoiceStatus.unpaid,
                          fill: '#ff9800',
                        },
                        {
                          name: 'Po splatnosti',
                          value: metrics.invoiceStatus.overdue,
                          fill: '#f44336',
                        },
                      ]}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      dataKey="value"
                    />
                    <Tooltip />
                    <Legend 
                      verticalAlign="bottom" 
                      height={50}
                      formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Posledná aktivita */}
      {activity && (
        <Grid container spacing={3}>
          {/* Posledné objednávky */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <History />
                  Posledné objednávky
                </Typography>
                <List>
                  {activity.recentOrders.map((order) => (
                    <ListItem 
                      key={order.id} 
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Assignment color="primary" fontSize="medium" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}
                            >
                              {order.order_number}
                            </Typography>
                            <Chip
                              label={getStatusLabelUniversal(order.status)}
                              color={getStatusColorChip(order.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{ display: 'block', fontSize: '0.875rem' }}
                            >
                              {order.customer_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'primary.main' }}
                            >
                              {Number(order.total_price).toFixed(2)} €
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push('/orders')}
                  sx={{ mt: 2 }}
                >
                  Zobraziť všetky objednávky
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Posledné faktúry */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Receipt />
                  Posledné faktúry
                </Typography>
                <List>
                  {activity.recentInvoices.map((invoice) => (
                    <ListItem 
                      key={invoice.id} 
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Receipt color="primary" fontSize="medium" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}
                            >
                              {invoice.invoice_number}
                            </Typography>
                            <Chip
                              label={getStatusLabelUniversal(invoice.status)}
                              color={getStatusColorChip(invoice.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{ display: 'block', fontSize: '0.875rem' }}
                            >
                              {invoice.customer_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'primary.main' }}
                            >
                              {Number(invoice.total_price).toFixed(2)} €
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push('/invoices')}
                  sx={{ mt: 2 }}
                >
                  Zobraziť všetky faktúry
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Dokončené položky */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CheckCircle />
                  Dokončené položky
                </Typography>
                <List>
                  {activity.recentCompletedItems.map((item) => (
                    <ListItem 
                      key={item.id} 
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircle color="success" fontSize="medium" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold', fontSize: '0.95rem', mb: 0.5 }}
                          >
                            {item.product_name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{ display: 'block', fontSize: '0.875rem' }}
                            >
                              Objednávka: {item.order_number}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'success.main' }}
                            >
                              Množstvo: {item.quantity}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push('/production')}
                  sx={{ mt: 2 }}
                >
                  Zobraziť produkciu
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
